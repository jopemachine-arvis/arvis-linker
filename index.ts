import sudoBlock from 'sudo-block';
import globalDirectories from 'global-dirs';
import path from 'path';
import readPkgUp from 'read-pkg-up';
import envPathsGenerator from 'env-paths';
import fse from 'fs-extra';
import { validate } from 'arvis-extension-validator';
import pathExists from 'path-exists';
import isAdmin from 'is-admin';
import link from './lib/link';
import { readJson5 } from './lib/readJson5';
import { arvisRenewExtensionFlagFilePath } from './lib/path';
import findUnvalidSymlink from './lib/findUnvalidSymlink';
import { getUserConfigs, applyUserConfigs } from './lib/userConfig';
import { forceReload } from './lib/extensionReload';

const envPaths = envPathsGenerator('arvis');

// Prevent running as `sudo`
sudoBlock();

const linkArvisGlobalModule = async (): Promise<void> => {
  if (process.platform === 'win32') {
    const hasAdminPermission = await isAdmin();
    if (!hasAdminPermission) throw new Error('Run command by admin permission!');
  }

  const pkgResult = await readPkgUp();
  if (!pkgResult) throw new Error('Error: extension\'s package.json not found!');
  const packageName = pkgResult.pkg.name;

  const src = path.resolve(globalDirectories.npm.packages, packageName);

  if (!fse.pathExistsSync(src)) {
    throw new Error(`Module not exists in global package, '${src}'`);
  }

  const workflowJsonPath = path.resolve(src, 'arvis-workflow.json');
  const pluginJsonPath = path.resolve(src, 'arvis-plugin.json');

  const isWorkflow = await pathExists(workflowJsonPath);
  const isPlugin = await pathExists(pluginJsonPath);

  if (!isWorkflow && !isPlugin) {
    throw new Error('This package seems to be not Arvis extension!');
  }

  const config = await readJson5(isWorkflow ? workflowJsonPath : pluginJsonPath) as any;
  const type = isWorkflow ? 'workflow' : 'plugin';

  if (config.platform && !config.platform.includes(process.platform)) {
    throw new Error(`This extension does not supports '${process.platform}'!\nCheck the extension info on '${config.webAddress}'.`);
  }

  const { creator, name } = config;
  const bundleId = `${creator}.${name}`;

  const { errorMsg, valid: extensionValid } = validate(
    config,
    type,
    {
      strict: false
    }
  );

  if (!extensionValid) {
    throw new Error(
      `It seems arvis extension json format is invalid.\n\n${errorMsg}`
    );
  }

  const dest = path.resolve(envPaths.data, `${type}s`, bundleId);

  try {
    await link(src, dest);
  } catch (err) {
    throw new Error(`Symlink Error:\n\n${err}`);
  }

  const migratedConfig = applyUserConfigs((await getUserConfigs())[bundleId], config);

  await fse.writeJSON(path.resolve(dest, `arvis-${type}.json`), migratedConfig, { encoding: 'utf-8', spaces: 4 });

  await forceReload(bundleId, type);
};

const unlinkArvisGlobalModule = async () => {
  const workflowDest = path.resolve(envPaths.data, 'workflows');
  const pluginDest = path.resolve(envPaths.data, 'plugins');

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
