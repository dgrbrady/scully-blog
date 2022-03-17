---
title: Using Cypress Component Tests In A Nx Workspace (Angular)
description: blog description
published: true
---

[[toc]]

# Using Cypress Component Tests In A Nx Workspace (Angular)

## Stuff
issue: Module not found: Error: Can't resolve 'rxjs/operators'
fix: update to rxjs: 7.4.0 in package.json



issue: ERROR in   Error: Child compilation failed:
  Module not found: Error: Can't resolve 'raw-loader' in 'E:\code\portfolio'
  ModuleNotFoundError: Module not found: Error: Can't resolve 'raw-loader' in 'E  :\code\portfolio'
fix: npm i -D raw-loader



issue: The 'files' list in config file 'tsconfig.json' is empty.
fix:   add tsconfig.json to /cypress directory:
{
  "extends": "../tsconfig.base.json",
  "files": [
    "./plugins/index.ts",
    "./plugins/webpack.config.ts",
    "./support/index.ts",
    "./support/commands.ts"
  ],
  "types": ["cypress", "node"]
}



issue: Uncaught TypeError: this._input.charCodeAt is not a function
fix: npm i -D --legacy-peer-deps raw-loader@1.0.0



issue: > The injectable 'PlatformLocation' needs to be compiled using the JIT compiler, but '@angular/compiler' is not available.

The injectable is part of a library that has been partially compiled.
However, the Angular Linker has not processed the library such that JIT compilation is used as fallback.

Ideally, the library is processed using the Angular Linker to become fully AOT compiled.
Alternatively, the JIT compiler should be loaded by bootstrapping using '@angular/platform-browser-dynamic' or '@angular/platform-server',
or manually provide the compiler with 'import "@angular/compiler";' before bootstrapping.
fix: import 'cypress-angular-unit-test' first, before anything else



issue: This constructor is not compatible with Angular Dependency Injection because its dependency at index 0 of the parameter list is invalid.
This can happen if the dependency type is a primitive like a string or if an ancestor of this class is missing an Angular decorator.

Please check that 1) the type for the parameter at index 0 is correct and 2) the correct Angular decorators are defined for this class and its ancestors.
fix: export const BROWSER_HISTORY_SERVICE = new InjectionToken(
  'BrowserHistoryService',
);
  constructor(
    @Inject(BROWSER_HISTORY_SERVICE)
    private browserHistoryService: BrowserHistoryService
  ) {}

## Start Of Blog
========== start of blog ===================
It's no secret that [Cypress](https://cypress.io) is taking the testing scene by storm. Personally, I love what Cypress is bringing to the table. And if you're anything like me, 

## Steps
Demo of minimal code setup to get Cypress component testing working with Nx and Angular

========== FRESH INSTALL STEPS =============
1. npm install -D @cypress/webpack-dev-server html-webpack-plugin cypress-angular-unit-test
2. Create apps/app/cypress.json
```json
{
  "component": {
    "componentFolder": "apps/app/src/app",
    "testFiles": "**/*.spec.ts"
  }
}
```
3. delete `apps/app/jest.config.js`
4. create `cypress/support/index.ts` and `cypress/support/commands.ts` and modify `cypress/support/index.ts`
```typescript
require('core-js/es/reflect');
require('cypress-angular-unit-test/support');
```
5. create `cypress/plugins/webpack.config.ts`
6. create `cypress/plugins/index.ts`
7. delete `apps/app/src/test-setup.ts`
8. modify `apps/app/tsconfig.spec.json`
= ORIGINAL =
```json
{
  "extends": "./tsconfig.json",
  "compilerOptions": {
    "outDir": "../../dist/out-tsc",
    "module": "commonjs",
    "types": ["jest", "node"]
  },
  "files": ["src/test-setup.ts"],
  "include": ["**/*.test.ts", "**/*.spec.ts", "**/*.d.ts"]
}
```
= NEW =

