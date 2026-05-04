// ArenaIQ — Sentry error tracking
// Replace SENTRY_DSN with your DSN from sentry.io:
//   1. Go to sentry.io → create free account
//   2. New Project → Browser JavaScript
//   3. Copy the DSN (looks like https://abc123@o123.ingest.sentry.io/456)
//   4. Paste it below and also set it as a Railway environment variable: SENTRY_DSN

(function () {
  const dsn = window.__SENTRY_DSN__;
  if (!dsn || dsn === 'YOUR_SENTRY_DSN') return; // skip if not configured

  const script = document.createElement('script');
  script.src = 'https://browser.sentry-cdn.com/8.5.0/bundle.min.js';
  script.crossOrigin = 'anonymous';
  script.onload = function () {
    Sentry.init({
      dsn,
      tracesSampleRate: 0.2, // capture 20% of transactions for performance
      beforeSend(event) {
        // Don't send errors from localhost
        if (window.location.hostname === 'localhost') return null;
        return event;
      },
    });
  };
  document.head.appendChild(script);
})();
