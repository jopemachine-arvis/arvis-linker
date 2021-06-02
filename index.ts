import sudoBlock from "sudo-block";
import globalDirectories from "global-dirs";
import path from "path";
import readPkgUp from "read-pkg-up";
import envPathsGenerator from "env-paths";
import fse from "fs-extra";
const envPaths = envPathsGenerator("arvis");
import link from "./lib/link";
import { checkFileExists } from "./lib/util";
import execa from 'execa';

// Prevent running as `sudo`
sudoBlock();

const linkArvisGlobalModule = async () => {
  const pkgResult = await readPkgUp();
  if (!pkgResult) throw new Error('Error: package.json not found!');
  const packageName = pkgResult.pkg.name;

  const src = `${globalDirectories.npm.packages}${path.sep}${packageName}`;

  if (!fse.pathExistsSync(src)) {
    throw new Error(`Module not exists in global package, '${src}'`);
  }

  const workflowJsonPath = `${src}${path.sep}arvis-workflow.json`;
  const pluginJsonPath = `${src}${path.sep}arvis-plugin.json`;

  const isWorkflow = await checkFileExists(workflowJsonPath);
  const isPlugin = await checkFileExists(pluginJsonPath);

  try {
    if (!isWorkflow && !isPlugin) {
      console.error("This package seems to be not Arvis extension!");
      process.exit(1);
    }

    let config;
    let type;

    if (isWorkflow) {
      type = "workflows";
      config = await fse.readJSON(workflowJsonPath);
    } else if (isPlugin) {
      type = "plugins";
      config = await fse.readJSON(pluginJsonPath);
    }

    const { bundleId } = config;
    const dest = `${envPaths.data}${path.sep}${type}${path.sep}${bundleId}`;

    link(src, dest);
  } catch (err) {
    console.error("Not Arvis extension or config file format is invalid");
    process.exit(1);
  }
};

const unlinkArvisGlobalModule = async () => {
  const workflowDest = `${envPaths.data}${path.sep}${"workflows"}`;
  const pluginDest = `${envPaths.data}${path.sep}${"plugins"}`;

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

export {
  linkArvisGlobalModule,
  unlinkArvisGlobalModule,
};
