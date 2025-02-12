esm2umd
=======

Transforms ESM to UMD, i.e. to use ESM by default with UMD as a legacy fallback.

[![Build Status](https://img.shields.io/github/actions/workflow/status/dcodeIO/esm2umd/test.yml?branch=main&label=test&logo=github)](https://github.com/dcodeIO/esm2umd/actions/workflows/test.yml) [![Publish Status](https://img.shields.io/github/actions/workflow/status/dcodeIO/esm2umd/publish.yml?branch=main&label=publish&logo=github)](https://github.com/dcodeIO/esm2umd/actions/workflows/publish.yml) [![npm](https://img.shields.io/npm/v/esm2umd.svg?label=npm&color=007acc&logo=npm)](https://www.npmjs.com/package/esm2umd)

Usage
-----

```
$> npm install --save-dev esm2umd
```

```
npx esm2umd MyModule esmFile.js > umdFile.js
```

`MyModule` is used as the name of the vanilla JS global.

If the module has a `default` export, it is transformed to a whole-module export.

API
---

```js
import esm2umd from 'esm2umd'

const esmCode = '...'
const umdCode = esm2umd('ModuleName', esmCode)
```

Example
-------

Outline of a hybrid module with legacy fallback:

**package.json**

```json
{
  "type": "module",
  "main": "./umd/index.js",
  "types": "./umd/index.d.ts",
  "exports": {
    ".": {
      "import": {
        "types": "./index.d.ts",
        "default": "./index.js"
      },
      "require": {
        "types": "./umd/index.d.ts",
        "default": "./umd/index.js"
      }
    }
  },
  "scripts": {
    "build": "npx esm2umd MyModule index.js > umd/index.js",
    "prepublishOnly": "npm run build"
  }
}
```

**umd/package.json**

```json
{
  "type": "commonjs"
}
```

**.gitignore**

```
umd/index.js
```

**index.d.ts**

```ts
import { MyModule } from "./types.js";
export default MyModule;
```

**umd/index.d.ts**

```ts
import { MyModule } from "../types.js";
export = MyModule;
export as namespace MyModule;
```

**types.d.ts**

```ts
export class MyModule {
  // ...
}
```
