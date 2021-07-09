import envPathsGenerator from 'env-paths';
import path from 'path';

const envPaths = envPathsGenerator('arvis');

const installedDataPath = envPaths.data;
const arvisRenewExtensionFlagFilePath = path.resolve(installedDataPath, 'arvis-extension-renew');
const userConfigPath = path.resolve(envPaths.config, 'user-configs.json');

export {
  arvisRenewExtensionFlagFilePath,
  installedDataPath,
  userConfigPath,
};