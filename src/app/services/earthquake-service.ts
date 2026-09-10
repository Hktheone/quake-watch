import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { EMPTY, Observable, interval } from 'rxjs';
import { catchError, map, shareReplay, startWith, switchMap } from 'rxjs/operators';

export interface Earthquake {
  id: string;
  magnitude: number;
  place: string;
  region: string;
  lat: number;
  lng: number;
  depthKm: number;
  time: number;
  url: string;
}

interface UsgsFeature {
  id: string;
  properties: {
    mag: number | null;
    place: string | null;
    time: number;
    url: string;
  };
  geometry: {
    coordinates: [number, number, number];
  };
}

interface UsgsFeed {
  features: UsgsFeature[];
}

// USGS place strings read like "12km NNE of Somewhere, CA" or "150km SW of
// Valparaiso, Chile" — no structured country/region field exists, so we take
// the text after the last comma as-is rather than guess at an ISO code.
function deriveRegion(place: string): string {
  const parts = place.split(',');
  return parts[parts.length - 1].trim();
}

@Injectable({ providedIn: 'root' })
export class EarthquakeService {
  private readonly FEED_URL = 'https://earthquake.usgs.gov/earthquakes/feed/v1.0/summary/all_day.geojson';

  constructor(private http: HttpClient) {}

  // Shared, cached stream — one poll for the whole app, not one per
  // subscriber, so navigating around doesn't multiply request volume against
  // USGS. Their own feed refreshes roughly once a minute, so we match that.
  private earthquakes$: Observable<Earthquake[]> = interval(60000).pipe(
    startWith(0),
    switchMap(() =>
      this.http.get<UsgsFeed>(this.FEED_URL).pipe(
        map(feed =>
          feed.features
            .filter((f): f is UsgsFeature & { properties: { mag: number; place: string } } =>
              f.properties.mag != null && f.properties.place != null
            )
            .map((f): Earthquake => ({
              id: f.id,
              magnitude: f.properties.mag,
              place: f.properties.place,
              region: deriveRegion(f.properties.place),
              lng: f.geometry.coordinates[0],
              lat: f.geometry.coordinates[1],
              depthKm: f.geometry.coordinates[2],
              time: f.properties.time,
              url: f.properties.url,
            }))
        ),
        catchError(error => {
          console.error('USGS Earthquake API error:', error);
          return EMPTY;
        })
      )
    ),
    shareReplay({ bufferSize: 1, refCount: false })
  );

  getEarthquakes(): Observable<Earthquake[]> {
    return this.earthquakes$;
  }
}
