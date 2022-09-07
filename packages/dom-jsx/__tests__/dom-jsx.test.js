'use strict';

const domJsx = require('..');
const assert = require('assert').strict;

assert.strictEqual(domJsx(), 'Hello from domJsx');
console.info("domJsx tests passed");
