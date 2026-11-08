const config = require('../config');

const JSON_HEADERS = {
  'Content-Type': 'application/json; charset=utf-8',
  'X-Content-Type-Options': 'nosniff',
};

/** Error yang langsung diubah menjadi respons `{ error }` oleh router. */
class HttpError extends Error {
  constructor(status, message) {
    super(message);
    this.status = status;
  }
}

function sendJson(response, status, payload, headers = {}) {
  response.writeHead(status, { ...JSON_HEADERS, ...headers });
  response.end(JSON.stringify(payload));
}

function readJsonBody(request) {
  return new Promise((resolve, reject) => {
    let raw = '';
    request.on('data', (chunk) => {
      raw += chunk;
      if (raw.length > config.maxBodyBytes) {
        reject(new HttpError(413, 'Ukuran data terlalu besar.'));
        request.destroy();
      }
    });
    request.on('end', () => {
      try {
        const parsed = JSON.parse(raw || '{}');
        if (parsed === null || typeof parsed !== 'object' || Array.isArray(parsed)) {
          reject(new HttpError(400, 'Isi permintaan harus berupa objek JSON.'));
          return;
        }
        resolve(parsed);
      } catch {
        reject(new HttpError(400, 'Isi permintaan harus berupa JSON yang valid.'));
      }
    });
    request.on('error', reject);
  });
}

module.exports = { HttpError, sendJson, readJsonBody };
