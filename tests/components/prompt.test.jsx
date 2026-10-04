import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { act, fireEvent, render, screen } from '@testing-library/react';
import InstallPrompt from '@/components/prompt';
import { ConsentProvider } from '@/components/consent/ConsentProvider';

vi.mock('@/lib/pwaDisplayMode', () => ({ isInstalledPwa: () => false }));
vi.mock('@/lib/pwaClient', () => ({ requestPwaAccess: vi.fn(async () => ({})) }));

const IPHONE_UA =
  'Mozilla/5.0 (iPhone; CPU iPhone OS 17_0 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.0 Mobile/15E148 Safari/604.1';

function renderPrompt() {
  return render(
    <ConsentProvider>
      <InstallPrompt />
    </ConsentProvider>
  );
}

describe('InstallPrompt', () => {
  beforeEach(() => {
    Object.defineProperty(window.navigator, 'userAgent', { value: IPHONE_UA, configurable: true });
  });

  afterEach(() => {
    delete window.navigator.userAgent;
  });

  it('stays hidden while the cookie choice is undecided', async () => {
    renderPrompt();
    await act(async () => {});

    expect(screen.queryByText(/Install Thevaluechain/)).toBeNull();
  });

  it('appears once the visitor has answered the cookie banner', async () => {
    localStorage.setItem('tvc-consent', 'rejected');

    renderPrompt();

    expect(await screen.findByText(/Install Thevaluechain/)).toBeInTheDocument();
    expect(screen.getByText('Add to Home Screen')).toBeInTheDocument();
  });

  it('remembers dismissal in localStorage and writes no cookie', async () => {
    localStorage.setItem('tvc-consent', 'accepted');
    renderPrompt();
    await screen.findByText(/Install Thevaluechain/);

    fireEvent.click(screen.getByRole('button', { name: 'Dismiss install prompt' }));

    expect(screen.queryByText(/Install Thevaluechain/)).toBeNull();
    expect(Number(localStorage.getItem('pwa-install-dismissed'))).toBeGreaterThan(0);
    expect(document.cookie).not.toContain('pwa-');
  });

  it('stays hidden for 7 days after dismissal, then returns', async () => {
    const eightDaysAgo = Date.now() - 8 * 24 * 60 * 60 * 1000;
    const oneDayAgo = Date.now() - 24 * 60 * 60 * 1000;
    localStorage.setItem('tvc-consent', 'accepted');

    localStorage.setItem('pwa-install-dismissed', String(oneDayAgo));
    const first = renderPrompt();
    await act(async () => {});
    expect(screen.queryByText(/Install Thevaluechain/)).toBeNull();
    first.unmount();

    localStorage.setItem('pwa-install-dismissed', String(eightDaysAgo));
    renderPrompt();
    expect(await screen.findByText(/Install Thevaluechain/)).toBeInTheDocument();
  });
});
