import {
  AppError,
  bearerSessionToken,
  shopifyOverview,
  verifySessionToken,
} from '@easyrender/core';
import { NextResponse } from 'next/server';
import { handle } from '@/lib/http';

export const maxDuration = 60;

// The embedded Shopify page's state: whether the shop is linked to an easyrender account, what a
// whole-catalogue run costs, and how the shop's products are doing. Authenticated by the session
// token App Bridge gives the page; polling it also moves the shop's queue forward.
export const GET = (request: Request) =>
  handle(async () => {
    const token = bearerSessionToken(request.headers);
    if (!token) throw new AppError('Open this page from Shopify', 401, 'bad_session');
    const shop = verifySessionToken(token);
    return NextResponse.json(await shopifyOverview(shop, token), {
      headers: { 'cache-control': 'no-store' },
    });
  });
