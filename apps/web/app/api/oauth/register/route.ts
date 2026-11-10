import { AppError, registerClient } from '@easyrender/core';
import { json, oauthError, preflight } from '@/lib/oauth-http';

// RFC 7591 dynamic client registration: MCP clients register themselves before asking a user.
export async function POST(request: Request) {
  try {
    const body = await request.json().catch(() => null);
    if (!body || typeof body !== 'object') {
      throw new AppError('Send a JSON client registration', 400, 'invalid_client_metadata');
    }
    return json(registerClient(body), { status: 201 });
  } catch (error) {
    return oauthError(error);
  }
}

export const OPTIONS = preflight;
