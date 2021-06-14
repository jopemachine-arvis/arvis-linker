import fs from "fs";
import del from "del";

export default (src: string, dest: string) =>
  del(dest, { force: true }).then(() =>
    fs.symlink(src, dest, (err) => {
      if (err) throw new Error(err.message);
    })
  );
