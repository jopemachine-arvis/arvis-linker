import fs from "fs";
import del from "del";

export default (src: string, dest: string) =>
  del(dest, { force: true }).then(() =>
    fs.symlink(src, dest, (err) => {
      if (err) {
        // skip install symlink
        if (err.code === "EEXIST") {
          console.log('symlink already exists.')
          return;
        }
        throw new Error(err.message);
      }
    })
  );
