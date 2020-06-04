#!/usr/bin/env node

import fs from "fs";
import esm2umd from "../index.js";

if (process.argv.length < 4) {
  console.error("Usage: esm2umd ModuleName esmModuleFile.js > umdModuleFile.js");
  process.exit(1);
}

process.stdout.write(esm2umd(process.argv[2], fs.readFileSync(process.argv[3])));
