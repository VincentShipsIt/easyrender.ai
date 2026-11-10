import { bearerToken, resourceMetadataUrl, verifyApiKey } from '@easyrender/core';
import { createMcpServer } from '@easyrender/mcp';
import { WebStandardStreamableHTTPServerTransport } from '@modelcontextprotocol/sdk/server/webStandardStreamableHttp.js';
import { NextResponse } from 'next/server';

export const maxDuration = 60;

// Stateless Streamable HTTP: every request builds its own server for the key's owner.
async function serve(request: Request): Promise<Response> {
  const userId = await verifyApiKey(bearerToken(request.headers));
  if (!userId) {
    return NextResponse.json(
      { error: 'Pass an easyrender API key as `Authorization: Bearer er_...`' },
      {
        status: 401,
        headers: { 'www-authenticate': `Bearer resource_metadata="${resourceMetadataUrl()}"` },
      },
    );
  }
  const server = createMcpServer({ userId });
  const transport = new WebStandardStreamableHTTPServerTransport({
    sessionIdGenerator: undefined,
    enableJsonResponse: true,
  });
  await server.connect(transport);
  return transport.handleRequest(request);
}

export { serve as DELETE, serve as GET, serve as POST };
