#!/usr/bin/env node
import { linkArvisGlobalModule } from "./index";

const npmGlobal = process.env.npm_config_global;

if (npmGlobal === "") {
  // Prevent linking if the script was part of a non-global npm (install) command
  throw new Error('npmGlobal is not set!');
}

linkArvisGlobalModule();
