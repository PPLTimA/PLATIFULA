// Router API sederhana.
//
//   router.get('/api/products/:id', { roles: ['retailer'] }, async (ctx) => { ... });
//
// Opsi route:
//   auth:  'required' (default) | 'optional' | 'none'
//   roles: daftar peran yang boleh mengakses (hanya berlaku bila login)
//
// ctx berisi: req, res, url, query, params, user, body(), json(status, data, headers), send()
const { HttpError, sendJson, readJsonBody } = require('./http');

function compile(pattern) {
  const names = [];
  const source = pattern
    .replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
    .replace(/:([A-Za-z]+)/g, (_, name) => {
      names.push(name);
      return '([^/]+)';
    });
  return { regex: new RegExp(`^${source}$`), names };
}

class Router {
  constructor({ getUser }) {
    this.getUser = getUser;
    this.routes = [];
  }

  add(method, pattern, optionsOrHandler, maybeHandler) {
    const handler = maybeHandler || optionsOrHandler;
    const options = maybeHandler ? optionsOrHandler : {};
    this.routes.push({ method, ...compile(pattern), options, handler });
    return this;
  }

  get(...args) { return this.add('GET', ...args); }
  post(...args) { return this.add('POST', ...args); }
  put(...args) { return this.add('PUT', ...args); }
  patch(...args) { return this.add('PATCH', ...args); }
  delete(...args) { return this.add('DELETE', ...args); }

  /** Mengembalikan true bila ada route yang cocok dan sudah merespons. */
  async dispatch(request, response, url) {
    for (const route of this.routes) {
      if (route.method !== request.method) continue;
      const match = url.pathname.match(route.regex);
      if (!match) continue;

      const params = {};
      route.names.forEach((name, index) => {
        try {
          params[name] = decodeURIComponent(match[index + 1]);
        } catch {
          params[name] = match[index + 1];
        }
      });

      try {
        await this.run(route, request, response, url, params);
      } catch (error) {
        if (response.headersSent) return true;
        const status = error instanceof HttpError ? error.status : 500;
        if (status === 500) console.error(error);
        sendJson(response, status, {
          error: status === 500 ? 'Terjadi kesalahan pada server.' : error.message,
        });
      }
      return true;
    }
    return false;
  }

  async run(route, request, response, url, params) {
    const { auth = 'required', roles } = route.options;
    const user = auth === 'none' ? null : this.getUser(request);

    if (auth === 'required' && !user) throw new HttpError(401, 'Silakan masuk untuk melanjutkan.');
    if (roles && (!user || !roles.includes(user.role))) {
      throw new HttpError(user ? 403 : 401, user ? 'Fitur ini tidak tersedia untuk peran akunmu.' : 'Silakan masuk untuk melanjutkan.');
    }

    let parsedBody;
    const context = {
      req: request,
      res: response,
      url,
      query: url.searchParams,
      params,
      user,
      async body() {
        if (parsedBody === undefined) parsedBody = await readJsonBody(request);
        return parsedBody;
      },
      json(status, data, headers) {
        sendJson(response, status, data, headers);
      },
      send(status, headers, content) {
        response.writeHead(status, headers);
        response.end(content);
      },
    };
    await route.handler(context);
  }
}

module.exports = { Router };
