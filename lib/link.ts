import fse from "fs-extra";
import del from "del";

export default async (src: string, dest: string): Promise<void> => {
  await del(dest, { force: true });
  try {
    await fse.symlink(src, dest);
  } catch (err) {
    // skip install symlink
    if (err.code === "EEXIST") {
      console.log('symlink already exists.');
      return;
    }
    throw new Error(err.message);
  }
}