---
title: Using Cypress Component Tests In A Nx Workspace (Angular)
description: Using Cypress Component Tests In A Nx Workspace (Angular)
published: true
---

# Using Cypress Component Tests In A Nx Workspace (Angular)

## TOC

* [TOC](#toc)
* [Intro](#intro)
* [Goals](#goals)
* [Background Info (if you need it)](#background-info-if-you-need-it)
* [Getting Started (Speed Run Version)](#getting-started-speed-run-version)
* [Getting Started (Hold My Hand Please)](#getting-started-hold-my-hand-please)
  * [Setup](#setup)
    * [Summary](#summary)
  * [Implement Tests](#implement-tests)
  * [Investigating The Errors](#investigating-the-errors)
  * [Creating A Lib And Testing It](#creating-a-lib-and-testing-it)
    * [Summary For Implementing Component Tests In UI Lib](#summary-for-implementing-component-tests-in-ui-lib)
  * [Unit Testing Lib To App Integration](#unit-testing-lib-to-app-integration)
* [Closing](#closing)

## Intro

Writing unit tests as an Angular developer... kinda sucks. There, I said it. I've tried different things to make the experience better. I've used the built in tools, Spectator, Jest, RxJS marble testing, and probably some that I'm forgetting. And while some of these tools helped, nothing quite scratched the itch quite like Cypress.


It's no secret that [Cypress](https://cypress.io) is taking the testing scene by storm. Personally, I love what Cypress is bringing to the table. My favorite part has to be the Cypress API for writing tests, but the interactive runner is pretty cool too. My goal for this blog is to help my fellow Angular developers find their way to the land of unit testing paradise by combining the new-ish Component Testing capabilities of Cypress within our Angular components, with a money-back guarantee!


Why should you read this blog instead of other sources? Well...


- Cypress doesn't have any documentation on their site on how to set this up with Angular like they do with React :(
- There are 2 competing libraries to help integrate Cypress Component Testing with Angular, [@bahmutov/cypress-angular-unit-test](https://github.com/bahmutov/cypress-angular-unit-test) and [@jscutlery/cypress-angular](https://github.com/jscutlery/devkit/tree/main/packages/cypress-angular)
- My experience with both of these is that you cannot follow either of their documentation from start to finish and get Cypress Component Testing working with Angular 13 **within an Nx Workspace**


If you want a reference to the completed code, you can view the Github repo [here](https://github.com/dgrbrady/cypress-angular-component-testing). Now, let's get started!

## Goals

I'll show you how to transform your unit tests from looking like this...

```typescript
import { AppComponent } from './app.component';
import { NxWelcomeComponent } from './nx-welcome.component';
import { TestBed } from '@angular/core/testing';

describe('AppComponent', () => {
  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [NxWelcomeComponent],
    }).compileComponents();
  });

  it('should create the app', () => {
    const fixture = TestBed.createComponent(AppComponent);
    const app = fixture.componentInstance;
    expect(app).toBeTruthy();
  });

  it(`should have as title 'app'`, () => {
    const fixture = TestBed.createComponent(AppComponent);
    const app = fixture.componentInstance;
    expect(app.title).toEqual('app');
  });

  it('should render title', () => {
    const fixture = TestBed.createComponent(AppComponent);
    fixture.detectChanges();
    const compiled = fixture.nativeElement as HTMLElement;
    expect(compiled.querySelector('.content span')?.textContent).toContain(
      'Welcome app'
    );
  });
});
```

To this...

```typescript
import { AppComponent } from './app.component';
import { NxWelcomeComponent } from './nx-welcome.component';
import { initEnv, mount } from 'cypress-angular-unit-test';

describe('AppComponent', () => {
  beforeEach(() => {
    initEnv(AppComponent, {
      declarations: [NxWelcomeComponent],
    });
  });

  it('should create the app', () => {
    const fixture = mount(AppComponent);
    const app = fixture.componentInstance;
    expect(app).to.exist;
  });

  it(`should have as title 'app'`, () => {
    const fixture = mount(AppComponent);
    const app = fixture.componentInstance;
    expect(app.title).to.equal('app');
  });

  // look how much cleaner this test is verses the default test before Cypress!
  it('should render title', () => {
    const fixture = mount(AppComponent);
    cy.get('h1').should('contain.text', 'Welcome app');
  });
});
```

## Background Info (if you need it)
provide info about cypress, component testing and other things maybe

## Getting Started (Speed Run Version)

For those of you who just want to know exactly what is needed to get this set up, here are the steps without any fluff:

0. `npx create-nx-workspace@latest --preset=angular` and answer prompts.
1. `cd` into your new project directory.
2. `npm install -D @cypress/webpack-dev-server html-webpack-plugin cypress-angular-unit-test angular2-template-loader`.
3. `npm install -D --legacy-peer-deps raw-loader@1.0.0`.
4. Create `cypress.json` in application/library directory.
5. Create `cypress` directory at root of workspace with the following structure:
    ```text
    cypress/
      - support/
        - index.ts
        - commands.ts
      - plugins/
        - webpack.config.ts
        - index.ts
      - tsconfig.json
    ```
6. Modify `tsconfig.spec.json` and `tsconfig.editor.json` files to include the `cypress` types instead of `jest`.
7. Add an npm script to `package.json` to run component tests via the Cypress runner.
8. Add entries into the `alias` object in `webpack.config.ts` for any Typescript path aliases.

## Getting Started (Hold My Hand Please)
### Setup

0. Create a brand new Nx Angular workspace with `npx create-nx-workspace@latest --preset=angular` and answer the prompts. I chose `app` as my super creative application name and `scss` for the default stylesheet format, but these values can be whatever suites your needs.
1. After Nx has created your project, `cd your/project/directory` and `npm install -D @cypress/webpack-dev-server html-webpack-plugin cypress-angular-unit-test`. If you remember, I stated above that there were two competing libraries for getting this Cypress junk set up for your Angular app. I chose to go with [cypress-angular-unit-test](https://github.com/bahmutov/cypress-angular-unit-test) because, honestly, it was the first one I came across and to this day, the only one I could consistently get set up correctly (sorry `@jscutlery/cypress-angular`).
2. Now that we have our dependencies installed, let's create `apps/app/cypress.json`. The `cypress-angular-unit-test` docs call for the `**/*cy-spec.ts` naming convention. I don't know about you, but I don't want to rename my test files after the CLI generates them for me, so I chose to go with `**/*.spec.ts`. Add the following snippet to our newly created file:
    ```json
    {
      "component": {
        "componentFolder": "apps/app/src/app",
        "testFiles": "**/*.spec.ts"
      }
    }
    ```
    - You will need to place a `cypress.json` file in every "project" that you want to add Cypress testing to, whether it's an application or a library.
3. Delete `apps/app/jest.config.js` and `apps/app/src/test-setup.ts`.
4. Create a `cypress` directory at the root of the project. This is where all your cypress goodies will go.
5. Create a `cypress/support` directory.
    - Create `cypress/support/index.ts` and `cypress/support/commands.ts` and modify `cypress/support/index.ts` with:
        ```typescript
        require('core-js/es/reflect');
        require('cypress-angular-unit-test/support');
        ```
    - Don't worry too much about the `cypress/support/commands.ts` file right now. We create it here as a formality, but it's unused for the purpose of this tutorial.
6. Create a `cypress/plugins` directory
    - Create `cypress/plugins/webpack.config.ts`:
        ```typescript
        import * as webpack from 'webpack';
        import * as path from 'path';

        const projectRoot = path.join(__dirname, '../..');
        module.exports = {
          mode: 'development',
          devtool: 'inline-source-map',
          resolve: {
            extensions: ['.ts', '.js'],
            modules: [path.join(__dirname, '../../src'), 'node_modules'],
          },
          module: {
            rules: [
              {
                enforce: 'pre',
                test: /\.js$/,
                use: 'source-map-loader',
              },
              {
                test: /\.ts$/,
                // loaders: ['ts-loader', 'angular2-template-loader'],
                use: [
                  {
                    loader: 'ts-loader',
                    options: {
                      transpileOnly: true,
                    },
                  },
                  {
                    loader: 'angular2-template-loader',
                  },
                ],
                exclude: [/node_modules/, /test.ts/, /polyfills.ts/],
              },
              {
                test: /\.(js|ts)$/,
                use: {
                  loader: 'istanbul-instrumenter-loader',
                  options: { esModules: true },
                },
                enforce: 'post',
                include: path.join(__dirname, '../..', 'src'),
                exclude: [
                  /\.(e2e|spec)\.ts$/,
                  /node_modules/,
                  /(ngfactory|ngstyle)\.js/,
                ],
              },
              {
                // Mark files inside `@angular/core` as using SystemJS style dynamic imports.
                // Removing this will cause deprecation warnings to appear.
                test: /[\/\\]@angular[\/\\]core[\/\\].+\.js$/,
                parser: { system: true },
              },
              {
                test: /\.css$/,
                use: 'raw-loader',
              },
              {
                test: /(\.scss|\.sass)$/,
                use: ['raw-loader', 'sass-loader'],
              },
              {
                test: /\.html$/,
                use: 'raw-loader',
                exclude: [path.join(__dirname, '../../src/index.html')],
              },
              {
                test: /\.(jpe?g|png|gif)$/i,
                use: 'file-loader?name=assets/images/[name].[ext]',
              },
              {
                test: /\.(mp4|webm|ogg)$/i,
                use: 'file-loader?name=assets/videos/[name].[ext]',
              },
              {
                test: /\.svg(\?v=\d+\.\d+\.\d+)?$/,
                use: 'file-loader?limit=10000&mimetype=image/svg+xml&name=assets/svgs/[name].[ext]',
              },
              {
                test: /\.eot(\?v=\d+.\d+.\d+)?$/,
                use: 'file-loader?prefix=font/&limit=5000&name=assets/fonts/[name].[ext]',
              },
              {
                test: /\.(woff|woff2)$/,
                use: 'file-loader?prefix=font/&limit=5000&name=assets/fonts/[name].[ext]',
              },
              {
                test: /\.ttf(\?v=\d+\.\d+\.\d+)?$/,
                use: 'file-loader?limit=10000&mimetype=application/octet-stream&name=assets/fonts/[name].[ext]',
              },
            ],
          },
          plugins: [
            new webpack.DefinePlugin({
              'process.env.NODE_ENV': JSON.stringify(process.env.NODE_ENV || 'test'),
            }),
            new webpack.ContextReplacementPlugin(
              /\@angular(\\|\/)core(\\|\/)f?esm5/,
              path.join(__dirname, './src'),
            ),
          ],
          performance: {
            hints: false,
          },
        }
        ```
    - Create `cypress/plugins/index.ts`:
        ```typescript
        import * as webpackConfig from './webpack.config';

        module.exports = (on, config) => {
          const { startDevServer } = require('@cypress/webpack-dev-server');

          on('dev-server:start', (options) =>
            startDevServer({
              options,
              webpackConfig,
            }),
          );
          return config;
        }
        ```
7. Modify `apps/app/tsconfig.spec.json` to include `"cypress"` in the `"types"` array instead of `"jest"`
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
8. Modify `apps/app/tsconfig.editor.json` to include `"cypress"` in the `"types"` array instead of `"jest"`
    ```json
    {
      "extends": "./tsconfig.json",
      "include": ["**/*.ts"],
      "compilerOptions": {
        "types": ["cypress", "node"]
      }
    }
    ```
9. Whew, okay that's all the code changes needed to get things set up according to the documentation (foreshadowing). Now, let's add a convenience script to `package.json` to run our shiny new Cypress component tests!
    - `"ct:app": "npx cypress open-ct -C apps/app/cypress.json"`
    - This script will open the Cypress test runner using the configuration file specified with the `-C` argument.
    - You will need to add a new entry for every application/library you want to enable Cypress tests in. We'll see an example of this later.
    - `"ct:app"` is completely arbitrary, so you can change it if you wish. The naming convention I use is `"ct:<project>"`.

#### Summary

Let's quickly review what we had to do to set this up:

- Install our dependencies
- Create a `cypress.json` file in our `apps/app` directory
- Remove Jest config files that we're no longer using
- Create a `cypress` directory at root of project and place our support and plugin files in there
- Modify a couple `tsconfig.*.json` files so that we get accurate typing for our editor

### Implement Tests

Now that we think things are set up (more foreshadowing), let's implement unit tests the "Cypress Way"<sup>TM</sup>

Let's just start by changing the code for `app.component.spec.ts` to look like this:
```typescript
import { AppComponent } from './app.component';
import { NxWelcomeComponent } from './nx-welcome.component';
import { initEnv, mount } from 'cypress-angular-unit-test';

describe('AppComponent', () => {
  beforeEach(() => {
    initEnv(AppComponent, {
      declarations: [NxWelcomeComponent],
    });
  });

  it('should create the app', () => {
    const fixture = mount(AppComponent);
    const app = fixture.componentInstance;
    expect(app).to.exist;
  });
});
```

And let's run our handy-dandy new script and see what happens! In your CLI: `npm run ct:app`

In the Cypress browser window, we'll see that everything... IS BROKEN??!?

I know what you must be thinking: "HOW DARE YOU MISLEAD ME AND NOT GIVE ME ANY FORESHADOWING HINTS THAT THIS WOULD BREAK!!". But never fear my disgruntled friend. We'll work through these issues together!

### Investigating The Errors

Let's take a look at the output:

```text

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

If we look closely at our message, we can see that we're missing something:

```text
Module not found: Error: Can't resolve 'angular2-template-loader' in 'E:\wherever\your\code\is'
```

Fortunately, this issue is pretty simple to fix. It says we're missing the `angular2-template-loader`, so let's install it!

Return to your CLI and run `npm i -D angular2-template-loader` and after it's finished, run `npm run ct:app` and see if we set this thing straight.

UGH!! MORE ERRORS?? Let's see what it is this time...

Checking the same error log in the Cypress runner, we can see: 

```text
Module not found: Error: Can't resolve 'raw-loader' in 'E:\wherever\your\code\is'
```

Okay, we're missing another dependency. Let's try the same approach we used last time! Go back to your CLI and run: `npm i -D raw-loader` and after it finishes, run `npm run ct:app`

No dice... Stick with me though, I promise we're getting closer to what I promised you. Looking at the error message again, we see:

```text
	[tsl] ERROR
      TS18002: The 'files' list in config file 'tsconfig.json' is empty.
```

This one took me a while to figure out and isn't nearly as straightforward as the other issues. My first approach was to go and tweak the `"files"` property in various `tsconfig.json` files, hoping I would somehow include the missing files. However, the issue actually doesn't have anything to do with our *existing* `tsconfig.json` files. What this error is actually trying to tell us, is that the Typescript files we created in our `cypress` directory aren't being targeted by the Typescript compiler. So let's fix that!

Add a `tsconfig.json` to `cypress` directory:
```json
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
```

Now that Typescript knows about these files, let's run `npm run ct:app` again!

Okay, by now you should have no more "compilation" errors on the right hand side, but our unit tests still fail with:	`this.input.charCodeAt is not a function`. What gives??

Well, this is another one that isn't very straightforward to figure out. According to [this comment](https://github.com/bahmutov/cypress-angular-unit-test/issues/541#issuecomment-891226962) from one of the `cypress-angular-unit-test` maintainers, apparently we don't need any ol' version of `raw-loader`, we specifically need `raw-loader@1.0.0`. So, let's fix that by running `npm i -D --legacy-peer-deps raw-loader@1.0.0` in your CLI. After it's finished, run `npm run ct:app` again and cross our fingers.

WOOOOOOOOOOOOOO!!! We got working unit tests!!! Or, you should, assuming that you followed this guide correctly and also assuming that I wrote these instructions correctly.

So what do we do now? Well, since you're in an Nx workspace, you likely have your code separated into applications and libraries. Other resources I've read sort of just stop here, but let's walk through creating an Nx lib and making sure that we can unit test it too.

### Creating A Lib And Testing It

For this tutorial, let's create a simple "ui" lib that will contain the worst reusable card component you've ever seen. Let's dive in.

0. First, run `nx g lib ui --unitTestRunner=none` to create the UI lib. Notice that we told the Nx CLI to skip the unit test runner so we don't have all those Jest files to clean up.
1. Next, run `nx g c Card --project ui` to create the `CardComponent` in our UI lib.
2. Next, copy `apps/app/tsconfig.spec.json` into `libs/ui/tsconfig.spec.json`.
3. Next, add a reference to this new `tsconfig.spec.json` file in the  `"references"` array in `libs/ui/tsconfig.json`. It should look like this:
    ```json
    {
      "extends": "../../tsconfig.base.json",
      ...
      "references": [
        {
          "path": "./tsconfig.lib.json"
        },
        {
          "path": "./tsconfig.spec.json"
        }
      ],
      ...
    }
    ```
4. Now, implement unit tests in `card.component.spec.ts`:
    ```typescript
    import { ComponentFixture } from '@angular/core/testing';

    import { CardComponent } from './card.component';
    import { initEnv, mount } from 'cypress-angular-unit-test';

    describe('CardComponent', () => {
      let fixture: ComponentFixture<CardComponent>;

      beforeEach(() => {
        initEnv(CardComponent);
        fixture = mount(CardComponent);
      });

      it('should create', () => {
        expect(fixture.componentInstance).to.exist;
      });
    });
    ```
5. Don't forget to add `libs/ui/cypress.json` so they Cypress runner knows where to look:
    ```json
    {
      "component": {
        "componentFolder": "libs/ui/src/lib",
        "testFiles": "**/*.spec.ts"
      }
    }
    ```
6. Finally, add our convenience script into `package.json` to run our unit tests for our UI lib:
    - `"ct:ui": "npx cypress open-ct -C libs/ui/cypress.json"`

Now, you should be able to run `npm run ct:ui` in your CLI and run the unit tests for `CardComponent`!

#### Summary For Implementing Component Tests In UI Lib

As you can see, once everything else was set up, we only needed a couple minor changes to actually implement Cypress component testing for our new UI lib:

- Add a `tsconfig.spec.json` to the lib that contains the Cypress types.
- Update the references array in `tsconfig.json` with an entry for `tsconfig.spec.json` so that we can tell our editor and the Typescript compiler about the Cypress types.
- Create a `cypress.json` file that tells the Cypress runner where our test files are located.
- Create a convenience script in `package.json` for running the UI lib unit tests.

### Unit Testing Lib To App Integration

If I sent you on your merry way in the last section, you'd find yourself in quite the predicament should you actually try to use our fancy new `CardComponent` within your Angular application and try to unit test its presence in your app. What kind of sicko would I be if I did that to you?? The process to get the lib hooked up into the app is fairly straightforward, but I don't like when tutorials leave some stones unturned, so let's shake up the sediment!

0. First, we need to export `CardComponent` correctly and use it in our `AppComponent`
    - Export `CardComponent` from `libs/ui/src/index.ts` by adding this line:
        ```typescript
        export * from './lib/card/card.component';
        ```
    - Add `CardComponent` to the `exports` array in `UiModule`.
    - Import `UiModule` into the `imports` array of `AppModule`.
    - Update `app.component.html` by adding the selector of `CardComponent` anywhere in the component.
1. Next, we let's update `app.component.spec.ts`.
    - Add `UiModule` to the `imports` array in the config object argument of the `initEnv` function:
        ```typescript
        describe('AppComponent', () => {
          beforeEach(() => {
            initEnv(AppComponent, {
              declarations: [NxWelcomeComponent],
              imports: [UiModule]
            });
          });
        // ... other code
        });
        ```
    - Add new test that asserts `CardComponent` is rendered:
        ```typescript
        it('should render CardComponent', () => {
          const fixture = mount(AppComponent);
          const card = fixture.debugElement.query(By.directive(CardComponent))
          expect(card).to.exist;
        });
        ```
    - Now, this may be where you think you are done. But if you run `npm run ct:app`, you'll see we get the error:
        ```text
        > Cannot find module '@your-project-name/ui'
        ```
2. Let's fix this by updating `cypress/plugins/webpack.config.ts`:
    ```typescript
    module.exports = {
      resolve: {
        // add this alias object
        alias: {
          // you will have to add an entry here for every entry in the "paths"
          // object in tsconfig.base.json (i.e. every time you create a new lib)
          '@your-project-name/ui': path.join(projectRoot, 'libs/ui/src')
        }
      }
    }
    ```
3. Run `npm run ct:app` again, and everything should work!


## Closing

Wow, we sure have done a lot together. I'm sad that we're at the end :(

I hope that you found this guide informational and useful. If you notice any mistakes or have feedback in general, feel free to open a pull request [here](https://github.com/dgrbrady/scully-blog)!

Thanks for reading! I'll leave the hardest part up to you: convincing the rest of your team, PMs and stakeholders to let you aggressively rewrite all of your unit tests using Cypress ;)

