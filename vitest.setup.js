import '@testing-library/jest-dom/vitest';
import { createElement } from 'react';
import { afterEach, vi } from 'vitest';

// next/image: render a plain <img>, dropping props that are not DOM attributes.
vi.mock('next/image', () => ({
  default: ({ src, alt, fill, priority, quality, sizes, ...rest }) =>
    createElement('img', { src: typeof src === 'string' ? src : '', alt, ...rest }),
}));

// next/link: render a plain <a>.
vi.mock('next/link', () => ({
  default: ({ href, children, ...rest }) =>
    createElement('a', { href: typeof href === 'string' ? href : href?.pathname, ...rest }, children),
}));

// next/navigation: a stable fake router and empty params.
vi.mock('next/navigation', () => {
  const router = {
    back: vi.fn(),
    push: vi.fn(),
    replace: vi.fn(),
    refresh: vi.fn(),
    prefetch: vi.fn(),
  };
  return {
    useRouter: () => router,
    usePathname: () => '/',
    useParams: () => ({}),
    useSearchParams: () => new URLSearchParams(),
  };
});

afterEach(() => {
  localStorage.clear();
  sessionStorage.clear();
  vi.unstubAllGlobals();
  vi.restoreAllMocks();
  vi.useRealTimers();
});
