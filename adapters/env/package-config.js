/**
 * Package configuration adapter
 * Manages package.json content and dependencies
 */

import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const rootDir = path.resolve(__dirname, '../../');
const packageJsonPath = path.join(rootDir, 'package.json');
const packageLockJsonPath = path.join(rootDir, 'package-lock.json');

/**
 * Package.json configuration content
 */
export const packageJsonContent = {
  "//WARNING": "DO NOT EDIT THIS FILE DIRECTLY! Edit adapters/env/package-config.js instead.",
  name: "norml",
  version: "0.1.0",
  description: "NORML - Node REST Microservice Library",
  type: "module",
  main: "app.js",
  scripts: {
    test: "node --test --experimental-test-coverage=\"directory=coverage\" \"adapters/*/tests/**/*test*.js\" \"logic/*/tests/**/*test*.js\" \"ports/*/tests/**/*test*.js\" \"presenters/*/tests/**/*test*.js\" && node --no-warnings logic/tools/cleanup.js fullCleanup",
    "test:watch": "node --test --watch \"adapters/*/tests/**/*test*.js\" \"logic/*/tests/**/*test*.js\" \"ports/*/tests/**/*test*.js\" \"presenters/*/tests/**/*test*.js\"",
    "test:coverage": "node --test --experimental-test-coverage=\"directory=coverage\" \"adapters/*/tests/**/*test*.js\" \"logic/*/tests/**/*test*.js\" \"ports/*/tests/**/*test*.js\" \"presenters/*/tests/**/*test*.js\" && node --no-warnings logic/tools/cleanup.js fullCleanup",
    start: "node app.js",
    dev: "node --watch app.js",
    build: "node ports/static/build.js",
    clean: "rm -rf node_modules && npm install",
    "clean:tests": "node --no-warnings --experimental-permission logic/tools/cleanup.js fullCleanup",
    "clean:tests:win": ".\\clean-tests.bat",
    "clean:all": "node --no-warnings --experimental-permission logic/tools/cleanup.js fullCleanup && npm run clean"
  },
  engines: {
    node: ">=20.0.0"
  },
  dependencies: {}
};

/**
 * package-lock.json configuration content
 */
export const packageLockJsonContent = {
  "//WARNING": "DO NOT EDIT DIRECTLY! This file is automatically generated. Edit adapters/env/package-config.js instead.",
  name: "norml",
  version: "0.1.0",
  lockfileVersion: 3,
  requires: true,
  packages: {
    "": {
      name: "norml",
      version: "0.1.0",
      engines: {
        node: ">=20.0.0"
      }
    }
  }
};

/**
 * Writes the package.json file to the root directory
 */
export function writePackageJson() {
  try {
    fs.writeFileSync(packageJsonPath, JSON.stringify(packageJsonContent, null, 2), 'utf8');
    return true;
  } catch (error) {
    console.error('[PackageConfig] Error writing package.json:', error);
    return false;
  }
}

/**
 * Writes the package-lock.json file to the root directory
 */
export function writePackageLockJson() {
  try {
    fs.writeFileSync(packageLockJsonPath, JSON.stringify(packageLockJsonContent, null, 2), 'utf8');
    return true;
  } catch (error) {
    console.error('[PackageConfig] Error writing package-lock.json:', error);
    return false;
  }
}

/**
 * Reads the current package.json from the root directory
 */
export function readPackageJson() {
  try {
    return JSON.parse(fs.readFileSync(packageJsonPath, 'utf8'));
  } catch (error) {
    return null;
  }
}

/**
 * Package configuration adapter exports
 */
export const packageConfig = {
  writePackageJson,
  writePackageLockJson,
  readPackageJson,
  packageJsonContent,
  packageLockJsonContent
}; 