import fse from 'fs-extra';
import path from 'path';

export default async (dir: string, type: string) => {
  const files = await fse.readdir(dir);

  const promises = files.map(async file => {
    const filePath = path.join(dir, file);

    const stats = await fse.lstat(filePath);

    try {
      if (stats.isSymbolicLink()) {
        // Filter bad symlink
        const originDir = await fse.readlink(filePath);
        const validConfExists = await fse.pathExists(path.resolve(originDir, `arvis-${type}.json`));
        if (!validConfExists) return filePath;
      }
    } catch (err) {
      return filePath;
    }
  });

  const symlinks = await Promise.all(promises);

  return symlinks.filter(Boolean);
};