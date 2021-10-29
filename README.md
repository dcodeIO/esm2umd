esm2umd
=======

Transforms ESM to UMD, i.e. to use ESM by default with UMD as a legacy fallback.

[![Build Status](https://img.shields.io/github/workflow/status/dcodeIO/esm2umd/Test/main?label=test&logo=github)](https://github.com/dcodeIO/esm2umd/actions?query=workflow%3ATest) [![Publish Status](https://img.shields.io/github/workflow/status/dcodeIO/esm2umd/Publish/main?label=publish&logo=github)](https://github.com/dcodeIO/esm2umd/actions?query=workflow%3APublish) [![npm](https://img.shields.io/npm/v/esm2umd.svg?label=npm&color=007acc&logo=npm)](https://www.npmjs.com/package/esm2umd)

Usage
-----

```
npx esm2umd ModuleName esmFile.js > umdFile.js
```

`ModuleName` is used as the name of the vanilla JS global. If the module has a `default` export, it becomes the value obtained when `require`d.

API
---

Installation as a dependency is optional (pulls in megabytes of babel), but if so desired exposes the CLI as an API:

```js
import esm2umd from 'esm2umd'

const esmCode = '...'
const umdCode = esm2umd('ModuleName', esmCode)
```
