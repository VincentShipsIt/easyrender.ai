import { randomBytes } from 'node:crypto';
import { mkdir, readFile, writeFile } from 'node:fs/promises';
import { dirname, join, resolve, sep } from 'node:path';
import { PutObjectCommand, S3Client } from '@aws-sdk/client-s3';
import { awsCredentialsProvider } from '@vercel/oidc-aws-credentials-provider';

const LOCAL_PREFIX = 'local:';

const localRoot = () =>
  resolve(
    /* turbopackIgnore: true */ process.env.DATA_DIR ??
      join(/* turbopackIgnore: true */ process.cwd(), '.data'),
  );

const withSuffix = (pathname: string) => {
  const dot = pathname.lastIndexOf('.');
  const suffix = randomBytes(6).toString('hex');
  return dot === -1
    ? `${pathname}-${suffix}`
    : `${pathname.slice(0, dot)}-${suffix}${pathname.slice(dot)}`;
};

let s3: S3Client | undefined;

// On Vercel, AWS_ROLE_ARN makes the client exchange the deployment's OIDC token for
// short-lived role credentials, so no static AWS keys live in the project.
const s3Client = () => {
  s3 ??= new S3Client({
    region: process.env.AWS_REGION,
    ...(process.env.AWS_ROLE_ARN
      ? { credentials: awsCredentialsProvider({ roleArn: process.env.AWS_ROLE_ARN }) }
      : {}),
  });
  return s3;
};

/** Stores bytes and returns the key getFile reads back: a CDN URL, or a local key in dev. */
export async function putFile(
  pathname: string,
  bytes: Uint8Array,
  contentType: string,
): Promise<string> {
  const key = withSuffix(pathname);
  const bucket = process.env.S3_BUCKET;
  if (bucket) {
    const cdn = process.env.ASSETS_CDN_URL;
    if (!cdn) throw new Error('ASSETS_CDN_URL is not set: it must point at the bucket CDN');
    await s3Client().send(
      new PutObjectCommand({
        Bucket: bucket,
        Key: key,
        Body: bytes,
        ContentType: contentType,
        CacheControl: 'public, max-age=31536000, immutable',
      }),
    );
    return `${cdn.replace(/\/+$/, '')}/${key}`;
  }
  if (process.env.VERCEL) {
    throw new Error('S3_BUCKET is not set: configure S3 storage for this deployment');
  }
  const target = join(localRoot(), key);
  await mkdir(dirname(target), { recursive: true });
  await writeFile(target, bytes);
  return `${LOCAL_PREFIX}${key}`;
}

export async function getFile(key: string): Promise<Uint8Array> {
  if (key.startsWith(LOCAL_PREFIX)) {
    const target = resolve(localRoot(), key.slice(LOCAL_PREFIX.length));
    if (!target.startsWith(localRoot() + sep)) throw new Error('invalid storage key');
    return new Uint8Array(await readFile(/* turbopackIgnore: true */ target));
  }
  const response = await fetch(key);
  if (!response.ok) throw new Error(`storage read failed: ${response.status}`);
  return new Uint8Array(await response.arrayBuffer());
}
