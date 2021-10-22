import fse from "fs-extra";
import del from "del";

export default async (src: string, dest: string): Promise<void> => {
  try {
    // Delete prev symlink (it could have been broken or invalid)
    await del(dest, { force: true });
    await fse.symlink(src, dest);
  } catch (err: any) {
    // skip install symlink
    if (err.code === "EEXIST") {
      console.log('symlink already exists.');
      return;
    }
    throw new Error(err.message);
  }
}