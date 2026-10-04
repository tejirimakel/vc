import { useRef } from 'react';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { act, render, screen } from '@testing-library/react';
import { useContainerWidth } from '@/lib/useContainerWidth';

let resize;
let disconnect;

function Probe() {
  const ref = useRef(null);
  const width = useContainerWidth(ref);
  return (
    <div ref={ref} data-testid="box">
      {width}
    </div>
  );
}

function fire(width) {
  act(() => {
    resize([{ contentRect: { width } }]);
  });
}

describe('useContainerWidth', () => {
  beforeEach(() => {
    vi.useFakeTimers();
    disconnect = vi.fn();
    vi.stubGlobal(
      'ResizeObserver',
      class {
        constructor(callback) {
          resize = callback;
        }
        observe() {}
        disconnect() {
          disconnect();
        }
      }
    );
  });

  it('starts at the initial width', () => {
    render(<Probe />);

    expect(screen.getByTestId('box')).toHaveTextContent('345');
  });

  it('applies the first measurement at once, rounded down to 16px', () => {
    render(<Probe />);

    fire(500);

    expect(screen.getByTestId('box')).toHaveTextContent('496');
  });

  it('waits 150ms after the last resize before applying later measurements', () => {
    render(<Probe />);
    fire(500);

    fire(550);
    fire(603);
    expect(screen.getByTestId('box')).toHaveTextContent('496');

    act(() => {
      vi.advanceTimersByTime(149);
    });
    expect(screen.getByTestId('box')).toHaveTextContent('496');

    act(() => {
      vi.advanceTimersByTime(1);
    });
    expect(screen.getByTestId('box')).toHaveTextContent('592');
  });

  it('caps the width at 820 before rounding', () => {
    render(<Probe />);

    fire(2000);

    expect(screen.getByTestId('box')).toHaveTextContent('816');
  });

  it('disconnects and cancels a pending update on unmount', () => {
    const { unmount } = render(<Probe />);
    fire(500);
    fire(700);

    unmount();

    expect(disconnect).toHaveBeenCalledTimes(1);
    expect(vi.getTimerCount()).toBe(0);
  });
});
