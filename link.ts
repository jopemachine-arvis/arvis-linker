#!/usr/bin/env node
import { linkArvisGlobalModule } from "./index";
import isTravis from 'is-travis';

const npmGlobal = process.env.npm_config_global;

if (!npmGlobal || npmGlobal === "" || isTravis) {
  // Prevent linking if the script was part of a non-global npm (install) command
  process.exit(0);
}

linkArvisGlobalModule();
