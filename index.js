const sudoBlock = require("sudo-block");
const globalDirectories = require("global-dirs");
const path = require("path");
const { readPackageUpAsync } = require("read-pkg-up");
const envPathsGenerator = require("env-paths");
const fse = require("fs-extra");
const envPaths = envPathsGenerator("arvis-nodejs");
const link = require("./lib/link");
const { checkFileExists } = require("./lib/util");

// Prevent running as `sudo`
sudoBlock();

const link = async (opts) => {
  const pkgResult = await readPackageUpAsync();
  const pkg = pkgResult.packageJson;
  const packageName = pkg.name;

  const src = `${globalDirectories.npm.packages}${path.sep}${packageName}`;

  const workflowJsonPath = `${src}${path.sep}arvis-workflow.json`;
  const pluginJsonPath = `${src}${path.sep}arvis-plugin.json`;

  const isWorkflow = await checkFileExists(workflowJsonPath);
  const isPlugin = await checkFileExists(pluginJsonPath);

  try {
    if (!isWorkflow && !isPlugin) {
      console.error("Not Arvis extension!");
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
    const dest = `${envPaths.data}${path.sep}${type}${bundleId}`;

    link(src, dest);
  } catch (err) {
    console.error("Not Arvis extension or config file format is invalid");
    process.exit(1);
  }
};

const unlink = () => {};

module.exports = {
  link,
  unlink,
};
