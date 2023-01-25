# Changelog

All notable changes to this project will be documented in this file. See [standard-version](https://github.com/conventional-changelog/standard-version) for commit guidelines.

## [0.13.2](https://github.com/darkobits/ts/compare/v0.13.1...v0.13.2) (2023-01-25)


### 🏗 Chores

* **deps:** Update dependencies. ([95f5c63](https://github.com/darkobits/ts/commit/95f5c637c8dd88e9c677150ee63b8354f2a361ac))

## [0.13.1](https://github.com/darkobits/ts/compare/v0.13.1-beta.4...v0.13.1) (2023-01-25)


### 🏗 Chores

* Remove unused configuration file. ([6688031](https://github.com/darkobits/ts/commit/66880314b8e05f1c4a02ed07acb012e175cd0a1e))

## [0.13.1-beta.4](https://github.com/darkobits/ts/compare/v0.13.1-beta.3...v0.13.1-beta.4) (2023-01-25)


### 🛠 Refactoring

* Move `tsconfig.json` to `config` folder. ([219539c](https://github.com/darkobits/ts/commit/219539ccf4786a865cd6a324624313af9acb1201))

## [0.13.1-beta.3](https://github.com/darkobits/ts/compare/v0.13.1-beta.2...v0.13.1-beta.3) (2023-01-25)


### 🛠 Refactoring

* Disable update notifier. ([e1cc63a](https://github.com/darkobits/ts/commit/e1cc63aded03851165ad0493fb3354c8cd83974a))


### 🐞 Bug Fixes

* Add `passWithNoTests` flag to Vitest calls. ([aff7ad5](https://github.com/darkobits/ts/commit/aff7ad5be1abf481e7e177ef5da7db2515695155))

## [0.13.1-beta.2](https://github.com/darkobits/ts/compare/v0.13.1-beta.1...v0.13.1-beta.2) (2023-01-25)


### 🛠 Refactoring

* Remove dependency on Babel. ([6d8e318](https://github.com/darkobits/ts/commit/6d8e31870306243146934b196eb3321ba0d699aa))


### 🏗 Chores

* **deps:** Update dependencies. ([a86ad57](https://github.com/darkobits/ts/commit/a86ad57ca121b8a411cae1e67e4c5d2a1e3c7983))

## [0.13.1-beta.1](https://github.com/darkobits/ts/compare/v0.13.1-beta.0...v0.13.1-beta.1) (2023-01-24)


### 🏗 Chores

* Use TypeScript configuration files. ([b850ba2](https://github.com/darkobits/ts/commit/b850ba29883fe7eb72bb63258a4cd0fccbc5d82b))


### 🛠 Refactoring

* Migrate from Jest to Vitest. ([1a8bfce](https://github.com/darkobits/ts/commit/1a8bfceaf61bdceec31a61536c425e6b41259847))

## [0.13.1-beta.0](https://github.com/darkobits/ts/compare/v0.13.0...v0.13.1-beta.0) (2023-01-20)


### 🏗 Chores

* **deps:** Update dependencies. ([42fbf96](https://github.com/darkobits/ts/commit/42fbf96f320ec644f6e4a021f0857f0a5332294b))
* Update `.cy.cml`. ([7feb7ba](https://github.com/darkobits/ts/commit/7feb7ba261a6b238a3d1c7f9157605c40a8e0d73))

## [0.13.0](https://github.com/darkobits/ts/compare/v0.13.0-beta.0...v0.13.0) (2023-01-16)


### 🛠 Refactoring

* Make `link-bins` compatible with NPM 9. ([09f708e](https://github.com/darkobits/ts/commit/09f708e98b1df303fa13f7542439f13c4a79b55f))


### 🏗 Chores

* **deps:** Update dependencies. ([c0dbd7a](https://github.com/darkobits/ts/commit/c0dbd7afc85362a0e9f85e8c6575ed6558ecaaa0))
* Update ci.yml. ([3a375cd](https://github.com/darkobits/ts/commit/3a375cdaca24b2dc38381e334386936ec7a7a55d))


### 📖 Documentation

* Update documentation to account for `npm bin` deprecation. ([18ac9d3](https://github.com/darkobits/ts/commit/18ac9d3472dcd5a9000e89f5fb225b531bde3e6f))
* Update README. ([ef1691d](https://github.com/darkobits/ts/commit/ef1691d54c036f06cf7d987d08d7859bb0354229))

## [0.13.0-beta.0](https://github.com/darkobits/ts/compare/v0.12.4...v0.13.0-beta.0) (2023-01-16)


### 🏗 Chores

* **deps:** Update dependencies. ([a1e127b](https://github.com/darkobits/ts/commit/a1e127b501d500504ad010c9b14b00fb919f3705)), closes [/github.com/facebook/jest/blob/main/CHANGELOG.md#2900](https://github.com/darkobits//github.com/facebook/jest/blob/main/CHANGELOG.md/issues/2900)

## [0.12.4](https://github.com/darkobits/ts/compare/v0.12.3...v0.12.4) (2022-09-12)


### 🐞 Bug Fixes

* Remove experimental VM modules flag from test scripts. ([f515cba](https://github.com/darkobits/ts/commit/f515cba60847c5a3bfceced89d6af7b820f6f10e))

## [0.12.3](https://github.com/darkobits/ts/compare/v0.12.2...v0.12.3) (2022-09-12)


### 🐞 Bug Fixes

* `jest-esm` preset transforms all code to CJS. ([07e7585](https://github.com/darkobits/ts/commit/07e7585a2924ab6c7dfbb782c0e3a4a4e61d1c93))

## [0.12.2](https://github.com/darkobits/ts/compare/v0.12.1...v0.12.2) (2022-08-26)


### 🐞 Bug Fixes

* Revert to Jest 28. ([47a8388](https://github.com/darkobits/ts/commit/47a83889dccf598c5d1493a773f076b190529d86))

## [0.12.1](https://github.com/darkobits/ts/compare/v0.12.0...v0.12.1) (2022-08-26)


### ✨ Features

* Add `jestEsm` configuration preset. ([1a4605e](https://github.com/darkobits/ts/commit/1a4605ec96a7c6934f0947432fbe2bf7a6468001))


### 🏗 Chores

* Remove ESLint configuration deprecation warning. ([a501ad7](https://github.com/darkobits/ts/commit/a501ad7d871366671c7fb513bc17198da4b49e59))

## [0.12.0](https://github.com/darkobits/ts/compare/v0.11.0...v0.12.0) (2022-08-25)


### ⚠ BREAKING CHANGES

* **deps:**

### 🐞 Bug Fixes

* **deps:** Pin `typescript` to version `4.7.x`. ([b93225e](https://github.com/darkobits/ts/commit/b93225ef2060c9a43d6f7fa19124aeb099774b03))


### 🏗 Chores

* **deps:** Update dependencies. ([cfb6986](https://github.com/darkobits/ts/commit/cfb6986eafe8151ff03fbabec45e4aca260fda23)), closes [/github.com/facebook/jest/blob/main/CHANGELOG.md#2900](https://github.com/darkobits//github.com/facebook/jest/blob/main/CHANGELOG.md/issues/2900)

## [0.11.0](https://github.com/darkobits/ts/compare/v0.11.0-beta.1...v0.11.0) (2022-08-25)

## [0.11.0-beta.1](https://github.com/darkobits/ts/compare/v0.11.0-beta.0...v0.11.0-beta.1) (2022-08-22)


### 🏗 Chores

* Miscellaneous cleanup. ([f924415](https://github.com/darkobits/ts/commit/f9244155a980008c564c61f34dcf84740ac6adb5))

## [0.11.0-beta.0](https://github.com/darkobits/ts/compare/v0.10.7-beta.11...v0.11.0-beta.0) (2022-08-16)


### ✨ Features

* **scripts:** Add `bin` script. ([8b78540](https://github.com/darkobits/ts/commit/8b78540d63bb4d6d8c580d06085f118a11e26783))

## [0.10.7-beta.11](https://github.com/darkobits/ts/compare/v0.10.7-beta.10...v0.10.7-beta.11) (2022-08-14)


### 🏗 Chores

* **deps:** Update dependencies. ([bf28890](https://github.com/darkobits/ts/commit/bf28890b9b3d5fe9eeedfbb2a54f4fc4dcb2d8b8))

## [0.10.7-beta.10](https://github.com/darkobits/ts/compare/v0.10.7-beta.9...v0.10.7-beta.10) (2022-08-14)


### 🏗 Chores

* Add dependency on `eslint-codeframe-formatter`. ([432fdc6](https://github.com/darkobits/ts/commit/432fdc656f228fcff0aef9c023c4f9b2321b9a7b))
* **deps:** Update dependencies. ([393fbaf](https://github.com/darkobits/ts/commit/393fbaf75470e0474a32917ed0163012432b8a7d))


### 🛠 Refactoring

* Reorganize `nr` scripts. ([31618c8](https://github.com/darkobits/ts/commit/31618c844c29b4185874e0cdc219e0ba78c85839))

## [0.10.7-beta.9](https://github.com/darkobits/ts/compare/v0.10.7-beta.8...v0.10.7-beta.9) (2022-08-12)


### 🏗 Chores

* **scripts:** Prepare-skip message logs at info level. ([cf97818](https://github.com/darkobits/ts/commit/cf97818a9d9e6b7dae06d25085459b529742fce3))

## [0.10.7-beta.8](https://github.com/darkobits/ts/compare/v0.10.7-beta.7...v0.10.7-beta.8) (2022-08-12)


### 🏗 Chores

* **deps:** Update dependencies. ([629fd3f](https://github.com/darkobits/ts/commit/629fd3f34c51d36be111aacc8e47a22c8f459b8f))
* Update `nr` scripts. ([0ba7e09](https://github.com/darkobits/ts/commit/0ba7e099e1d8f6588f8f85f2df13a46dfe39ca2e))

## [0.10.7-beta.7](https://github.com/darkobits/ts/compare/v0.10.7-beta.6...v0.10.7-beta.7) (2022-08-11)


### 🏗 Chores

* **deps:** Update dependencies. ([f643f03](https://github.com/darkobits/ts/commit/f643f031bfbcb71f6ab3b35eb8771449c28de236))


### 🛠 Refactoring

* Use task to log skip prepare message. ([178ced3](https://github.com/darkobits/ts/commit/178ced3d0a33295f7c221658efc2f9cb0da5b716))

## [0.10.7-beta.6](https://github.com/darkobits/ts/compare/v0.10.7-beta.5...v0.10.7-beta.6) (2022-08-10)


### 🏗 Chores

* **eslint-plugin:** Remove explicit dependency on this package. ([a7cd8cd](https://github.com/darkobits/ts/commit/a7cd8cd16cc10f7ae8e47bbe61e3a72aff5265a2))

## [0.10.7-beta.5](https://github.com/darkobits/ts/compare/v0.10.7-beta.4...v0.10.7-beta.5) (2022-08-10)


### 🏗 Chores

* **deps:** Update dependencies. ([87ad81a](https://github.com/darkobits/ts/commit/87ad81a1e3d7f2c0a8b9afb73ab2b9d9da31507c))

## [0.10.7-beta.4](https://github.com/darkobits/ts/compare/v0.10.7-beta.3...v0.10.7-beta.4) (2022-08-09)

## [0.10.7-beta.3](https://github.com/darkobits/ts/compare/v0.10.7-beta.2...v0.10.7-beta.3) (2022-08-09)


### 🏗 Chores

* Skip tags in CI. ([ab357c3](https://github.com/darkobits/ts/commit/ab357c3cc96d7a9be9e9d4631c6346b199c8b4a3))


### 🐞 Bug Fixes

* Update types in Jest config. ([5e83af5](https://github.com/darkobits/ts/commit/5e83af571bae6a87d26d583437de1525f1ba4078))

## [0.10.7-beta.2](https://github.com/darkobits/ts/compare/v0.10.7-beta.1...v0.10.7-beta.2) (2022-08-09)


### 🏗 Chores

* **deps:** Update dependencies. ([975ea5f](https://github.com/darkobits/ts/commit/975ea5fd36b6648ed434ad19b577dd6140b3428a))
* Miscellaneous cleanup. ([7bbd9af](https://github.com/darkobits/ts/commit/7bbd9af28b3e4d8cd8f9f5da1b55d66f020a059b))
* Update CI configuration. ([e14cb04](https://github.com/darkobits/ts/commit/e14cb04f5fc259b329256698e88f2d68ce18a055))


### 🛠 Refactoring

* Refactor update notification logic. ([b3187e0](https://github.com/darkobits/ts/commit/b3187e08eb1ffb733de8b2a073c6cda0c2fd7786))
* Remove `test.passWithNoTests` script. ([3f942df](https://github.com/darkobits/ts/commit/3f942dfbf2cc35bd159ea104f236d41436ca5d7d))

## [0.10.7-beta.1](https://github.com/darkobits/ts/compare/v0.10.7-beta.0...v0.10.7-beta.1) (2022-07-29)


### 🐞 Bug Fixes

* Add `jest-environment-jsdom` and `jest-jasmine2` to `peerDependencies` ([51564e8](https://github.com/darkobits/ts/commit/51564e862ba5bcf602dee08966901e6b3e0adb11))

## [0.10.7-beta.0](https://github.com/darkobits/ts/compare/v0.10.6...v0.10.7-beta.0) (2022-07-29)


### 🏗 Chores

* **ci:** Update CI configuration. ([1360391](https://github.com/darkobits/ts/commit/13603915a4dc7c757aad6ffe5d17c36ef795dac0))
* **deps:** Update all dependencies. ([#9](https://github.com/darkobits/ts/issues/9)) ([fc0ff4f](https://github.com/darkobits/ts/commit/fc0ff4f01ed1a57ff61b1f729fc62deae97a6626))
* **deps:** Update dependencies. ([e33eb8f](https://github.com/darkobits/ts/commit/e33eb8f14fe411f538387cbdd3df42047cac92e7))

### [0.10.6](https://github.com/darkobits/ts/compare/v0.10.5...v0.10.6) (2022-04-06)


### 🐞 Bug Fixes

* Remove exports map. ([25b1b14](https://github.com/darkobits/ts/commit/25b1b14912c38da61fff23c29909a15d8a2787e5))

### [0.10.5](https://github.com/darkobits/ts/compare/v0.10.4...v0.10.5) (2022-04-06)


### 🏗 Chores

* **deps:** Update dependencies. ([a7be466](https://github.com/darkobits/ts/commit/a7be46681da57db53288ead3f835eff1e178f41c))

### [0.10.4](https://github.com/darkobits/ts/compare/v0.10.3...v0.10.4) (2022-04-06)


### 🐞 Bug Fixes

* **tsconfig:** Move `emitDeclarationOnly` back to script definitions. ([c9eac5d](https://github.com/darkobits/ts/commit/c9eac5de6eb95f2a6a262201a40c0966c5223e30))

### [0.10.3](https://github.com/darkobits/ts/compare/v0.10.2...v0.10.3) (2022-04-06)


### 🐞 Bug Fixes

* **babel:** Transform dynamic imports when testing. ([3832b75](https://github.com/darkobits/ts/commit/3832b75d724e8a001b5ad403fdab6446dbce8362))

### [0.10.2](https://github.com/darkobits/ts/compare/v0.10.1...v0.10.2) (2022-04-06)


### 🐞 Bug Fixes

* Use `command.babel` for script `test.watch`. ([311af96](https://github.com/darkobits/ts/commit/311af962e1187c0f0c53f7f80043c1937e56ef98))

### [0.10.1](https://github.com/darkobits/ts/compare/v0.10.0...v0.10.1) (2022-03-29)


### 🏗 Chores

* **deps:** Update dependencies. ([3a654fa](https://github.com/darkobits/ts/commit/3a654fa73c911bebcfa8cad8360295067e8bd20c))

## [0.10.0](https://github.com/darkobits/ts/compare/v0.9.6...v0.10.0) (2022-03-29)


### ⚠ BREAKING CHANGES

* **deps:** This update includes a breaking change in the `nr` API. Consumers will need to update their `nr.config.js` files accordingly.

### 🏗 Chores

* **deps:** Update dependencies. ([da7fac5](https://github.com/darkobits/ts/commit/da7fac5c68a980c875ffc141fadfe52f98d6f7e2))


### 🛠 Refactoring

* Add typed Jest configuration. ([9f3035e](https://github.com/darkobits/ts/commit/9f3035e32654ba47359e4d29dcf283bb56657bee))

### [0.9.6](https://github.com/darkobits/ts/compare/v0.9.5...v0.9.6) (2022-03-29)


### 🏗 Chores

* **deps:** Update dependencies. ([8ec30d3](https://github.com/darkobits/ts/commit/8ec30d3529fd4d9827d51aaf89d5594a37dd29e3))

### [0.9.5](https://github.com/darkobits/ts/compare/v0.9.4...v0.9.5) (2022-03-29)


### 🐞 Bug Fixes

* Fix build configuration. ([6b7ea08](https://github.com/darkobits/ts/commit/6b7ea084d43c420d89acf40f2952822b140a3688))

### [0.9.4](https://github.com/darkobits/ts/compare/v0.9.3...v0.9.4) (2022-03-29)


### 🏗 Chores

* **deps:** Update dependencies. ([157334e](https://github.com/darkobits/ts/commit/157334e946017c35b8a64505a12fed68c7c4ba0a))
* **deps:** Update dependencies. ([8afa663](https://github.com/darkobits/ts/commit/8afa6632923eb245d200f2f7de54683ceaa782ee))

### [0.9.3](https://github.com/darkobits/ts/compare/v0.9.2...v0.9.3) (2022-03-28)


### 🛠 Refactoring

* **babel:** Update Babel ESM configuration. ([924e20a](https://github.com/darkobits/ts/commit/924e20a2fdc0b95739ebdae3345f141373af7a3a))

### [0.9.2](https://github.com/darkobits/ts/compare/v0.9.1...v0.9.2) (2022-03-28)


### 🛠 Refactoring

* **babel:** Update Babel ESM configuration. ([e5e740a](https://github.com/darkobits/ts/commit/e5e740a7d09c1466d5f60d140d7d84d5f0ed6722))

### [0.9.1](https://github.com/darkobits/ts/compare/v0.9.0...v0.9.1) (2022-03-27)


### 🏗 Chores

* Add default import utility. ([e229206](https://github.com/darkobits/ts/commit/e2292066b14944c4cffcf7a35c6e194b0aaf2dd3))
* **deps:** Update dependencies. ([58d7c2a](https://github.com/darkobits/ts/commit/58d7c2a450dd06619ca39b90e9d4bd38f0ab56ac))

## [0.9.0](https://github.com/darkobits/ts/compare/v0.9.0-beta.1...v0.9.0) (2022-03-25)


### 📖 Documentation

* Update documentation. ([043dc61](https://github.com/darkobits/ts/commit/043dc61383dc1a548135c5c0bd5ea4cf2732dfa6))

## [0.9.0-beta.1](https://github.com/darkobits/ts/compare/v0.9.0-beta.0...v0.9.0-beta.1) (2022-03-25)


### 🐞 Bug Fixes

* Fix release script invocation. ([01b2e21](https://github.com/darkobits/ts/commit/01b2e21293bff18aa51e6ec74c98bd703fac946f))

## [0.9.0-beta.0](https://github.com/darkobits/ts/compare/v0.8.28-beta.6...v0.9.0-beta.0) (2022-03-25)


### ✨ Features

* Add shared `semantic-release` configuration. ([ccc0e49](https://github.com/darkobits/ts/commit/ccc0e49d45f1b421201491d6bfd5160e04adf514))

### [0.8.28-beta.6](https://github.com/darkobits/ts/compare/v0.8.28-beta.5...v0.8.28-beta.6) (2022-03-25)


### 🏗 Chores

* Restore bump scripts. ([28cac69](https://github.com/darkobits/ts/commit/28cac69de8c2bd68c46f4d7f27462dc94841194f))
* Update dependencies. ([a3bd3df](https://github.com/darkobits/ts/commit/a3bd3dfbf632ec5e3cc358ef87caf9829b761a6f))

### [0.8.28-beta.5](https://github.com/darkobits/ts/compare/v0.8.28-beta.4...v0.8.28-beta.5) (2022-03-25)


### 🏗 Chores

* **deps:** Update dependencies. ([e8774b2](https://github.com/darkobits/ts/commit/e8774b21c3bb4854ea74e3f9384764892ce02e9f))

### [0.8.28-beta.4](https://github.com/darkobits/ts/compare/v0.8.28-beta.3...v0.8.28-beta.4) (2022-03-24)


### 🐞 Bug Fixes

* Update publish workflow. ([6a9a2dc](https://github.com/darkobits/ts/commit/6a9a2dc881a5f9a93833e372d8ba5ee68023db85))

### [0.8.28-beta.3](https://github.com/darkobits/ts/compare/v0.8.28-beta.2...v0.8.28-beta.3) (2022-03-24)


### 🏗 Chores

* **babel:** Update Babel configuration. ([eacdb72](https://github.com/darkobits/ts/commit/eacdb7203a5f137c47d5b8a823d74070cde3e343))
* **deps:** Update dependencies. ([7a58901](https://github.com/darkobits/ts/commit/7a58901d3eba5744dbdfbe0ea01711a6ab089e46))
* Misc. cleanup. ([9692eb2](https://github.com/darkobits/ts/commit/9692eb22c6651b6d3751fec661187c8783ddd6bc))

### [0.8.28-beta.2](https://github.com/darkobits/ts/compare/v0.8.28-beta.1...v0.8.28-beta.2) (2022-03-24)


### 🏗 Chores

* **release:** Update release config. ([bf4af73](https://github.com/darkobits/ts/commit/bf4af73f2971729976400ee8b126e55572b05dfd))

### [0.8.28-beta.1](https://github.com/darkobits/ts/compare/v0.8.27...v0.8.28-beta.1) (2022-03-24)


### 🏗 Chores

* Update dependencies. ([f6ac751](https://github.com/darkobits/ts/commit/f6ac7514166f3863784a6b2346cc5094079544ef))
* Update dependencies. ([fd18dac](https://github.com/darkobits/ts/commit/fd18dac8a9179081350cc441b77abb0b5bf02fe0))
* Update nr config. ([9ddb765](https://github.com/darkobits/ts/commit/9ddb76557a9716b7b377186cb9354951ec9cc3d8))
* Update TS config. ([f56250e](https://github.com/darkobits/ts/commit/f56250eb13090fb6751a0aeb2b6b7c47c91ed218))


### 🛠 Refactoring

* Use semantic-release, export maps. ([c78f57e](https://github.com/darkobits/ts/commit/c78f57ef26533d746d40a6ac9b0689aaf5cf9c73))

# Changelog

All notable changes to this project will be documented in this file. See [standard-version](https://github.com/conventional-changelog/standard-version) for commit guidelines.

### [0.8.27](https://github.com/darkobits/ts/compare/v0.8.26...v0.8.27) (2022-03-11)


### 🏗 Chores

* Update dependencies. ([7dac74e](https://github.com/darkobits/ts/commit/7dac74e810cfa20bb1a9a5c764acb550285d98a8))

### [0.8.26](https://github.com/darkobits/ts/compare/v0.8.25...v0.8.26) (2022-02-17)


### 🏗 Chores

* Update dependencies. ([a1dfd9d](https://github.com/darkobits/ts/commit/a1dfd9dcbdc010e73392c0930208a21fc7cb4a82))

### [0.8.25](https://github.com/darkobits/ts/compare/v0.8.24...v0.8.25) (2022-02-17)


### 🏗 Chores

* Update dependencies. ([85adde9](https://github.com/darkobits/ts/commit/85adde9be06eaf4fb7915a66f0b88a3bb953bf0a))

### [0.8.24](https://github.com/darkobits/ts/compare/v0.8.23...v0.8.24) (2022-02-17)


### 🏗 Chores

* Update dependencies. ([645717a](https://github.com/darkobits/ts/commit/645717accc4f0c9cbd527df7d91842abbcba26cf))

### [0.8.23](https://github.com/darkobits/ts/compare/v0.8.22...v0.8.23) (2022-02-10)


### 🐞 Bug Fixes

* Update Babel ESM resolver. ([7d98bc5](https://github.com/darkobits/ts/commit/7d98bc5e93fb5263d0e8fb0180dee229d6dbf60a))


### 🏗 Chores

* Update dependencies. ([5e12931](https://github.com/darkobits/ts/commit/5e12931d05f44b5885691fb2456267925f515cc4))

### [0.8.22](https://github.com/darkobits/ts/compare/v0.8.21...v0.8.22) (2022-02-10)


### 🐞 Bug Fixes

* Update Babel ESM resolver. ([e5c4dbd](https://github.com/darkobits/ts/commit/e5c4dbd4ad2c504b0d9f7022de0a661eb5c7198a))

### [0.8.21](https://github.com/darkobits/ts/compare/v0.8.20...v0.8.21) (2022-02-10)


### 🏗 Chores

* Update dependencies. ([d3b7ebe](https://github.com/darkobits/ts/commit/d3b7ebe4fdd22d58eaed7a4b910c9fb08e5e1cce))

### [0.8.20](https://github.com/darkobits/ts/compare/v0.8.19...v0.8.20) (2022-02-10)


### 🛠 Refactoring

* Update Babel ESM resolver logic. ([062557e](https://github.com/darkobits/ts/commit/062557e08de06597d99686e5f885f7d00284a20a))

### [0.8.19](https://github.com/darkobits/ts/compare/v0.8.18...v0.8.19) (2022-02-10)


### 🏗 Chores

* Update dependencies. ([17fa6b6](https://github.com/darkobits/ts/commit/17fa6b640492b84082b04d607cae251ccb9d4fea))

### [0.8.18](https://github.com/darkobits/ts/compare/v0.8.17...v0.8.18) (2022-02-09)


### 🏗 Chores

* Update dependencies. ([3706a64](https://github.com/darkobits/ts/commit/3706a64360c00cb4deda4b7f54e35018f876359e))

### [0.8.17](https://github.com/darkobits/ts/compare/v0.8.16...v0.8.17) (2022-02-09)


### 🐞 Bug Fixes

* Update Babel resolver. ([24afea4](https://github.com/darkobits/ts/commit/24afea46fec3158b4b5211dcb7cd6ea236aa4e2a))

### [0.8.16](https://github.com/darkobits/ts/compare/v0.8.15...v0.8.16) (2022-02-09)


### 🏗 Chores

* **babel:** Target Node 16. ([7333cff](https://github.com/darkobits/ts/commit/7333cffb64dcdc715240ac41f4f98e2628c64006))

### [0.8.15](https://github.com/darkobits/ts/compare/v0.8.14...v0.8.15) (2022-02-08)


### 🏗 Chores

* Update dependencies. ([5a45a69](https://github.com/darkobits/ts/commit/5a45a6953a15957d0686a426c7167ae669e7fdcb))

### [0.8.14](https://github.com/darkobits/ts/compare/v0.8.13...v0.8.14) (2022-02-08)


### 🏗 Chores

* Update dependencies. ([996613d](https://github.com/darkobits/ts/commit/996613d5cba98eb9870916cb812b18a1241dbb0c))

### [0.8.13](https://github.com/darkobits/ts/compare/v0.8.12...v0.8.13) (2022-01-18)


### 🛠 Refactoring

* **jest:** Disable Watchman. ([deca05e](https://github.com/darkobits/ts/commit/deca05e9bcd0154d6518d2e920063bb526612b4d))

### [0.8.12](https://github.com/darkobits/ts/compare/v0.8.11...v0.8.12) (2022-01-06)


### 🏗 Chores

* **deps:** Update dependencies. ([e421570](https://github.com/darkobits/ts/commit/e42157064eeeb104368e0d1940fe66bc6237687e))

### [0.8.11](https://github.com/darkobits/ts/compare/v0.8.10...v0.8.11) (2021-12-31)


### 🐞 Bug Fixes

* Ensure prepare script does not run in CI. ([1ef64b7](https://github.com/darkobits/ts/commit/1ef64b72adc63bec6a58b5e6d98d32cb9cef26f1))

### [0.8.10](https://github.com/darkobits/ts/compare/v0.8.9...v0.8.10) (2021-12-30)


### 🏗 Chores

* **deps:** Update dependencies. ([f2b8443](https://github.com/darkobits/ts/commit/f2b844304193ef89cf27306647028e9e1dfc050a))

### [0.8.9](https://github.com/darkobits/ts/compare/v0.8.8...v0.8.9) (2021-12-18)


### 🏗 Chores

* **deps:** Update dependencies. ([4e52c56](https://github.com/darkobits/ts/commit/4e52c5625bf9af63a6c76caff7865f97b02ce3b5))

### [0.8.8](https://github.com/darkobits/ts/compare/v0.8.7...v0.8.8) (2021-12-16)


### 🐞 Bug Fixes

* Fix login in getPkgInfo, resolveBin. ([b11d4c4](https://github.com/darkobits/ts/commit/b11d4c42ca81e5bb1d12d52a36e0be2d7e0a4e18))

### [0.8.7](https://github.com/darkobits/ts/compare/v0.8.6...v0.8.7) (2021-12-16)


### 🏗 Chores

* **deps:** Update dependencies. ([425319c](https://github.com/darkobits/ts/commit/425319c555a868b2a5d03ee2d39924d781b29aaa))

### [0.8.6](https://github.com/darkobits/ts/compare/v0.8.5...v0.8.6) (2021-08-21)


### 🏗 Chores

* **deps:** Update dependencies. ([e9645c9](https://github.com/darkobits/ts/commit/e9645c9a7aa6721b8b314c045cbbdc005d914111))

### [0.8.5](https://github.com/darkobits/ts/compare/v0.8.4...v0.8.5) (2021-08-18)


### 🛠 Refactoring

* Externalize `filename` / `dirname`. ([09d5f4d](https://github.com/darkobits/ts/commit/09d5f4d8f54d1897ebcf45e5a37b5c38692f2395))

### [0.8.4](https://github.com/darkobits/ts/compare/v0.8.3...v0.8.4) (2021-08-17)


### 🛠 Refactoring

* **babel:** Add `babel-plugin-transform-import-meta`. ([6cee5e6](https://github.com/darkobits/ts/commit/6cee5e68268ae7908896c90a987db85ed67235da))
* Move `createBabelNodeCommand` to utils. ([8ebc65e](https://github.com/darkobits/ts/commit/8ebc65ed0f0a286b817a0e61679849aa190e421d))


### ✨ Features

* Add `dirname` / `filename` helpers. ([48a0d25](https://github.com/darkobits/ts/commit/48a0d25ff90ce96e107d828ca51a5c7022885b59))


### 🏗 Chores

* Add unit tests. ([ad0d67a](https://github.com/darkobits/ts/commit/ad0d67a6961c87ee98999af9fe8c00bb5d9a7ab5))

### [0.8.3](https://github.com/darkobits/ts/compare/v0.8.2...v0.8.3) (2021-08-17)


### 🏗 Chores

* **deps:** Reorganize dependencies. ([eee9f28](https://github.com/darkobits/ts/commit/eee9f28bd08b878dff722fb95e8480f906ad5451))

### [0.8.2](https://github.com/darkobits/ts/compare/v0.8.1...v0.8.2) (2021-08-16)


### 🏗 Chores

* **babel:** Disable compact flag. ([09d987c](https://github.com/darkobits/ts/commit/09d987ca178f9d18641986da11b27eb265c47c8b))

### [0.8.1](https://github.com/darkobits/ts/compare/v0.8.0...v0.8.1) (2021-08-15)


### 🏗 Chores

* Add unit tests. ([e61e4ee](https://github.com/darkobits/ts/commit/e61e4eeafc084111d095044973bf93ce9c13ae22))
* **deps:** Update dependencies. ([20846c0](https://github.com/darkobits/ts/commit/20846c00cb3070f195da855081ab03006c3b010a))

## [0.8.0](https://github.com/darkobits/ts/compare/v0.7.11...v0.8.0) (2021-08-13)


### ⚠ BREAKING CHANGES

* **deps:** This update adds ESLint rules from the `eslint-plugin-import` package that may entail some light refactoring for users. Run `nr lint.fix` to automatically fix most errors.

### 🏗 Chores

* **deps:** Update dependencies. ([ba3743a](https://github.com/darkobits/ts/commit/ba3743a50b7075f7e07e22a24c700b24f587f69c))

### [0.7.11](https://github.com/darkobits/ts/compare/v0.7.10...v0.7.11) (2021-08-07)


### 📖 Documentation

* Update documentation. ([4ec3a54](https://github.com/darkobits/ts/commit/4ec3a54d76afb0d3b93f897871952469c685b91f))


### 🐞 Bug Fixes

* Remove quotes from del-cli arguments. ([5e180c9](https://github.com/darkobits/ts/commit/5e180c992f68c1c81925ef17e1129f6f55c9e3e3))

### [0.7.10](https://github.com/darkobits/ts/compare/v0.7.9...v0.7.10) (2021-07-24)


### 🏗 Chores

* **deps:** Update dependencies. ([182d559](https://github.com/darkobits/ts/commit/182d559ba156267b63f709eb68b1b1b34c9aa985))

### [0.7.9](https://github.com/darkobits/ts/compare/v0.7.8...v0.7.9) (2021-07-24)


### 🐞 Bug Fixes

* npm-check-updates inherits stdio. ([2c19a19](https://github.com/darkobits/ts/commit/2c19a194fb61356b49b34cc1d08b3ca2a6f020cf))

### [0.7.8](https://github.com/darkobits/ts/compare/v0.7.7...v0.7.8) (2021-07-24)


### 🐞 Bug Fixes

* Invocation of npm-check-updates. ([8be63bf](https://github.com/darkobits/ts/commit/8be63bfa4195119dfda69b8ba7495d26445d7fe3))

### [0.7.7](https://github.com/darkobits/ts/compare/v0.7.6...v0.7.7) (2021-07-24)


### 🏗 Chores

* Migrate from npm-check to npm-check-dependencies. ([d33bc82](https://github.com/darkobits/ts/commit/d33bc8283f21775fab97f975d43d4bb160ae0702))
* Move dependencies to peerDependencies, require NPM 7. ([66857d9](https://github.com/darkobits/ts/commit/66857d9fec60a662dc71b3c33dbe19e544d439d8))

### [0.7.6](https://github.com/darkobits/ts/compare/v0.7.5...v0.7.6) (2021-07-21)


### 🏗 Chores

* **deps:** Update dependencies. ([3d2dcec](https://github.com/darkobits/ts/commit/3d2dcece3669070cba355dc02a52ebd6cbc64715))

### [0.7.5](https://github.com/darkobits/ts/compare/v0.7.4...v0.7.5) (2021-07-21)


### 🏗 Chores

* **deps:** Update dependencies. ([83dde9c](https://github.com/darkobits/ts/commit/83dde9c5c5937e8d9a63b38ca558373e073b4278))

### [0.7.4](https://github.com/darkobits/ts/compare/v0.7.3...v0.7.4) (2021-07-21)


### 🏗 Chores

* **deps:** Update dependencies. ([5cfc101](https://github.com/darkobits/ts/commit/5cfc1016d8f00dab473d7b0bd0a11a1d7d5268a0))

### [0.7.3](https://github.com/darkobits/ts/compare/v0.7.2...v0.7.3) (2021-07-21)


### 🏗 Chores

* **deps:** Update dependencies. ([759511f](https://github.com/darkobits/ts/commit/759511fa07c5754666d7878f0145f2d6e34cf92a))
* **ts:** Set module to ESNext. ([f8c59d8](https://github.com/darkobits/ts/commit/f8c59d804595195da280f7d180fd295591acc284))

### [0.7.2](https://github.com/darkobits/ts/compare/v0.7.1...v0.7.2) (2021-07-21)


### 🐞 Bug Fixes

* **babel:** Destructure environment variable. ([4aae500](https://github.com/darkobits/ts/commit/4aae50017b3afdace59fbeeeccd99f05999acf3f))

### [0.7.1](https://github.com/darkobits/ts/compare/v0.7.0...v0.7.1) (2021-07-21)


### 🐞 Bug Fixes

* **babel-esm:** Resolve files imported from node_modules. ([03f8d4b](https://github.com/darkobits/ts/commit/03f8d4b76d8d1363b682a51b3dcfce1afeb56a1c))


### 🏗 Chores

* **babel:** Only use ESM config during build commands. ([2fe2223](https://github.com/darkobits/ts/commit/2fe22236fdd29823be7b87c7234fa503842dea52))
* **eslint:** Ignore all top-level files. ([f033516](https://github.com/darkobits/ts/commit/f0335166bc6b02e0b3a55e266b3fbabaa3e67a4f))

## [0.7.0](https://github.com/darkobits/ts/compare/v0.6.0...v0.7.0) (2021-07-21)


### ✨ Features

* Add Babel ESM configuration preset. ([dbf82b4](https://github.com/darkobits/ts/commit/dbf82b4a9a710c0bfb4bfa0e0b54a6147a7bbda3))


### 🛠 Refactoring

* Use `createNodeCommand`. ([8737b00](https://github.com/darkobits/ts/commit/8737b00db684a5014a79ad3a1c33ced99a71c806))

## [0.6.0](https://github.com/darkobits/ts/compare/v0.6.0-beta.2...v0.6.0) (2021-07-19)


### 🏗 Chores

* Update dependencies. ([e1069cd](https://github.com/darkobits/ts/commit/e1069cdd90376269988caaa52114e95a8b1de2f0))

## [0.6.0-beta.2](https://github.com/darkobits/ts/compare/v0.6.0-beta.1...v0.6.0-beta.2) (2021-07-19)


### 🐞 Bug Fixes

* Improve bin resolution. ([8666504](https://github.com/darkobits/ts/commit/8666504c8b1fc902be3e5c12d754252f8d40b1fe))

## [0.6.0-beta.1](https://github.com/darkobits/ts/compare/v0.6.0-beta.0...v0.6.0-beta.1) (2021-07-19)


### 🐞 Bug Fixes

* Resolve nr bin correctly. ([36f71ea](https://github.com/darkobits/ts/commit/36f71eada385276ef91fd12b5d025fa9813d92de))


### 🛠 Refactoring

* Improve createNodeCommand. ([b6efb85](https://github.com/darkobits/ts/commit/b6efb85b24494e5833d417e78634388d137b895f))
* Simplify bin prefixing. ([b95d6b6](https://github.com/darkobits/ts/commit/b95d6b6ebcb5d3aec7cf0560ef854aa4648a1c8e))

## [0.6.0-beta.0](https://github.com/darkobits/ts/compare/v0.5.1...v0.6.0-beta.0) (2021-07-19)


### ✨ Features

* Add createNodeCommand. ([f588f9c](https://github.com/darkobits/ts/commit/f588f9c5a60996fd6d2972f16504f03fafca7354))

### [0.5.1](https://github.com/darkobits/ts/compare/v0.5.0...v0.5.1) (2021-07-17)


### 🐞 Bug Fixes

* Downgrade del-cli to non-ESM version. ([f90139d](https://github.com/darkobits/ts/commit/f90139df44bd39803c3497a90d24c339f5607fe8))


### 🏗 Chores

* **deps:** Update dependencies. ([ee2af5d](https://github.com/darkobits/ts/commit/ee2af5d345cb0d785c085c429d96fce141dc4aab))
* Update nr config. ([c38ce4a](https://github.com/darkobits/ts/commit/c38ce4a7eca5cd890782619ed1f715e9de38845d))

## [0.5.0](https://github.com/darkobits/ts/compare/v0.4.4...v0.5.0) (2021-07-17)


### ⚠ BREAKING CHANGES

* **deps:**

### ✨ Features

* Add option to skip bin-linking. ([3880329](https://github.com/darkobits/ts/commit/38803292c8d4020711f2c8c6a06512db74df2f3e))


### 🏗 Chores

* **deps:** Update dependencies. ([8440e72](https://github.com/darkobits/ts/commit/8440e726adda9a6bc8aa065681cf60f520afbb3c))
* **deps:** Update Jest. ([5ddb044](https://github.com/darkobits/ts/commit/5ddb0442a77a67f625e52c67b6e5ad77fc8c733c)), closes [/github.com/facebook/jest/blob/master/CHANGELOG.md#2700](https://github.com/darkobits//github.com/facebook/jest/blob/master/CHANGELOG.md/issues/2700)
* Update @darkobits/nr. ([848bccb](https://github.com/darkobits/ts/commit/848bccb83265b359c1220418c1b0e87d100eaf74))

### [0.4.4](https://github.com/darkobits/ts/compare/v0.4.3...v0.4.4) (2021-07-17)


### 🐞 Bug Fixes

* Add local bin for npm-check. ([1f82494](https://github.com/darkobits/ts/commit/1f82494157dc20167009e60738af170f5962e899))

### [0.4.3](https://github.com/darkobits/ts/compare/v0.4.2...v0.4.3) (2021-07-17)


### 🏗 Chores

* **eslint:** Use @babel/eslint-parser. ([5dc7ebc](https://github.com/darkobits/ts/commit/5dc7ebc77a769cbdad1095fac7c45bad541ee019))
* Update nr config. ([9b299b6](https://github.com/darkobits/ts/commit/9b299b6d3d219a00a314b065d65f57a35c7688e9))

### [0.4.2](https://github.com/darkobits/ts/compare/v0.4.1...v0.4.2) (2021-07-17)


### 🐞 Bug Fixes

* **link-bins:** Remove existing symlinks when overwriting. ([34d5619](https://github.com/darkobits/ts/commit/34d56194ec8415777473051192d36db1d0ee8827))

### [0.4.1](https://github.com/darkobits/ts/compare/v0.4.0...v0.4.1) (2021-07-17)


### 🐞 Bug Fixes

* **nr:** Allow configurator to be called with no arguments. ([5e5a9f0](https://github.com/darkobits/ts/commit/5e5a9f0c9e5858aa5397e8bc8088f9b8d167d92a))

## [0.4.0](https://github.com/darkobits/ts/compare/v0.3.3...v0.4.0) (2021-07-17)


### ⚠ BREAKING CHANGES

* This update replaces NPS, which is now unmaintained and contains numerous security vulnerabilities, with NR. Users will need to acquaint themselves with this tool to upgrade to this version.

See: https://github.com/darkobits/nr

### 📖 Documentation

* Update README. ([4b93219](https://github.com/darkobits/ts/commit/4b9321976fec90117a1d24bd204f514fd295676e))


### 🏗 Chores

* **ci:** Add CodeQL workflow. ([8b59c80](https://github.com/darkobits/ts/commit/8b59c808b0744d09ce5fb151bdaebb5c710a384d))
* **deps:** Update dependencies. ([59a504a](https://github.com/darkobits/ts/commit/59a504ac07f540529348fe213404d82bbf2fe7ec))


### 🛠 Refactoring

* Migrate from NPS to NR. ([1dcc8dc](https://github.com/darkobits/ts/commit/1dcc8dc78eda2f9f5f2b9f9fe1be56a5b750ec58))

### [0.3.3](https://github.com/darkobits/ts/compare/v0.3.2...v0.3.3) (2021-05-12)


### 🏗 Chores

* **deps:** Update dependencies. ([4e8070e](https://github.com/darkobits/ts/commit/4e8070e52428c1588da199e7bfed11a54efff763))

### [0.3.2](https://github.com/darkobits/ts/compare/v0.3.1...v0.3.2) (2021-05-11)


### 🐞 Bug Fixes

* **npm:** Support NPM 7. ([452f640](https://github.com/darkobits/ts/commit/452f64084ba914971345b9a72855f5b2c30f0716))

### [0.3.1](https://github.com/darkobits/ts/compare/v0.3.0...v0.3.1) (2021-05-11)


### 🏗 Chores

* **deps:** Update dependencies. ([77e22b2](https://github.com/darkobits/ts/commit/77e22b2d7ff476aa15c4f785a1bc6c04a5a95511))
* Update CI configuration. ([dc6220d](https://github.com/darkobits/ts/commit/dc6220d1f7566d5050456a8c6cb4a84dea85328e))
* **deps:** Update all dependencies. ([#2](https://github.com/darkobits/ts/issues/2)) ([4b0119f](https://github.com/darkobits/ts/commit/4b0119f49204d2429da350c2a7e8cbf03132ae0c))

## [0.3.0](https://github.com/darkobits/ts/compare/v0.2.2...v0.3.0) (2021-01-29)


### 🏗 Chores

* Migrate to GitHub Actions. ([2523b5d](https://github.com/darkobits/ts/commit/2523b5da726e002959a53565ac67dc8d84ca7fbe))
* Update dependencies. ([378fe6a](https://github.com/darkobits/ts/commit/378fe6ab367dc991ab965aee5dd6355f4b263eec))
* Update dependencies. ([df5a9c5](https://github.com/darkobits/ts/commit/df5a9c552a8384b8ec3116e9901f4125936ca8a1))


### 📖 Documentation

* Update README. ([af47d66](https://github.com/darkobits/ts/commit/af47d664f281be01c38d3c4117f9261a04cc931b))
* Update README. ([021243e](https://github.com/darkobits/ts/commit/021243e7a6adaea86ae51382d03013da7f12e1c5))
* Update README. ([9e2552d](https://github.com/darkobits/ts/commit/9e2552de9112ee1f0b6b6fbb6689172126dd9459))


### ✨ Features

* Add update notifier. ([bb4a288](https://github.com/darkobits/ts/commit/bb4a288c30f4fd7f43c8d63c4b1057bccfa7098a))
* Link binaries during prepare script. ([1a15ba3](https://github.com/darkobits/ts/commit/1a15ba3bab8986f1644fe83041a9fd71e259314b))


### 🛠 Refactoring

* Run link-bins as part of build script rather than prepare script. ([779d31c](https://github.com/darkobits/ts/commit/779d31cd2509d120d16466d779f8874270549ef4))
* Update update-notifier logic. ([483368e](https://github.com/darkobits/ts/commit/483368e7160a5e571ec90ff7ae416b07aab46f59))
* **nps:** Skip 'prepare' script in CI environments, add typings for nps-utils. ([96a6e5c](https://github.com/darkobits/ts/commit/96a6e5cb9f8e7163adbfbe0a589405a638aeb309))
* **NPS:** Update NPS configuration. ([7e89a73](https://github.com/darkobits/ts/commit/7e89a734f319f09e7f2344637d09fc3747e39a96))


### 🐞 Bug Fixes

* Add fs-extra to dependencies. ([0d2523d](https://github.com/darkobits/ts/commit/0d2523dd3732bbaecd7f3f15c1f7e16e2cfe324e))
* Fix babel-node invocations. ([59bb60d](https://github.com/darkobits/ts/commit/59bb60d1165775e55595244a409523bc32ca4e87))
* Fix incorrect paths. ([913412d](https://github.com/darkobits/ts/commit/913412db9e402d830ba4450ce4286284159377b9))
* Fix IS_CI check. ([cac32bd](https://github.com/darkobits/ts/commit/cac32bde3b361d34af356000657eac719d94b4c6))
* link-bins works against the host package's manifest. ([354f397](https://github.com/darkobits/ts/commit/354f39725fc1afe332a7b108c8ddccd020823792))
* Move @darkobits/chex to dependencies. ([eb86d26](https://github.com/darkobits/ts/commit/eb86d2607bb84cdc07e88f56cf9af91616efd4d1))

### [0.2.2](https://github.com/darkobits/ts/compare/v0.2.1...v0.2.2) (2020-12-21)


### 🛠 Refactoring

* Remove test declaration files from build directory. ([874a1ed](https://github.com/darkobits/ts/commit/874a1ed7a2511cd59d99fd19eca61a4ad154be97))

### [0.2.1](https://github.com/darkobits/ts/compare/v0.2.0...v0.2.1) (2020-12-19)


### 🐞 Bug Fixes

* Remove @babel/plugin-transform-runtime. ([d5433ec](https://github.com/darkobits/ts/commit/d5433ec60f387882331d92bc5fcf50d29d9b5247))
* **nps:** Remove duplicate --pretty flag. ([be9f4a6](https://github.com/darkobits/ts/commit/be9f4a63e25893faa9b0430095b6df29d629408d))

## [0.2.0](https://github.com/darkobits/ts/compare/v0.1.6...v0.2.0) (2020-12-16)


### ✨ Features

* **nps:** Add major, minor, patch bump scripts. ([5e39ceb](https://github.com/darkobits/ts/commit/5e39ceb973931919f5c8227e128e1b67014804c6))

### [0.1.6](https://github.com/darkobits/ts/compare/v0.1.5...v0.1.6) (2020-12-09)


### 🛠 Refactoring

* **Babel:** Strip comments from transpiled code. ([1300709](https://github.com/darkobits/ts/commit/130070943e887201f27fdf2228ffaa491d684ec3))

### [0.1.5](https://github.com/darkobits/ts/compare/v0.1.4...v0.1.5) (2020-12-09)


### 📖 Documentation

* Add Docsify documentation. ([28a07c3](https://github.com/darkobits/ts/commit/28a07c3047b413c6673c4f657b382b9d1289ae2e))


### 🏗 Chores

* Update dependencies. ([3764b8c](https://github.com/darkobits/ts/commit/3764b8c223d358790c1d9bbb0cb4c91dc4b6a881))

### [0.1.4](https://github.com/darkobits/ts/compare/v0.1.3...v0.1.4) (2020-12-04)

### 🛠 Refactoring

* Use `babel-node` when loading local bins. ([18c8e4d](https://github.com/darkobits/ts/commit/18c8e4dd55747b8c27e5ebba6c1e604de6c9afbf))
* Use changelog preset to configure standard-version. ([24642e9](https://github.com/darkobits/ts/commit/24642e953b57cc484acf157697f315613c0bc6d1))

### [0.1.2](https://github.com/darkobits/ts/compare/v0.1.1...v0.1.2) (2020-12-01)

### Bug Fixes

* Fix un-prefixed bin in package-scripts. ([590f136](https://github.com/darkobits/ts/commit/590f1368dd3bf23daf1c8a62a457864f8044510b))

## [0.1.0](https://github.com/darkobits/ts/compare/v0.1.0-beta.20...v0.1.0) (2020-11-26)

### 🛠 Refactoring

* **utils:** Simply bin resolution logic. ([1e2a8fd](https://github.com/darkobits/ts/commit/1e2a8fd81f621cc3d4f7475467ad7b3451962102))

### 🏗 Chores

* Add link-bins script. ([559dcec](https://github.com/darkobits/ts/commit/559dcec7bbb92f2acdf7e997ce95f194277e790a))
* Update dependencies. ([45c96cf](https://github.com/darkobits/ts/commit/45c96cf180102d5872d22ae10c26c9f52fe79a9b))
* Update Travis configuration. ([ef18138](https://github.com/darkobits/ts/commit/ef1813845b2af1ff3bb4cb122099a625392c7c29))

### 📖 Documentation

* Add README. ([e30afd1](https://github.com/darkobits/ts/commit/e30afd149e1ba34814416bce9bff62155cf26536))
