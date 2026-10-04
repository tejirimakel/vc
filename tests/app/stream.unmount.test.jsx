import { describe, expect, it, vi } from 'vitest';
import { act, render, waitFor } from '@testing-library/react';
import StreamPage from '@/app/stream/page';

const { instances, gate } = vi.hoisted(() => {
  let release;
  const promise = new Promise((resolve) => {
    release = resolve;
  });
  return { instances: [], gate: { promise, release } };
});

vi.mock('hls.js', async () => {
  await gate.promise;
  class Hls {
    static isSupported() {
      return true;
    }
    static Events = { ERROR: 'hlsError' };
    static ErrorTypes = { NETWORK_ERROR: 'networkError', MEDIA_ERROR: 'mediaError' };
    constructor() {
      this.loadSource = vi.fn();
      this.attachMedia = vi.fn();
      this.destroy = vi.fn();
      instances.push(this);
    }
    on() {}
  }
  return { default: Hls };
});

describe('StreamPage unmount during import', () => {
  it('does not create a player if the page unmounts while hls.js is loading', async () => {
    vi.stubGlobal('fetch', vi.fn(async () => ({
      ok: true,
      status: 200,
      json: async () => ({ url: 'https://example.com/live.m3u8' }),
    })));
    const { container, unmount } = render(<StreamPage />);
    await waitFor(() => expect(container.querySelector('video')).not.toBeNull());

    unmount();
    gate.release();
    await act(async () => {});

    expect(instances).toHaveLength(0);
  });
});
