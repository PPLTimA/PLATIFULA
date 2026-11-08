// Dipakai dengan: node -r ./tests/helpers/preload-mock.js server.js
// Menjalankan server dengan MySQL tiruan di memori (data hilang saat server berhenti).
const Module = require('node:module');
const mockMysql = require('./mock-mysql');
const originalLoad = Module._load;
Module._load = function load(request, ...rest) {
  return request === 'mysql2/promise' ? mockMysql : originalLoad.call(this, request, ...rest);
};
