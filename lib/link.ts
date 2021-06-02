import fs from "fs";
import pify from "pify";
import del from "del";

const fsP = pify(fs);

export default (src: string, dest: string) =>
  del(dest, { force: true }).then(() => fsP.symlink(src, dest));
