import { memo, useState } from 'react';
import { describe, expect, it } from 'vitest';
import { act, fireEvent, render, screen } from '@testing-library/react';
import { ConsentProvider, useConsent } from '@/components/consent/ConsentProvider';

describe('ConsentProvider', () => {
  it('does not re-render consumers when only its parent re-renders', async () => {
    let renders = 0;
    const Consumer = memo(function Consumer() {
      useConsent();
      renders += 1;
      return null;
    });

    function Parent() {
      const [, setTick] = useState(0);
      return (
        <>
          <button type="button" onClick={() => setTick((tick) => tick + 1)}>
            tick
          </button>
          <ConsentProvider>
            <Consumer />
          </ConsentProvider>
        </>
      );
    }

    render(<Parent />);
    await act(async () => {});
    const before = renders;

    fireEvent.click(screen.getByRole('button', { name: 'tick' }));

    expect(renders).toBe(before);
  });

  it('exposes the stored choice and updates it', async () => {
    localStorage.setItem('tvc-consent', 'rejected');

    function Probe() {
      const { status, ready, accept } = useConsent();
      return (
        <button type="button" onClick={accept}>
          {ready ? status : 'loading'}
        </button>
      );
    }

    render(
      <ConsentProvider>
        <Probe />
      </ConsentProvider>
    );

    expect(await screen.findByRole('button', { name: 'rejected' })).toBeInTheDocument();
    fireEvent.click(screen.getByRole('button'));
    expect(screen.getByRole('button', { name: 'accepted' })).toBeInTheDocument();
    expect(localStorage.getItem('tvc-consent')).toBe('accepted');
  });
});
