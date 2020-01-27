// browserify dependencies.js > bundle.js

let api = require("@polkadot/api");
let util = require("@polkadot/util");
let util_crypto = require("@polkadot/util-crypto");
let keyring = require("@polkadot/keyring");
let types = require("@polkadot/types")

window.api = api;
window.util = util;
window.util_crypto = util_crypto;
window.keyring = keyring;
window.types = types;