import { toNextJsHandler } from 'better-auth/next-js';
import { auth } from '@/lib/auth';

const handler = () => toNextJsHandler(auth());

export const GET = (request: Request) => handler().GET(request);
export const POST = (request: Request) => handler().POST(request);
