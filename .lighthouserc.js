/** @type {import('@lhci/cli').LighthouseConfig} */
module.exports = {
  ci: {
    collect: {
      url: ['http://localhost:3000', 'http://localhost:3000/news', 'http://localhost:3000/ecopy'],
      numberOfRuns: 3,
      settings: {
        preset: 'desktop',
        throttlingMethod: 'simulate',
      },
    },
    assert: {
      preset: 'lighthouse:recommended',
      assertions: {
        'categories:performance': ['warn', { minScore: 0.7 }],
        'categories:accessibility': ['error', { minScore: 0.85 }],
        'categories:best-practices': ['warn', { minScore: 0.8 }],
        'categories:seo': ['warn', { minScore: 0.8 }],
        'unused-javascript': 'off',
        'uses-http2': 'off',
        'uses-long-cache-ttl': 'off',
      },
    },
    upload: {
      target: 'temporary-public-storage',
    },
  },
};
