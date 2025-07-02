const { webcrypto } = require('node:crypto');
if (!global.crypto) {
  global.crypto = webcrypto;
}
