
const { Router } = require('./core/router');
const { sendJson } = require('./core/http');
const { serveStatic } = require('./core/static');
const { getUserFromRequest } = require('./modules/auth/auth.service');
const { registerModules } = require('./modules');

function createRequestHandler() {
  const router = new Router({ getUser: getUserFromRequest });
  router.get('/api/health', { auth: 'none' }, (ctx) => ctx.json(200, { status: 'ok', name: 'PLATIFUL API' }));
  registerModules(router);

  return async function handleRequest(request, response) {
    const url = new URL(request.url, `http://${request.headers.host || 'localhost'}`);

    if (!url.pathname.startsWith('/api/')) {
      serveStatic(request, response, url);
      return;
    }
    const handled = await router.dispatch(request, response, url);
    if (!handled) sendJson(response, 404, { error: 'API route was not found.' });
  };
}

module.exports = { createRequestHandler };
