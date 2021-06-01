#!/usr/bin/env node
const { link } = require(".");

const npmGlobal = process.env.npm_config_global;

if (npmGlobal === "") {
  // Prevent linking if the script was part of a non-global npm (install) command
  process.exit(0);
}

link().catch((error) => {
  console.error(error);
  process.exit(1);
});
