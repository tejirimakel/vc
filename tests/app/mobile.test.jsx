import { beforeEach, describe, expect, it, vi } from 'vitest';
import { fireEvent, render, screen } from '@testing-library/react';
import MobileHome from '@/app/mobile/page';

vi.mock('swiper/css', () => ({}));
vi.mock('swiper/modules', () => ({ Autoplay: {} }));
vi.mock('swiper/react', () => ({
  Swiper: ({ children }) => <div data-testid="carousel">{children}</div>,
  SwiperSlide: ({ children }) => <div>{children}</div>,
}));
vi.mock('@/components/splash', () => ({ default: () => null }));

const body = {
  newsFeed: [
    {
      id: 1,
      title: 'Crude prices rise',
      excerpt: 'Markets moved today.',
      image: '/one.jpg',
      date: '2026-09-01',
      categories: ['Oil & Gas'],
    },
    {
      id: 2,
      title: 'Grid upgrade announced',
      excerpt: 'New capacity planned.',
      image: '/two.jpg',
      date: '2026-09-01',
      categories: ['Power Sector'],
    },
  ],
  categories: ['Oil & Gas', 'Power Sector'],
  trendingNews: [],
};

function searchFor(text) {
  fireEvent.click(screen.getByRole('button', { name: 'Search' }));
  fireEvent.change(screen.getByRole('searchbox', { name: 'Search news' }), { target: { value: text } });
  fireEvent.click(screen.getByRole('button', { name: 'Close search' }));
}

describe('MobileHome', () => {
  beforeEach(() => {
    vi.stubGlobal('fetch', vi.fn(async () => ({ ok: true, status: 200, json: async () => body })));
  });

  it('shows full category names on the chips', async () => {
    render(<MobileHome />);

    expect(await screen.findByRole('button', { name: 'Oil & Gas' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Power Sector' })).toBeInTheDocument();
  });

  it('shows the active search after the overlay closes, and clears it', async () => {
    render(<MobileHome />);
    await screen.findByRole('button', { name: 'Oil & Gas' });

    searchFor('crude');

    expect(screen.getByText('Search: crude')).toBeInTheDocument();
    expect(screen.getByText('1 stories available')).toBeInTheDocument();

    fireEvent.click(screen.getByRole('button', { name: 'Clear search filter' }));

    expect(screen.queryByText('Search: crude')).toBeNull();
    expect(screen.getByText('2 stories available')).toBeInTheDocument();
  });

  it('shows no search chip when the query is only spaces', async () => {
    render(<MobileHome />);
    await screen.findByRole('button', { name: 'Oil & Gas' });

    searchFor('   ');

    expect(screen.queryByText(/^Search:/)).toBeNull();
  });
});