```json
{
  "extends": "./tsconfig.json",
  "compilerOptions": {
    "outDir": "../../dist/out-tsc",
    "module": "commonjs",
    "types": ["cypress", "node"]
  },
  "include": ["**/*.test.ts", "**/*.spec.ts", "**/*.d.ts"]
}
```
9. modify `apps/app/tsconfig.editor.ts`
= ORIGINAL =
```json
{
  "extends": "./tsconfig.json",
  "include": ["**/*.ts"],
  "compilerOptions": {
    "types": ["jest", "node"]
  }
}
```
= NEW =
```json
{
  "extends": "./tsconfig.json",
  "include": ["**/*.ts"],
  "compilerOptions": {
    "types": ["cypress", "node"]
  }
}
```
10. add to `package.json` scripts
    `"ct:app": "npx cypress open-ct -C apps/app/cypress.json"`

NOTE: docs complete, let's try to implement tests.
11. implement tests
12. `npm run ct:app`
NOTE: app.component.spec.ts yields error:
```

 > Cannot find module 'E:\code\cypress-angular-component-testing\cypress\support\index.ts'
Compiled with problems:X

WARNING

DefinePlugin
Conflicting values for 'process.env.NODE_ENV'


ERROR in ./node_modules/@cypress/webpack-dev-server/dist/browser.js (./node_modules/@cypress/webpack-dev-server/dist/loader.js!./node_modules/@cypress/webpack-dev-server/dist/browser.js) 2:30-111

Module not found: Error: Can't resolve 'angular2-template-loader' in 'E:\code\cypress-angular-component-testing'


ERROR in ./node_modules/@cypress/webpack-dev-server/dist/browser.js (./node_modules/@cypress/webpack-dev-server/dist/loader.js!./node_modules/@cypress/webpack-dev-server/dist/browser.js) 5:16-139

Module not found: Error: Can't resolve 'angular2-template-loader' in 'E:\code\cypress-angular-component-testing'


ERROR

  Error: Child compilation failed:
  Module not found: Error: Can't resolve 'raw-loader' in 'E:\code\cypress-angula  r-component-testing'
  ModuleNotFoundError: Module not found: Error: Can't resolve 'raw-loader' in 'E  :\code\cypress-angular-component-testing'
      at E:\code\cypress-angular-component-testing\node_modules\webpack\lib\Comp  ilation.js:2013:28
      at E:\code\cypress-angular-component-testing\node_modules\webpack\lib\Norm  alModuleFactory.js:795:13
      at eval (eval at create (E:\code\cypress-angular-component-testing\node_mo  dules\tapable\lib\HookCodeFactory.js:33:10), <anonymous>:10:1)
      at E:\code\cypress-angular-component-testing\node_modules\webpack\lib\Norm  alModuleFactory.js:275:22
      at eval (eval at create (E:\code\cypress-angular-component-testing\node_mo  dules\tapable\lib\HookCodeFactory.js:33:10), <anonymous>:9:1)
      at E:\code\cypress-angular-component-testing\node_modules\webpack\lib\Norm  alModuleFactory.js:538:15
      at E:\code\cypress-angular-component-testing\node_modules\webpack\lib\Norm  alModuleFactory.js:124:11
      at E:\code\cypress-angular-component-testing\node_modules\webpack\lib\Norm  alModuleFactory.js:609:8
      at E:\code\cypress-angular-component-testing\node_modules\neo-async\async.  js:2830:7
      at done (E:\code\cypress-angular-component-testing\node_modules\neo-async\  async.js:2925:13)
      at E:\code\cypress-angular-component-testing\node_modules\webpack\lib\Norm  alModuleFactory.js:1018:23
      at finishWithoutResolve (E:\code\cypress-angular-component-testing\node_mo  dules\enhanced-resolve\lib\Resolver.js:307:11)
      at E:\code\cypress-angular-component-testing\node_modules\enhanced-resolve  \lib\Resolver.js:381:15
      at E:\code\cypress-angular-component-testing\node_modules\enhanced-resolve  \lib\Resolver.js:430:5
      at eval (eval at create (E:\code\cypress-angular-component-testing\node_mo  dules\tapable\lib\HookCodeFactory.js:33:10), <anonymous>:16:1)
      at E:\code\cypress-angular-component-testing\node_modules\enhanced-resolve  \lib\Resolver.js:430:5
      at eval (eval at create (E:\code\cypress-angular-component-testing\node_mo  dules\tapable\lib\HookCodeFactory.js:33:10), <anonymous>:27:1)
      at E:\code\cypress-angular-component-testing\node_modules\enhanced-resolve  \lib\DescriptionFilePlugin.js:87:43
      at E:\code\cypress-angular-component-testing\node_modules\enhanced-resolve  \lib\Resolver.js:430:5
      at eval (eval at create (E:\code\cypress-angular-component-testing\node_mo  dules\tapable\lib\HookCodeFactory.js:33:10), <anonymous>:15:1)
      at E:\code\cypress-angular-component-testing\node_modules\enhanced-resolve  \lib\Resolver.js:430:5
      at eval (eval at create (E:\code\cypress-angular-component-testing\node_mo  dules\tapable\lib\HookCodeFactory.js:33:10), <anonymous>:42:1)
  
  - Compilation.js:2013 
    [cypress-angular-component-testing]/[webpack]/lib/Compilation.js:2013:28
  
  - NormalModuleFactory.js:795 
    [cypress-angular-component-testing]/[webpack]/lib/NormalModuleFactory.js:795    :13
  
  
  - NormalModuleFactory.js:275 
    [cypress-angular-component-testing]/[webpack]/lib/NormalModuleFactory.js:275    :22
  
  
  - NormalModuleFactory.js:538 
    [cypress-angular-component-testing]/[webpack]/lib/NormalModuleFactory.js:538    :15
  
  - NormalModuleFactory.js:124 
    [cypress-angular-component-testing]/[webpack]/lib/NormalModuleFactory.js:124    :11
  
  - NormalModuleFactory.js:609 
    [cypress-angular-component-testing]/[webpack]/lib/NormalModuleFactory.js:609    :8
  
  - async.js:2830 
    [cypress-angular-component-testing]/[neo-async]/async.js:2830:7
  
  - async.js:2925 done
    [cypress-angular-component-testing]/[neo-async]/async.js:2925:13
  
  - NormalModuleFactory.js:1018 
    [cypress-angular-component-testing]/[webpack]/lib/NormalModuleFactory.js:101    8:23
  
  - Resolver.js:307 finishWithoutResolve
    [cypress-angular-component-testing]/[enhanced-resolve]/lib/Resolver.js:307:1    1
  
  - Resolver.js:381 
    [cypress-angular-component-testing]/[enhanced-resolve]/lib/Resolver.js:381:1    5
  
  - Resolver.js:430 
    [cypress-angular-component-testing]/[enhanced-resolve]/lib/Resolver.js:430:5  
  
  - Resolver.js:430 
    [cypress-angular-component-testing]/[enhanced-resolve]/lib/Resolver.js:430:5  
  
  - DescriptionFilePlugin.js:87 
    [cypress-angular-component-testing]/[enhanced-resolve]/lib/DescriptionFilePl    ugin.js:87:43
  
  - Resolver.js:430 
    [cypress-angular-component-testing]/[enhanced-resolve]/lib/Resolver.js:430:5  
  
  - Resolver.js:430 
    [cypress-angular-component-testing]/[enhanced-resolve]/lib/Resolver.js:430:5  
  
  - child-compiler.js:169 
    [cypress-angular-component-testing]/[html-webpack-plugin]/lib/child-compiler    .js:169:18
  
  - Compiler.js:564 
    [cypress-angular-component-testing]/[webpack]/lib/Compiler.js:564:11
  
  - Compiler.js:1183 
    [cypress-angular-component-testing]/[webpack]/lib/Compiler.js:1183:17
  
  
  - Hook.js:18 Hook.CALL_ASYNC_DELEGATE [as _callAsync]
    [cypress-angular-component-testing]/[tapable]/lib/Hook.js:18:14
  
  - Compiler.js:1179 
    [cypress-angular-component-testing]/[webpack]/lib/Compiler.js:1179:33
  
  - Compilation.js:2784 finalCallback
    [cypress-angular-component-testing]/[webpack]/lib/Compilation.js:2784:11
  
  - Compilation.js:3089 
    [cypress-angular-component-testing]/[webpack]/lib/Compilation.js:3089:11
  
  
  - Hook.js:18 Hook.CALL_ASYNC_DELEGATE [as _callAsync]
    [cypress-angular-component-testing]/[tapable]/lib/Hook.js:18:14
  
  - Compilation.js:3082 
    [cypress-angular-component-testing]/[webpack]/lib/Compilation.js:3082:38
  
  
  - Compilation.js:519 
    [cypress-angular-component-testing]/[webpack]/lib/Compilation.js:519:10
  
  - SourceMapDevToolPlugin.js:549 
    [cypress-angular-component-testing]/[webpack]/lib/SourceMapDevToolPlugin.js:    549:10
  
  - async.js:2830 
    [cypress-angular-component-testing]/[neo-async]/async.js:2830:7
  
  - async.js:2857 Object.each
    [cypress-angular-component-testing]/[neo-async]/async.js:2857:9
  
  - SourceMapDevToolPlugin.js:384 
    [cypress-angular-component-testing]/[webpack]/lib/SourceMapDevToolPlugin.js:    384:17
  
  - async.js:2830 
    [cypress-angular-component-testing]/[neo-async]/async.js:2830:7
  
  - async.js:2857 Object.each
    [cypress-angular-component-testing]/[neo-async]/async.js:2857:9
  
  - SourceMapDevToolPlugin.js:207 
    [cypress-angular-component-testing]/[webpack]/lib/SourceMapDevToolPlugin.js:    207:15
  
  - Compilation.js:507 fn
    [cypress-angular-component-testing]/[webpack]/lib/Compilation.js:507:9
```

