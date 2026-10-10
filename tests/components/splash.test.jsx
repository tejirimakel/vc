import { describe, expect, it, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import SplashScreen from '@/components/splash';

vi.mock('@/lib/pwaDisplayMode', () => ({ isInstalledPwa: () => true }));

describe('SplashScreen', () => {
  it('shows the splash once per session in the installed app', () => {
    render(<SplashScreen />);

    expect(screen.getByAltText('TheValueChain')).toBeInTheDocument();
    expect(sessionStorage.getItem('splashShown')).toBe('true');
  });

  it('does not show the splash again in the same session', () => {
    sessionStorage.setItem('splashShown', 'true');

    const { container } = render(<SplashScreen />);

    expect(container).toBeEmptyDOMElement();
  });

  it('renders nothing, without throwing, when storage is blocked', () => {
    vi.spyOn(Storage.prototype, 'getItem').mockImplementation(() => {
      throw new DOMException('The operation is insecure.', 'SecurityError');
    });

    let container;
    expect(() => {
      ({ container } = render(<SplashScreen />));
    }).not.toThrow();
    expect(container).toBeEmptyDOMElement();
  });
});
