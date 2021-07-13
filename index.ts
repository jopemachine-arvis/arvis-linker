import sudoBlock from "sudo-block";
import globalDirectories from "global-dirs";
import path from "path";
import readPkgUp from "read-pkg-up";
import envPathsGenerator from "env-paths";
import fse from "fs-extra";
import { validate } from "arvis-extension-validator";
import link from "./lib/link";
import { arvisRenewExtensionFlagFilePath } from "./lib/path";
import { checkFileExists } from "./lib/util";
import findUnvalidSymlink from './lib/findUnvalidSymlink';
import { getUserConfigs, applyUserConfigs } from './lib/userConfig';
import { forceReload } from './lib/extensionReload';

const envPaths = envPathsGenerator("arvis");

// Prevent running as `sudo`
sudoBlock();

const linkArvisGlobalModule = async (): Promise<void> => {
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

  const config = await fse.readJSON(isWorkflow ? workflowJsonPath : pluginJsonPath);
  const type = isWorkflow ? "workflow" : "plugin";

  if (config.platform && !config.platform.includes(process.platform)) {
    throw new Error(`This extension does not supports '${process.platform}'!\nCheck the extension info on '${config.webAddress}'.`);
  }

  const { creator, name } = config;
  const bundleId = `${creator}.${name}`;

  const { errorMsg, valid: extensionValid } = validate(
    config,
    type
  );

  if (!extensionValid) {
    throw new Error(
      `It seems arvis extension json format is invalid.\n\n${errorMsg}`
    );
  }

  const dest = path.resolve(envPaths.data, `${type}s`, bundleId);
  await link(src, dest);

  const migratedConfig = applyUserConfigs((await getUserConfigs())[bundleId], config);
  await fse.writeJSON(path.resolve(dest, `arvis-${type}.json`), migratedConfig, { encoding: 'utf-8', spaces: 4 });

  // To do:: Below logic needs to be removed after chokidar's symlink issue is resolved
  // Because followSymlink is false now, below logic is needed for now.
  await forceReload(bundleId, type);
};

const unlinkArvisGlobalModule = async () => {
  const workflowDest = path.resolve(envPaths.data, "workflows");
  const pluginDest = path.resolve(envPaths.data, "plugins");

  const unvalidWorkflowSymlinks = await findUnvalidSymlink(workflowDest, 'workflow');
  const unvalidPluginSymlinks = await findUnvalidSymlink(pluginDest, 'plugin');

  await Promise.all([...unvalidWorkflowSymlinks, ...unvalidPluginSymlinks].map(async (invalidPath) => {
    if (invalidPath) {
      await fse.remove(invalidPath);
    }
  }));

  if (unvalidWorkflowSymlinks.length > 0) {
    console.log(`Following unvalidWorkflowSymlinks were removed.\n\n${unvalidWorkflowSymlinks.join('\n')}`);
    console.log('\n');
  }

  if (unvalidPluginSymlinks.length > 0) {
    console.log(`Following unvalidPluginSymlinks were removed.\n\n${unvalidPluginSymlinks.join('\n')}`);
    console.log('\n');
  }

  fse.writeFileSync(arvisRenewExtensionFlagFilePath, '');
};

export { linkArvisGlobalModule, unlinkArvisGlobalModule };
