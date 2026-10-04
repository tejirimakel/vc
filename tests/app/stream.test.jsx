import { beforeEach, describe, expect, it, vi } from 'vitest';
import { act, fireEvent, render, screen, waitFor } from '@testing-library/react';
import StreamPage from '@/app/stream/page';

const { instances } = vi.hoisted(() => ({ instances: [] }));

vi.mock('hls.js', () => {
  class Hls {
    static isSupported() {
      return true;
    }
    static Events = { ERROR: 'hlsError' };
    static ErrorTypes = { NETWORK_ERROR: 'networkError', MEDIA_ERROR: 'mediaError' };

    constructor() {
      this.handlers = {};
      this.loadSource = vi.fn();
      this.attachMedia = vi.fn();
      this.startLoad = vi.fn();
      this.recoverMediaError = vi.fn();
      this.destroy = vi.fn();
      instances.push(this);
    }

    on(event, handler) {
      this.handlers[event] = handler;
    }
  }
  return { default: Hls };
});

function stubFetch(response) {
  const fetchMock = vi.fn(async () => response);
  vi.stubGlobal('fetch', fetchMock);
  return fetchMock;
}

const okResponse = {
  ok: true,
  status: 200,
  json: async () => ({ url: 'https://example.com/live.m3u8' }),
};

function emitError(instance, data) {
  act(() => {
    instance.handlers.hlsError('hlsError', data);
  });
}

describe('StreamPage', () => {
  beforeEach(() => {
    instances.length = 0;
  });

  it('attaches the HLS player to the video element', async () => {
    stubFetch(okResponse);

    render(<StreamPage />);

    await waitFor(() => expect(instances).toHaveLength(1));
    expect(instances[0].loadSource).toHaveBeenCalledWith('https://example.com/live.m3u8');
    expect(instances[0].attachMedia.mock.calls[0][0]).toBeInstanceOf(HTMLVideoElement);
  });

  it('shows the error without the video after a fatal error, then re-attaches on retry', async () => {
    const fetchMock = stubFetch(okResponse);
    const { container } = render(<StreamPage />);
    await waitFor(() => expect(instances).toHaveLength(1));

    emitError(instances[0], { fatal: true, type: 'otherError' });

    expect(screen.getByText('Stream error. Please retry.')).toBeInTheDocument();
    expect(container.querySelector('video')).toBeNull();
    expect(instances[0].destroy).toHaveBeenCalled();

    fireEvent.click(screen.getByRole('button', { name: 'Retry' }));

    await waitFor(() => expect(instances).toHaveLength(2));
    expect(fetchMock).toHaveBeenCalledTimes(2);
    const video = instances[1].attachMedia.mock.calls[0][0];
    expect(video.isConnected).toBe(true);
    expect(screen.queryByText('Stream error. Please retry.')).toBeNull();
  });

  it('recovers once from a fatal network error before failing', async () => {
    stubFetch(okResponse);
    render(<StreamPage />);
    await waitFor(() => expect(instances).toHaveLength(1));

    instances[0].levels = [{}];
    emitError(instances[0], { fatal: true, type: 'networkError' });

    expect(instances[0].startLoad).toHaveBeenCalledTimes(1);
    expect(screen.queryByText('Stream error. Please retry.')).toBeNull();

    emitError(instances[0], { fatal: true, type: 'networkError' });

    expect(screen.getByText('Stream error. Please retry.')).toBeInTheDocument();
  });

  it('recovers once from a fatal media error', async () => {
    stubFetch(okResponse);
    render(<StreamPage />);
    await waitFor(() => expect(instances).toHaveLength(1));

    emitError(instances[0], { fatal: true, type: 'mediaError' });

    expect(instances[0].recoverMediaError).toHaveBeenCalledTimes(1);
    expect(screen.queryByText('Stream error. Please retry.')).toBeNull();
  });

  it('ignores non-fatal errors', async () => {
    stubFetch(okResponse);
    render(<StreamPage />);
    await waitFor(() => expect(instances).toHaveLength(1));

    emitError(instances[0], { fatal: false, type: 'networkError' });

    expect(instances[0].startLoad).not.toHaveBeenCalled();
    expect(screen.queryByText('Stream error. Please retry.')).toBeNull();
  });

  it('shows a calm "no broadcast" state, with no retry, when the stream is not configured', async () => {
    stubFetch({ ok: false, status: 503, json: async () => ({ error: 'Stream not configured' }) });

    const { container } = render(<StreamPage />);

    expect(await screen.findByText('No live broadcast right now')).toBeInTheDocument();
    expect(screen.queryByRole('button', { name: 'Retry' })).toBeNull();
    expect(container.querySelector('video')).toBeNull();
    expect(instances).toHaveLength(0);
  });

  it('shows an error with retry when the request fails', async () => {
    vi.stubGlobal('fetch', vi.fn(async () => {
      throw new TypeError('Failed to fetch');
    }));

    render(<StreamPage />);

    expect(await screen.findByText('Could not load stream')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Retry' })).toBeInTheDocument();
  });

  it('fails visibly on a fatal manifest error without trying to recover', async () => {
    stubFetch(okResponse);
    render(<StreamPage />);
    await waitFor(() => expect(instances).toHaveLength(1));

    emitError(instances[0], { fatal: true, type: 'networkError', details: 'manifestLoadError' });

    expect(instances[0].startLoad).not.toHaveBeenCalled();
    expect(screen.getByText('Stream error. Please retry.')).toBeInTheDocument();
  });

  it('shows an error with retry when native playback fails', async () => {
    stubFetch({ ok: true, status: 200, json: async () => ({ url: 'https://example.com/live.mp4' }) });
    const { container } = render(<StreamPage />);
    await waitFor(() => expect(container.querySelector('video')).not.toBeNull());

    fireEvent.error(container.querySelector('video'));

    expect(screen.getByText('Stream error. Please retry.')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Retry' })).toBeInTheDocument();
  });
});
