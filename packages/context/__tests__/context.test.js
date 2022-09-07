'use strict';

const context = require('..');
const assert = require('assert').strict;

assert.strictEqual(context(), 'Hello from context');
console.info("context tests passed");