13. npm i -D angular2-template-loader
NOTE: fails again with:
	Module not found: Error: Can't resolve 'raw-loader' in 'E:\code\cypress-angular-component-testing'
14. npm i -D raw-loader
NOTE: fails again with:
	[tsl] ERROR
      TS18002: The 'files' list in config file 'tsconfig.json' is empty.
15. add tsconfig.json to /cypress directory:
{
  "extends": "../tsconfig.base.json",
  "files": [
    "./plugins/index.ts",
    "./plugins/webpack.config.ts",
    "./support/index.ts",
    "./support/commands.ts"
  ],
  "types": ["cypress", "node"]
}
NOTE: no more errors on right side, but unit tests fail with:
	this.input.charCodeAt is not a function
16. npm i -D --legacy-peer-deps raw-loader@1.0.0
NOTE: from library author/maintainer: https://github.com/bahmutov/cypress-angular-unit-test/issues/541#issuecomment-891226962
NOTE: working!!
NOTE: let's create an nx lib and test it
1. nx g lib ui --unitTestRunner=none
2. nx g c Card --project ui
3. copy tsconfig.spec.json from app into libs/ui/tsconfig.spec.json
4. update references in libs/ui/tsconfig.json
5. update card.component.spec.ts
6. add libs/ui/cypress.json
{
  "component": {
    "componentFolder": "libs/ui/src/lib",
    "testFiles": "**/*.spec.ts"
  }
}
7. add npm script:
    "ct:ui": "npx cypress open-ct -C libs/ui/cypress.json"
8. npm run ct:ui
NOTE: working!!
NOTE: now let's use CardComponent in app and update tests
0. export CardComponent from libs/ui/src/index.ts
  export * from './lib/card/card.component';
1. Add CardComponent to exports array in UiModule
2. import UiModule into AppModule
3. Add CardComponent selector into app.component.html
4. add UiModule to imports array in the config object argument of initEnv
5. add new test that asserts CardComponent is rendered
6. npm run ct:app
NOTE: fails with error:
  > Cannot find module '@cypress-angular-component-testing/ui'
7. update cypress/plugins/webpack.config.ts
  const projectRoot = path.join(__dirname, '../..');
  alias: {
    '@cypress-angular-component-testing/ui': path.join(projectRoot, 'libs/ui/src')
  }
