import fse from 'fs-extra';

export async function checkFileExists(file: string): Promise<boolean> {
  return fse.promises
    .access(file, fse.constants.F_OK)
    .then(() => true)
    .catch(() => false);
}
