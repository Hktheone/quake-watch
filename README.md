# QuakeWatch

Live real earthquake activity from USGS, plotted on a 3D globe with magnitude/region filters, stat cards, and a recent-activity feed. No backend, no API keys.

![Dashboard](docs/screenshots/dashboard.png)

See [TECHNICAL.md](TECHNICAL.md) for architecture details, data flow, and implementation notes.

## What this actually is

QuakeWatch shows every earthquake detected anywhere in the world over the last 24 hours, live, on an interactive 3D globe. There's no backend server, no database, no user accounts — it's a single Angular app that reads directly from a public data feed and renders it.

**Data source & subscription** — earthquake data comes from the [USGS Earthquake Hazards Program](https://earthquake.usgs.gov/earthquakes/feed/v1.0/summary/all_day.geojson), a free, public GeoJSON feed run by the US Geological Survey. No API key, no account, no subscription tier of any kind — it's open government data, free to use, forever.

**Refresh rate** — the app polls that feed every **60 seconds**. There is **no WebSocket** and no push/streaming connection involved — it's plain HTTP polling on a fixed interval, one shared poll for the whole app (not one per component). 60s was chosen to match how often USGS actually updates the feed on their end; polling faster wouldn't surface anything newer.

**Maps / globe** — earthquakes are rendered on a 3D globe using [`globe.gl`](https://github.com/vasturiano/globe.gl) (built on Three.js/WebGL). This is **not Google Maps or Mapbox** — there's no map-provider account or API key involved either. The Earth texture and terrain bump map are static images pulled from a public CDN.

**Search & filters** — two live dropdowns on the dashboard:
- **Magnitude**: All / M2.5+ / M4.5+ / M6.0+ / M7.0+
- **Region**: built dynamically from whatever regions actually show up in the current live data (parsed out of USGS's own place text, e.g. "5 km NNW of Beaumont, CA" → "CA") — never a fixed list, and intentionally labeled "Region" rather than "Country," since USGS's feed doesn't include a real country code.

Each marker on the globe is colored and sized by magnitude (green → yellow → orange → red → dark red for the strongest quakes), shows a tooltip on hover (magnitude, place, region, depth, time), and the globe stops auto-rotating while your cursor is over it.

**Dark / light mode** — toggle in the top bar, remembered across visits via `localStorage`, applied instantly by switching a `data-theme` attribute that swaps a full set of CSS custom properties — no reload needed.

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
