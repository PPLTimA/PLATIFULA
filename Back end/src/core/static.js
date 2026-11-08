// Menyajikan file frontend dari folder `Front end`.
const fs = require('node:fs');
const path = require('node:path');
const config = require('../config');

const MIME_TYPES = {
  '.css': 'text/css; charset=utf-8',
  '.html': 'text/html; charset=utf-8',
  '.ico': 'image/x-icon',
  '.jpeg': 'image/jpeg',
  '.jpg': 'image/jpeg',
  '.js': 'text/javascript; charset=utf-8',
  '.json': 'application/json; charset=utf-8',
  '.png': 'image/png',
  '.svg': 'image/svg+xml',
  '.webp': 'image/webp',
};

function serveStatic(request, response, url) {
  let pathname;
  try {
    pathname = url.pathname === '/' ? '/index.html' : decodeURIComponent(url.pathname);
  } catch {
    response.writeHead(400);
    response.end('Bad request');
    return;
  }

  const root = config.paths.frontend;
  const filePath = path.resolve(root, `.${pathname}`);
  if (!filePath.startsWith(`${root}${path.sep}`)) {
    response.writeHead(403);
    response.end('Forbidden');
    return;
  }

  fs.readFile(filePath, (error, content) => {
    if (error) {
      response.writeHead(error.code === 'ENOENT' ? 404 : 500);
      response.end('File not found');
      return;
    }
    response.writeHead(200, {
      'Content-Type': MIME_TYPES[path.extname(filePath)] || 'application/octet-stream',
      'X-Content-Type-Options': 'nosniff',
      'Cache-Control': 'no-cache',
    });
    response.end(content);
  });
}

module.exports = { serveStatic };
