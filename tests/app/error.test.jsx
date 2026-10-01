import { describe, expect, it, vi } from 'vitest';
import { fireEvent, render, screen } from '@testing-library/react';
import RouteError from '@/app/error';

describe('app/error.js', () => {
  it('shows a message and calls reset when "Try again" is pressed', () => {
    vi.spyOn(console, 'error').mockImplementation(() => {});
    const reset = vi.fn();

    render(<RouteError error={new Error('boom')} reset={reset} />);

    expect(screen.getByRole('heading', { name: 'Something went wrong' })).toBeInTheDocument();
    fireEvent.click(screen.getByRole('button', { name: 'Try again' }));
    expect(reset).toHaveBeenCalledTimes(1);
  });

  it('logs the error', () => {
    const log = vi.spyOn(console, 'error').mockImplementation(() => {});
    const error = new Error('boom');

    render(<RouteError error={error} reset={() => {}} />);

    expect(log).toHaveBeenCalledWith('Route error:', error);
  });
});
