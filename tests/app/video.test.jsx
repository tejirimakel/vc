import { beforeEach, describe, expect, it, vi } from 'vitest';
import { fireEvent, render, screen } from '@testing-library/react';
import Videos from '@/app/video/page';

const items = [
  {
    id: 'aaa',
    title: 'First clip',
    description: 'Newest video',
    thumbnailUrl: '/first.jpg',
    published: '2026-09-02T10:00:00Z',
    link: 'https://www.youtube.com/watch?v=aaa',
  },
  {
    id: 'bbb',
    title: 'Second clip',
    description: 'Older video',
    thumbnailUrl: '/second.jpg',
    published: '2026-09-01T10:00:00Z',
    link: 'https://www.youtube.com/watch?v=bbb',
  },
];

describe('Videos page', () => {
  beforeEach(() => {
    vi.stubGlobal('fetch', vi.fn(async () => ({ ok: true, status: 200, json: async () => ({ items }) })));
    window.scrollTo = vi.fn();
  });

  it('labels only the newest video as the latest episode', async () => {
    render(<Videos />);

    expect(await screen.findByText('Latest episode')).toBeInTheDocument();

    fireEvent.click(screen.getAllByRole('button', { name: /Second clip/ })[0]);

    expect(screen.getByRole('heading', { level: 2, name: 'Second clip' })).toBeInTheDocument();
    expect(screen.queryByText('Latest episode')).toBeNull();
  });

  it('returns to the play button, with no iframe, when another video is selected', async () => {
    render(<Videos />);

    fireEvent.click(await screen.findByRole('button', { name: 'Play video: First clip' }));
    fireEvent.click(screen.getByRole('button', { name: 'Load video' }));
    expect(screen.getByTitle('First clip').tagName).toBe('IFRAME');

    fireEvent.click(screen.getAllByRole('button', { name: /Second clip/ })[0]);

    expect(document.querySelector('iframe')).toBeNull();
    expect(screen.getByRole('button', { name: 'Play video: Second clip' })).toBeInTheDocument();
  });
});
