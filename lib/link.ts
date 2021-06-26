import fs from "fs";
import del from "del";
import { renewFilePath } from './path';

export default (src: string, dest: string) => {
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

      // To do:: Below logic needs to be removed after chokidar's symlink issue is resolved
      // Because followSymlink is false now, below logic is needed for now.
      fs.writeFileSync(renewFilePath, '');
    })
  );
}