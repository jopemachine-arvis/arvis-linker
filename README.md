# arvis-linker
[![NPM version](https://badge.fury.io/js/arvis-linker.svg)](http://badge.fury.io/js/arvis-linker)
[![MIT license](https://img.shields.io/badge/License-MIT-blue.svg)](https://lbesson.mit-license.org/)
[![PR's Welcome](https://img.shields.io/badge/PRs-welcome-brightgreen.svg?style=flat)](http://makeapullrequest.com)
[![GitHub issues](https://img.shields.io/github/issues/jopemachine/arvis-linker.svg)](https://GitHub.com/jopemachine/arvis-linker/issues/)

> Make your [Arvis](https://github.com/jopemachine/arvis) extensions installable from npm

This repository is inspired and cloned by [alfred-link](https://github.com/SamVerschueren/alfred-link/blob/master/readme.md)

## Install

```
$ npm i arvis-linker
```

## Usage

Add the `arvis-link` command as `postinstall` script of your Arvis extension package and add `arvis-unlink` as `preuninstall` script to clean up the resources when the extension gets uninstalled.

```json
{
  "name": "arvis-extension",
  "scripts": {
    "postinstall": "arvis-link",
    "preuninstall": "arvis-unlink"
  }
}
```

You can now install the `arvis-extension` package like this

```
$ npm install -g arvis-extension
```

This will creates a `arvis-extension` symlink inside the Arvis's directory that points to the location of the `arvis-extension` module.

## Development

When developing an Arvis extension, you can call `arvis-link` directly from your cli. Use `npx` to call the local installation of `arvis-link` and `arvis-unlink`.

```
$ npx arvis-link
```

To remove the symlink afterwards, you can call `arvis-unlink`.

```
$ npx arvis-unlink
```

## Related

- [arvish](https://github.com/jopemachine/arvish) - Arvis workflow, plugin creator tools
