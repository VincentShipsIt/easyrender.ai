import { captureException } from '@sentry/core';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { reportError } from './report';

vi.mock('@sentry/core', () => ({ captureException: vi.fn() }));

describe('reportError', () => {
  afterEach(() => vi.restoreAllMocks());

  it('sends the failure to Sentry with the render it belongs to', () => {
    vi.spyOn(console, 'error').mockImplementation(() => undefined);
    const error = new Error('Replicate POST /predictions: 429');
    reportError(error, { renderId: 'r1' });
    expect(captureException).toHaveBeenCalledWith(error, { extra: { renderId: 'r1' } });
  });
});
