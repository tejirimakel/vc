/** @type {import('@lhci/cli').LighthouseConfig} */
module.exports = {
  ci: {
    collect: {
      // Only audit publicly reachable routes. /news, /ecopy, /mobile, /video
      // and /stream are gated by middleware.js and redirect unauthenticated
      // CI requests to /?access=required, so auditing them measures the
      // redirect target, not the page. /offline is the PWA fallback shell.
      url: ['http://localhost:3000', 'http://localhost:3000/offline'],
      numberOfRuns: 3,
      settings: {
        preset: 'desktop',
        throttlingMethod: 'simulate',
      },
    },
    assert: {
      assertions: {
        'categories:performance': ['warn', { minScore: 0.7 }],
        'categories:accessibility': ['error', { minScore: 0.85 }],
        'categories:best-practices': ['warn', { minScore: 0.8 }],
        'categories:seo': ['warn', { minScore: 0.8 }],
      },
    },
    upload: {
      target: 'temporary-public-storage',
    },
  },
};
