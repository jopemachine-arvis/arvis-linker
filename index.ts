import sudoBlock from "sudo-block";
import globalDirectories from "global-dirs";
import path from "path";
import readPkgUp from "read-pkg-up";
import envPathsGenerator from "env-paths";
import fse from "fs-extra";
const envPaths = envPathsGenerator("arvis");
import link from "./lib/link";
import { checkFileExists } from "./lib/util";
import execa from "execa";
import { validate } from "@jopemachine/arvis-extension-validator";

// Prevent running as `sudo`
sudoBlock();

const linkArvisGlobalModule = async () => {
  const pkgResult = await readPkgUp();
  if (!pkgResult) throw new Error("Error: package.json not found!");
  const packageName = pkgResult.pkg.name;

  const src = path.resolve(globalDirectories.npm.packages, packageName);

  if (!fse.pathExistsSync(src)) {
    throw new Error(`Module not exists in global package, '${src}'`);
  }

  const workflowJsonPath = path.resolve(src, "arvis-workflow.json");
  const pluginJsonPath = path.resolve(src, "arvis-plugin.json");

  const isWorkflow = await checkFileExists(workflowJsonPath);
  const isPlugin = await checkFileExists(pluginJsonPath);

  try {
    if (!isWorkflow && !isPlugin) {
      console.error("This package seems to be not Arvis extension!");
      process.exit(1);
    }

    let config;
    let type: "workflows" | "plugins";

    if (isWorkflow) {
      type = "workflows";
      config = await fse.readJSON(workflowJsonPath);
    } else if (isPlugin) {
      type = "plugins";
      config = await fse.readJSON(pluginJsonPath);
    }

    const { createdby, name } = config;
    const bundleId = `@${createdby}.${name}`;

    const { errorMsg, valid: extensionValid } = validate(
      config,
      isWorkflow ? "workflow" : "plugin"
    );

    if (!extensionValid) {
      console.error(errorMsg);
      throw new Error("It seems arvis extension json file is invalid");
    }

    const dest = path.resolve(envPaths.data, type!, bundleId);
    link(src, dest);
  } catch (err) {
    console.error("Not Arvis extension or config file format is invalid");
    process.exit(1);
  }
};

const unlinkArvisGlobalModule = async () => {
  const workflowDest = path.resolve(envPaths.data, "workflows");
  const pluginDest = path.resolve(envPaths.data, "plugins");

  // Remove All broken symlinks
  execa.commandSync(
    `find -L . -name . -o -type d -prune -o -type l -exec rm {} +`,
    { cwd: workflowDest }
  );
  execa.commandSync(
    `find -L . -name . -o -type d -prune -o -type l -exec rm {} +`,
    { cwd: pluginDest }
  );
};

export { linkArvisGlobalModule, unlinkArvisGlobalModule };
