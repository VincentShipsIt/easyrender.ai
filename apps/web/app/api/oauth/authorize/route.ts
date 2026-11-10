import { AppError, config, issueCode, parseAuthorizeRequest, redirectWith } from '@easyrender/core';
import { NextResponse } from 'next/server';
import { currentUser } from '@/lib/actor';
import { errorResponse } from '@/lib/http';

// The consent form posts here. Re-validates the original request, then redirects back to the
// client with a code (approve) or access_denied (deny).
export async function POST(request: Request) {
  try {
    if (new URL(request.headers.get('origin') ?? 'null:').host !== new URL(config.appUrl()).host) {
      throw new AppError('Cross-site request blocked', 403, 'forbidden');
    }
    const user = await currentUser();
    if (!user) throw new AppError('Sign in first', 401, 'unauthorized');
    const form = await request.formData();
    const query = String(form.get('query') ?? '');
    const auth = parseAuthorizeRequest(new URLSearchParams(query));
    const params: Record<string, string | null> =
      form.get('decision') === 'approve'
        ? { code: issueCode(auth, user.id), state: auth.state }
        : { error: 'access_denied', state: auth.state };
    return NextResponse.redirect(redirectWith(auth.redirectUri, params), 303);
  } catch (error) {
    return errorResponse(error);
  }
}
