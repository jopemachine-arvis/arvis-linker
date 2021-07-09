import envPathsGenerator from 'env-paths';
import path from 'path';

const envPaths = envPathsGenerator('arvis');
const coreModuleEnvPaths = envPathsGenerator('arvis-core');

const installedDataPath = envPaths.data;
const arvisRenewExtensionFlagFilePath = path.resolve(installedDataPath, 'arvis-extension-renew');
const userConfigPath = path.resolve(coreModuleEnvPaths.config, 'user-configs.json');

export {
  arvisRenewExtensionFlagFilePath,
  installedDataPath,
  userConfigPath,
};