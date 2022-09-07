'use strict';

const domDsl = require('..');
const assert = require('assert').strict;

assert.strictEqual(domDsl(), 'Hello from domDsl');
console.info("domDsl tests passed");
