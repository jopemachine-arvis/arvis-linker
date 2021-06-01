#!/usr/bin/env node
"use strict";
const { unlink } = require(".");

unlink().catch((error) => {
  console.error(error);
  process.exit(1);
});
