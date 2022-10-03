const fs = require('fs');
const path = require('path');
const package = require('../package.json');

const UNSUPPORT_DEPS_4_OLD = {
  'eslint': undefined,
  'mocha': '6.x'
};

const deps = Object.keys(UNSUPPORT_DEPS_4_OLD);
for (const item in package.devDependencies) {
  if (deps.includes(item)) {
    package.devDependencies[item] = UNSUPPORT_DEPS_4_OLD[item];
  }
}

delete package.scripts.lint;

fs.writeFileSync(
  path.join(__dirname, '../package.json'),
  JSON.stringify(package, null, 2)
);
