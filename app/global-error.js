'use client';

import { useEffect } from 'react';

export default function GlobalError({ error, reset }) {
  useEffect(() => {
    console.error('Global error:', error);
  }, [error]);

  return (
    <html lang="en">
      <body
        style={{
          margin: 0,
          minHeight: '100vh',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          padding: '1.5rem',
          textAlign: 'center',
          fontFamily: 'system-ui, sans-serif',
          background: '#07080c',
          color: '#fafafa',
        }}
      >
        <h1 style={{ fontSize: '1.5rem', fontWeight: 800, margin: 0 }}>Something went wrong</h1>
        <p role="alert" style={{ marginTop: '0.5rem', fontSize: '0.875rem', color: '#d4d4d4' }}>
          TheValueChain could not load. Please try again.
        </p>
        <button
          type="button"
          onClick={reset}
          style={{
            marginTop: '1.5rem',
            height: '3rem',
            padding: '0 1.5rem',
            border: 0,
            borderRadius: '9999px',
            background: '#b91c1c',
            color: '#ffffff',
            fontSize: '0.875rem',
            fontWeight: 700,
            cursor: 'pointer',
          }}
        >
          Try again
        </button>
      </body>
    </html>
  );
}
