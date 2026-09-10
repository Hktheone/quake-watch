# QuakeWatch

Live real earthquake activity from USGS, plotted on a 3D globe with magnitude/region filters, stat cards, and a recent-activity feed. No backend, no database, no API keys.

![Dashboard](docs/screenshots/dashboard.png)

## What this is

A single-page Angular 22 app that reads a public earthquake feed and renders it — nothing more.

- **Data source**: [USGS Earthquake Hazards Program](https://earthquake.usgs.gov/earthquakes/feed/v1.0/summary/all_day.geojson) — free, public, no key, no subscription.
- **Refresh**: polled every **60 seconds**. No WebSocket — plain HTTP polling, one shared poll for the whole app (not one per component).
- **Globe**: rendered with [`globe.gl`](https://github.com/vasturiano/globe.gl) (Three.js/WebGL) — not Google Maps or Mapbox, no map API key involved.
- **Filters**: magnitude (All / 2.5+ / 4.5+ / 6.0+ / 7.0+) and region. Region is built live from whatever's in the current data (parsed from USGS's own place text, e.g. "5 km NNW of Beaumont, CA" → "CA") — never a fixed list, and deliberately labeled "Region" rather than "Country," since USGS's feed has no real country code.
- **Markers**: colored/sized by magnitude (green → yellow → orange → red → dark red), hover tooltip with magnitude/place/region/depth/time, auto-rotation pauses while you're looking at it.
- **Dark / light mode**: toggle in the top bar, persisted to `localStorage`.

## Stack & architecture

Angular 22, standalone components (no NgModules), TypeScript strict mode, Signals for all state (no NgRx), plain CSS with custom-property theming.

```
MainLayout (TopBar + router-outlet)
└─ Dashboard   (the only route — stats, filters, globe, recent list)
```

Services: `EarthquakeService` (the shared polling stream), `StateService` (alert toasts), `ThemeService` (dark/light).

One gotcha if you touch the globe code: `globe.gl` takes over the DOM element it's given, wiping its children — so it needs its own dedicated `<div>`, never a container that also holds Angular's `@if`/`@else` overlays, or Angular's structural-directive anchors get destroyed permanently.

## Known limitations

- `ng test` isn't actually verified working in this environment (Karma/Jasmine deps never fully resolved)
- Bundle is ~2.3MB (over the default budget, raised intentionally) — mostly `globe.gl`/Three.js
- No persistence — everything is either live data or ephemeral UI state (filters, theme)

This project was generated using [Angular CLI](https://github.com/angular/angular-cli) version 22.0.7.

## Development server

To start a local development server, run:

```bash
ng serve
```

Once the server is running, open your browser and navigate to `http://localhost:4200/`. The application will automatically reload whenever you modify any of the source files.

## Code scaffolding

Angular CLI includes powerful code scaffolding tools. To generate a new component, run:

```bash
ng generate component component-name
```

For a complete list of available schematics (such as `components`, `directives`, or `pipes`), run:

```bash
ng generate --help
```

## Building

To build the project run:

```bash
ng build
```

This will compile your project and store the build artifacts in the `dist/` directory. By default, the production build optimizes your application for performance and speed.

## Running unit tests

To execute unit tests with the [Vitest](https://vitest.dev/) test runner, use the following command:

```bash
ng test
```

## Running end-to-end tests

For end-to-end (e2e) testing, run:

```bash
ng e2e
```

Angular CLI does not come with an end-to-end testing framework by default. You can choose one that suits your needs.

## Additional Resources

For more information on using the Angular CLI, including detailed command references, visit the [Angular CLI Overview and Command Reference](https://angular.dev/tools/cli) page.
