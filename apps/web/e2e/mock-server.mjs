import { appendFile, mkdir } from 'node:fs/promises';
import { createServer } from 'node:http';
import { gunzipSync } from 'node:zlib';

const output = process.env.EVIDENCE_DIR || '../../.data/analytics-evidence';
await mkdir(output, { recursive: true });
createServer(async (request, response) => {
  const chunks = [];
  for await (const chunk of request) chunks.push(chunk);
  await appendFile(
    `${output}/server-capture.jsonl`,
    `${JSON.stringify({ url: request.url, body: (request.headers['content-encoding'] === 'gzip' ? gunzipSync(Buffer.concat(chunks)) : Buffer.concat(chunks)).toString() })}\n`,
  );
  response.writeHead(200, { 'content-type': 'application/json' });
  response.end('{}');
}).listen(3901, '127.0.0.1');
