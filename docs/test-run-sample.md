# Sample Playwright test run

A real run of the e2e suite (`e2e/dashboard.spec.ts`) against the live app, chromium project only. Regenerate with:

```bash
npx playwright test --project=chromium --reporter=list
```

```
Running 5 tests using 5 workers

  ok 1 [chromium] › e2e\dashboard.spec.ts:11:7 › QuakeWatch dashboard › has the correct page title (1.8s)
  ok 2 [chromium] › e2e\dashboard.spec.ts:21:7 › QuakeWatch dashboard › filtering by magnitude narrows the result count and can be cleared (3.3s)
  ok 3 [chromium] › e2e\dashboard.spec.ts:15:7 › QuakeWatch dashboard › shows live earthquake stats and a recent-activity list (3.7s)
  ok 5 [chromium] › e2e\dashboard.spec.ts:34:7 › QuakeWatch dashboard › filtering by region only shows earthquakes from that region (3.9s)
  ok 4 [chromium] › e2e\dashboard.spec.ts:48:7 › QuakeWatch dashboard › dark/light toggle switches the theme and persists on reload (4.1s)

  5 passed (10.7s)
```

Ran against real, live USGS data (no mocking) — the magnitude/region filter tests read whatever's actually in the feed at run time rather than asserting on fixed values, so they stay valid regardless of what's happening seismically that day.
