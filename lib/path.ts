import envPathsGenerator from 'env-paths';
import path from 'path';

const envPaths = envPathsGenerator('arvis');
const installedDataPath = envPaths.data;
const renewFilePath = `${installedDataPath}${path.sep}arvis-extension-renew`;

export {
  installedDataPath,
  renewFilePath,
}