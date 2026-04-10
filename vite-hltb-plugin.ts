import type { Plugin } from 'vite';
import { searchHltb } from './lib/hltb-api';

export function hltbPlugin(): Plugin {
  return {
    name: 'hltb-proxy',
    configureServer(server) {
      server.middlewares.use(async (req, res, next) => {
        if (!req.url?.startsWith('/api/hltb/search')) {
          return next();
        }

        const url = new URL(req.url, 'http://localhost');
        const query = url.searchParams.get('q');

        if (!query) {
          res.statusCode = 400;
          res.setHeader('Content-Type', 'application/json');
          res.end(JSON.stringify({ error: 'Missing query parameter' }));
          return;
        }

        try {
          const results = await searchHltb(query);
          res.statusCode = 200;
          res.setHeader('Content-Type', 'application/json');
          res.end(JSON.stringify(results));
        } catch (error) {
          console.error('HLTB search error:', error);
          res.statusCode = 500;
          res.setHeader('Content-Type', 'application/json');
          res.end(JSON.stringify({ error: 'Failed to search HLTB' }));
        }
      });
    },
  };
}
