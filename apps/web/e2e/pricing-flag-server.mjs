import { createServer } from 'node:http';

// Local-only PostHog management fixture for pricing.spec.ts. No credentials or remote calls.
createServer((request, response) => {
  response.writeHead(200, { 'content-type': 'application/json' });
  response.end(
    JSON.stringify(
      request.method === 'GET'
        ? {
            results: [
              {
                key: 'pricing-test-2026-11',
                active: true,
                filters: {
                  groups: [{ properties: [], rollout_percentage: 100 }],
                  multivariate: {
                    variants: [
                      { key: 'control', rollout_percentage: 50 },
                      { key: 'test', rollout_percentage: 50 },
                    ],
                  },
                },
              },
            ],
          }
        : {},
    ),
  );
}).listen(3148, '127.0.0.1');
