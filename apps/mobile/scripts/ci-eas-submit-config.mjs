// Writes the store credentials the CI run was given into the `submit.production` profile of eas.json.
// Used only by .github/workflows/mobile-release.yml, on a throwaway checkout.
//
// Env: PLATFORM (ios | android), and per platform
//   ios:     ASC_KEY_PATH, ASC_KEY_ID, ASC_ISSUER_ID, ASC_APP_ID (optional, looked up by bundle id when unset)
//   android: PLAY_KEY_PATH, ANDROID_TRACK (default internal)
// Prints `ready=true|false` for GITHUB_OUTPUT; never fails the job over missing store credentials.
import { createPrivateKey, sign } from 'node:crypto';
import { appendFileSync, readFileSync, writeFileSync } from 'node:fs';

const BUNDLE_ID = 'ai.easyrender.app';
const env = (name) => process.env[name]?.trim() || '';
const out = (ready, why = '') => {
  if (process.env.GITHUB_OUTPUT) appendFileSync(process.env.GITHUB_OUTPUT, `ready=${ready}\n`);
  if (!ready) console.log(`::warning::Build only, not submitting to the store: ${why}`);
  process.exit(0);
};

const b64url = (value) => Buffer.from(value).toString('base64url');

// The App Store Connect id of the app, found by bundle id with the API key.
async function lookupAscAppId() {
  const now = Math.floor(Date.now() / 1000);
  const header = b64url(JSON.stringify({ alg: 'ES256', kid: env('ASC_KEY_ID'), typ: 'JWT' }));
  const claims = b64url(
    JSON.stringify({
      iss: env('ASC_ISSUER_ID'),
      iat: now,
      exp: now + 600,
      aud: 'appstoreconnect-v1',
    }),
  );
  const signature = sign('sha256', Buffer.from(`${header}.${claims}`), {
    key: createPrivateKey(readFileSync(env('ASC_KEY_PATH'))),
    dsaEncoding: 'ieee-p1363',
  }).toString('base64url');
  const response = await fetch(
    `https://api.appstoreconnect.apple.com/v1/apps?filter[bundleId]=${BUNDLE_ID}`,
    { headers: { authorization: `Bearer ${header}.${claims}.${signature}` } },
  );
  if (!response.ok) throw new Error(`App Store Connect answered ${response.status}`);
  const { data } = await response.json();
  return data?.[0]?.id ?? '';
}

const file = new URL('../eas.json', import.meta.url);
const eas = JSON.parse(readFileSync(file, 'utf8'));
eas.submit ??= {};
eas.submit.production ??= {};
const profile = eas.submit.production;
const platform = env('PLATFORM');

if (platform === 'ios') {
  if (!env('ASC_KEY_PATH') || !env('ASC_KEY_ID') || !env('ASC_ISSUER_ID')) {
    out(false, 'App Store Connect API key secrets are not set.');
  }
  let appId = env('ASC_APP_ID');
  if (!appId) {
    try {
      appId = await lookupAscAppId();
    } catch (error) {
      out(false, `could not look up the app in App Store Connect (${error.message}).`);
    }
  }
  if (!appId)
    out(
      false,
      `no app with bundle id ${BUNDLE_ID} in App Store Connect yet. Create it, then re-run.`,
    );
  profile.ios = {
    ascAppId: appId,
    ascApiKeyPath: env('ASC_KEY_PATH'),
    ascApiKeyId: env('ASC_KEY_ID'),
    ascApiKeyIssuerId: env('ASC_ISSUER_ID'),
  };
} else if (platform === 'android') {
  if (!env('PLAY_KEY_PATH')) out(false, 'the Google Play service account secret is not set.');
  profile.android = {
    serviceAccountKeyPath: env('PLAY_KEY_PATH'),
    track: env('ANDROID_TRACK') || 'internal',
    releaseStatus: 'completed',
  };
} else {
  throw new Error('PLATFORM must be ios or android');
}

writeFileSync(file, `${JSON.stringify(eas, null, 2)}\n`);
out(true);
