import fse from 'fs-extra';
import { arvisRenewExtensionFlagFilePath } from './path';

export const forceReload = async (bundleId: string, type: string) => {
  // To do:: Below logic needs to be removed after chokidar's symlink issue is resolved
  // Because followSymlink is false now, below logic is needed for now.

  try {
    const flagInfo = await fse.readJSON(arvisRenewExtensionFlagFilePath, { encoding: 'utf-8' });

    if (flagInfo.type !== type) {
      fse.writeJSONSync(arvisRenewExtensionFlagFilePath, { type: 'all', targets: [...flagInfo.targets, bundleId] });
      return;
    }

    fse.writeJSONSync(arvisRenewExtensionFlagFilePath, { type, targets: [...flagInfo.targets, bundleId] }, { encoding: 'utf-8' });
  } catch (err) {
    fse.writeJSONSync(arvisRenewExtensionFlagFilePath, { type, targets: [bundleId] }, { encoding: 'utf-8' });
  }
};