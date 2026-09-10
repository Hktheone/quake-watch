import { CommonModule } from '@angular/common';
import {
  AfterViewInit,
  ChangeDetectionStrategy,
  Component,
  DestroyRef,
  ElementRef,
  Injector,
  OnDestroy,
  OnInit,
  ViewChild,
  computed,
  effect,
  inject,
  signal,
} from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { FormsModule } from '@angular/forms';
import { EarthquakeService, Earthquake } from '../../services/earthquake-service';
import Globe, { GlobeInstance } from 'globe.gl';

interface MagnitudeOption {
  label: string;
  value: number;
}

const MAGNITUDE_OPTIONS: MagnitudeOption[] = [
  { label: 'All magnitudes', value: -Infinity },
  { label: 'M 2.5+', value: 2.5 },
  { label: 'M 4.5+', value: 4.5 },
  { label: 'M 6.0+', value: 6.0 },
  { label: 'M 7.0+', value: 7.0 },
];

function magnitudeColor(magnitude: number): string {
  if (magnitude >= 7) return '#8b0000';
  if (magnitude >= 6) return '#ff3b30';
  if (magnitude >= 4.5) return '#ff9500';
  if (magnitude >= 2.5) return '#ffd60a';
  return '#34c759';
}

@Component({
  selector: 'app-dashboard',
  imports: [CommonModule, FormsModule],
  templateUrl: './dashboard.html',
  styleUrl: './dashboard.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class Dashboard implements OnInit, AfterViewInit, OnDestroy {
  @ViewChild('globeContainer', { static: true }) globeContainer!: ElementRef<HTMLDivElement>;

  private earthquakeService = inject(EarthquakeService);
  private injector = inject(Injector);
  private destroyRef = inject(DestroyRef);

  magnitudeOptions = MAGNITUDE_OPTIONS;
  minMagnitude = signal(-Infinity);
  regionFilter = signal('');

  private earthquakes = signal<Earthquake[]>([]);

  // Built from whatever regions are actually present in the live feed right
  // now — never a fixed/sample list.
  regions = computed(() => {
    const set = new Set(this.earthquakes().map(e => e.region));
    return Array.from(set).sort((a, b) => a.localeCompare(b));
  });

  filteredEarthquakes = computed(() => {
    const min = this.minMagnitude();
    const region = this.regionFilter();
    return this.earthquakes()
      .filter(e => e.magnitude >= min)
      .filter(e => !region || e.region === region);
  });

  hasData = computed(() => this.earthquakes().length > 0);
  hasResults = computed(() => this.filteredEarthquakes().length > 0);
  totalCount = computed(() => this.earthquakes().length);
  hasActiveFilter = computed(() => this.minMagnitude() !== -Infinity || this.regionFilter() !== '');

  strongestQuake = computed<Earthquake | null>(() => {
    const quakes = this.earthquakes();
    if (quakes.length === 0) return null;
    return quakes.reduce((max, q) => (q.magnitude > max.magnitude ? q : max), quakes[0]);
  });

  averageMagnitude = computed(() => {
    const quakes = this.earthquakes();
    if (quakes.length === 0) return 0;
    return quakes.reduce((sum, q) => sum + q.magnitude, 0) / quakes.length;
  });

  activeRegionCount = computed(() => this.regions().length);

  recentQuakes = computed(() =>
    this.filteredEarthquakes()
      .slice()
      .sort((a, b) => b.time - a.time)
      .slice(0, 8)
  );

  ngOnInit() {
    this.earthquakeService.getEarthquakes()
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe(quakes => this.earthquakes.set(quakes));
  }

  private globeInstance?: GlobeInstance;
  private canvasHost?: HTMLElement;
  private resizeHandler = () => this.resize();
  private pauseRotation = () => { if (this.globeInstance) this.globeInstance.controls().autoRotate = false; };
  private resumeRotation = () => { if (this.globeInstance) this.globeInstance.controls().autoRotate = true; };

  ngAfterViewInit() {
    const el = this.globeContainer.nativeElement;
    this.canvasHost = el;

    this.globeInstance = new Globe(el)
      .globeImageUrl('https://unpkg.com/three-globe/example/img/earth-blue-marble.jpg')
      .bumpImageUrl('https://unpkg.com/three-globe/example/img/earth-topology.png')
      .backgroundColor('rgba(0,0,0,0)')
      .pointOfView({ lat: 20, lng: 0, altitude: 2.2 })
      .pointsData(this.filteredEarthquakes())
      .pointLat('lat')
      .pointLng('lng')
      .pointColor((d: object) => magnitudeColor((d as Earthquake).magnitude))
      .pointRadius((d: object) => 0.25 + (d as Earthquake).magnitude * 0.12)
      .pointAltitude((d: object) => 0.01 + (d as Earthquake).magnitude * 0.012)
      .pointLabel((d: object) => this.buildTooltip(d as Earthquake));

    const controls = this.globeInstance.controls();
    controls.autoRotate = true;
    controls.autoRotateSpeed = 0.4;

    effect(() => {
      this.globeInstance?.pointsData(this.filteredEarthquakes());
    }, { injector: this.injector });

    window.addEventListener('resize', this.resizeHandler);
    el.addEventListener('mouseenter', this.pauseRotation);
    el.addEventListener('mouseleave', this.resumeRotation);
    this.resize();
  }

  clearFilters() {
    this.minMagnitude.set(-Infinity);
    this.regionFilter.set('');
  }

  magnitudeColorFor(magnitude: number): string {
    return magnitudeColor(magnitude);
  }

  private buildTooltip(quake: Earthquake): string {
    const time = new Date(quake.time).toLocaleString(undefined, {
      dateStyle: 'medium',
      timeStyle: 'short',
    });
    return `<div style="background:#1a1a1a;color:#fff;padding:8px 12px;border-radius:6px;font-size:13px;max-width:260px;line-height:1.5;">
      <b>M ${quake.magnitude.toFixed(1)}</b> — ${quake.place}<br/>
      Region: ${quake.region}<br/>
      Depth: ${quake.depthKm.toFixed(1)} km<br/>
      ${time}
    </div>`;
  }

  private resize() {
    if (!this.globeInstance) return;
    const el = this.globeContainer.nativeElement;
    this.globeInstance.width(el.clientWidth);
    this.globeInstance.height(el.clientHeight);
  }

  ngOnDestroy() {
    window.removeEventListener('resize', this.resizeHandler);
    this.canvasHost?.removeEventListener('mouseenter', this.pauseRotation);
    this.canvasHost?.removeEventListener('mouseleave', this.resumeRotation);
    this.globeInstance?._destructor?.();
  }
}
