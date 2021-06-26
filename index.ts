import sudoBlock from "sudo-block";
import globalDirectories from "global-dirs";
import path from "path";
import readPkgUp from "read-pkg-up";
import envPathsGenerator from "env-paths";
import fse from "fs-extra";
const envPaths = envPathsGenerator("arvis");
import link from "./lib/link";
import { renewFilePath } from "./lib/path";
import { checkFileExists } from "./lib/util";
import execa from "execa";
import { validate } from "arvis-extension-validator";

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

  if (!isWorkflow && !isPlugin) {
    throw new Error("This package seems to be not Arvis extension!");
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

  if (config.platform && !config.platform.includes(process.platform)) {
    throw new Error(`This extension does not supports '${process.platform}'!`);
  }

  const { creator, name } = config;
  const bundleId = `${creator}.${name}`;

  const { errorMsg, valid: extensionValid } = validate(
    config,
    isWorkflow ? "workflow" : "plugin"
  );

  if (!extensionValid) {
    throw new Error(
      `It seems arvis extension json format is invalid\n\n${errorMsg}`
    );
  }

  const dest = path.resolve(envPaths.data, type!, bundleId);
  link(src, dest);
};

const unlinkArvisGlobalModule = async () => {
  const workflowDest = path.resolve(envPaths.data, "workflows");
  const pluginDest = path.resolve(envPaths.data, "plugins");

  if (process.platform !== "win32") {
    // Remove All broken symlinks
    execa.commandSync(
      `find -L . -name . -o -type d -prune -o -type l -exec rm {} +`,
      { cwd: workflowDest }
    );
    execa.commandSync(
      `find -L . -name . -o -type d -prune -o -type l -exec rm {} +`,
      { cwd: pluginDest }
    );
  }

  fse.writeFileSync(renewFilePath, '');
};

export { linkArvisGlobalModule, unlinkArvisGlobalModule };
