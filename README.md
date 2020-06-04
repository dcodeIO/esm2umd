esm2umd
=======

Transforms ESM to UMD, i.e. to use ESM by default with UMD as a legacy fallback.

[![npm](https://img.shields.io/npm/v/esm2umd.svg)](https://www.npmjs.com/package/esm2umd)

Usage
-----

```
npx esm2umd ModuleName esmFile.js > umdFile.js
```

`ModuleName` is used as the name of the vanilla JS global.

API
---

Installation as a dependency is optional (pulls in megabytes of babel), but if so desired exposes the CLI as an API:

```js
import esm2umd from 'esm2umd'

const esmCode = '...'
const umdCode = esm2umd('ModuleName', esmCode)
```
