import { send, json } from 'micro';
import { timingSafeEqual } from 'crypto';
import { Buffer } from 'buffer';

import ServerNode from '../';
import { version } from '../package.json';

export default async function (options) {
  if (!options.httpToken) {
    throw new Error('Missing required `httpToken` option');
  }

  const httpToken = Buffer.from(options.httpToken);

  const node = new ServerNode(options);

  await node.start();

  async function checkAuth(req) {
    const auth = req.headers.authorization || '';
    if (!auth) {
      return false;
    }

    const match = auth.match(/^bearer\s+([^\s]+)\s*$/i);
    if (!match) {
      return false;
    }

    const reqToken = Buffer.from(match[1]);
    if (reqToken.length !== httpToken.length) {
      return false;
    }

    return timingSafeEqual(reqToken, httpToken);
  }

  const handler = async (req, res) => {
    const { method, url } = req;
    if (method === 'GET' && url === '/') {
      return send(res, 200, { version });
    }

    if (method !== 'GET') {
      if (!await checkAuth(req, res)) {
        return send(res, 401, { error: 'Not authorized' });
      }
    }

    let body;
    if (method === 'PUT') {
      body = await json(req);
    }

    if (method === 'PUT' && url === '/add-feed') {
      if (!body || !body.feedURL) {
        throw new Error('Missing `feedURL` property in JSON body');
      }

      await node.addFeed(body.feedURL);
      return send(res, 200, { ok: true });
    }

    if (method === 'PUT' && url === '/request-invite') {
      const { command } = await node.requestInvite();
      return send(res, 200, { ok: true, command });
    }

    return send(res, 404, { error: 'not found' });
  };

  return async (req, res) => {
    try {
      await handler(req, res);
    } catch (e) {
      return send(res, 400, { error: e.message });
    }
  };
}
