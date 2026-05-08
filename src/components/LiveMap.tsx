import { useEffect, useRef, useState, useCallback } from 'react';
import mapboxgl from 'mapbox-gl';
import 'mapbox-gl/dist/mapbox-gl.css';
import { LayerToggle } from './LayerToggle';
import { BottomSheet } from './BottomSheet';
import { TimeFilter } from './TimeFilter';
import type { TimeFilterValue } from './TimeFilter';
import { getMockPosts, getMockStories } from '../store/communityApi';

import type { MapPin, HangoutPin, MockStory } from '../data/mockData';
import { useAppSelector } from '../store/store';
import './LiveMap.css';

mapboxgl.accessToken = import.meta.env.VITE_MAPBOX_ACCESS_TOKEN;

// Manhattan / NYU area center
const DEFAULT_CENTER: [number, number] = [-73.9960, 40.7320];
const DEFAULT_ZOOM = 14.5;

/**
 * Apply time filter to a list of pins.
 */
function applyTimeFilter(pins: MapPin[], filter: TimeFilterValue): MapPin[] {
  if (filter.mode === 'all') return pins;

  const now = Date.now();
  const twoHoursMs = 2 * 60 * 60 * 1000;
  const oneDayMs = 24 * 60 * 60 * 1000;
  const oneWeekMs = 7 * oneDayMs;

  return pins.filter((pin) => {
    const created = new Date(pin.createdAt).getTime();

    if (filter.mode === 'now') {
      if (pin.layer === 'free') {
        return (now - created < twoHoursMs) && (pin as any).status !== 'gone';
      }
      if (pin.layer === 'events') {
        return (pin as any).eventStatus === 'happening-now';
      }
      if (pin.layer === 'hangout') {
        return (pin as any).hangoutStatus === 'open' || (pin as any).hangoutStatus === 'started';
      }
      return now - created < twoHoursMs;
    }

    if (filter.mode === 'today') {
      const startOfDay = new Date();
      startOfDay.setHours(0, 0, 0, 0);
      return created >= startOfDay.getTime() || (pin.layer === 'events' && (pin as any).startTime && new Date((pin as any).startTime).getTime() >= startOfDay.getTime());
    }

    if (filter.mode === 'this-week') {
      return now - created < oneWeekMs;
    }

    if (filter.mode === 'custom' && filter.startTime && filter.endTime) {
      const start = new Date(filter.startTime).getTime();
      const end = new Date(filter.endTime).getTime();
      return created >= start && created <= end;
    }

    return true;
  });
}

export function LiveMap() {
  const mapContainer = useRef<HTMLDivElement>(null);
  const mapInstance = useRef<mapboxgl.Map | null>(null);
  const markersRef = useRef<Map<string, mapboxgl.Marker>>(new Map());
  const isInitialized = useRef(false);

  const [activeLayer, setActiveLayer] = useState<string>('all');
  const [selectedPin, setSelectedPin] = useState<MapPin | null>(null);
  const [isMapLoaded, setIsMapLoaded] = useState(false);
  const [timeFilter, setTimeFilter] = useState<TimeFilterValue>({ mode: 'all' });
  const [searchQuery, setSearchQuery] = useState('');
  
  const { user } = useAppSelector((state) => state.auth);

  // Get mock data directly -- no API calls
  const rawPins: MapPin[] = getMockPosts(activeLayer);

  // Apply time filter
  let pins = applyTimeFilter(rawPins, timeFilter);
  if (searchQuery) {
    const q = searchQuery.toLowerCase();
    pins = pins.filter(p => 
      p.title.toLowerCase().includes(q) || 
      p.description.toLowerCase().includes(q) || 
      (p as any).location?.toLowerCase().includes(q) || 
      p.postedBy?.toLowerCase().includes(q)
    );
  }

  // Count "happening now" items
  const happeningNowCount = pins.filter(
    (p) =>
      (p.layer === 'free' && (p as any).status === 'available') ||
      (p.layer === 'events' && (p as any).eventStatus === 'happening-now') ||
      (p.layer === 'hangout' && ((p as HangoutPin).hangoutStatus === 'open'))
  ).length;

  // Get stories linked to a specific pin
  const getStoriesForPin = useCallback((pinId: string): MockStory[] => {
    return getMockStories(pinId);
  }, []);

  // Create marker element for a pin
  const createMarkerElement = useCallback((pin: MapPin): HTMLDivElement => {
    const el = document.createElement('div');
    el.className = 'mapPin';

    // Check if this pin has live stories -- add gradient story ring
    const pinStories = getStoriesForPin(pin.id);
    if (pinStories.length > 0) {
      el.classList.add('hasStories');

      const inner = document.createElement('div');
      inner.className = 'mapPinInner';
      inner.style.backgroundImage = `url(${pin.imageUrl})`;
      el.appendChild(inner);

      const storyBadge = document.createElement('span');
      storyBadge.className = 'pinStoryBadge';
      storyBadge.textContent = String(pinStories.length);
      el.appendChild(storyBadge);
    } else {
      el.style.backgroundImage = `url(${pin.imageUrl})`;
    }

    if (pin.layer === 'free') {
      const free = pin as any;
      el.classList.add(
        free.status === 'available' ? 'statusAvailable' :
        free.status === 'running-low' ? 'statusRunningLow' : 'statusGone'
      );
      if (free.status === 'running-low' && free.quantityLeft) {
        const badge = document.createElement('span');
        badge.className = 'pinBadge';
        badge.textContent = free.quantityLeft;
        el.appendChild(badge);
      }
    } else if (pin.layer === 'events') {
      const event = pin as any;
      el.classList.add(
        event.eventStatus === 'happening-now' ? 'statusHappeningNow' : 'statusUpcoming'
      );
    } else if (pin.layer === 'marketplace') {
      const market = pin as any;
      el.classList.add('layerMarket');
      const badge = document.createElement('span');
      badge.className = 'pinPriceBadge';
      badge.textContent = `$${market.price}`;
      el.appendChild(badge);
    } else if (pin.layer === 'hangout') {
      const hangout = pin as HangoutPin;
      el.classList.add('layerHangout');
      const badge = document.createElement('span');
      badge.className = 'pinHangoutBadge';
      badge.textContent = `${hangout.currentJoiners}/${hangout.maxJoiners}`;
      el.appendChild(badge);
    }

    // Click handler
    el.addEventListener('click', (e) => {
      e.stopPropagation();
      setSelectedPin(pin);
      mapInstance.current?.flyTo({
        center: [pin.longitude, pin.latitude],
        zoom: 16,
        duration: 800,
      });
    });

    return el;
  }, [getStoriesForPin]);

  // Update markers on the map
  const updateMarkers = useCallback(() => {
    if (!mapInstance.current || !isMapLoaded) return;
    markersRef.current.forEach((marker) => marker.remove());
    markersRef.current.clear();

    pins.forEach((pin) => {
      const el = createMarkerElement(pin);
      const marker = new mapboxgl.Marker({ element: el, anchor: 'center' })
        .setLngLat([pin.longitude, pin.latitude])
        .addTo(mapInstance.current!);
      markersRef.current.set(pin.id, marker);
    });
  }, [pins, isMapLoaded, createMarkerElement]);

  const panToPinsRef = useRef({ filters: '', initialized: false });

  useEffect(() => {
    if (!mapInstance.current || !isMapLoaded) return;
    
    const filtersStr = `${activeLayer}-${JSON.stringify(timeFilter)}-${searchQuery}`;
    const filtersChanged = panToPinsRef.current.filters !== filtersStr;
    const isFirstPins = !panToPinsRef.current.initialized && pins.length > 0;

    if (filtersChanged || isFirstPins) {
      if (pins.length > 0) {
        const bounds = new mapboxgl.LngLatBounds();
        pins.forEach((pin) => {
          bounds.extend([pin.longitude, pin.latitude]);
        });
        mapInstance.current.fitBounds(bounds, { padding: 60, maxZoom: 16, duration: 800 });
        panToPinsRef.current.initialized = true;
      }
      panToPinsRef.current.filters = filtersStr;
    }
  }, [pins, isMapLoaded, activeLayer, timeFilter, searchQuery]);

  // Initialize map
  useEffect(() => {
    if (!mapContainer.current || isInitialized.current) return;
    isInitialized.current = true;

    const map = new mapboxgl.Map({
      container: mapContainer.current,
      style: 'mapbox://styles/mapbox/light-v11',
      center: DEFAULT_CENTER,
      zoom: DEFAULT_ZOOM,
      antialias: true,
    });

    mapInstance.current = map;

    map.addControl(new mapboxgl.NavigationControl(), 'bottom-right');

    map.on('load', () => {
      setIsMapLoaded(true);
    });

    map.on('click', () => {
      setSelectedPin(null);
    });

    return () => {
      markersRef.current.forEach((marker) => marker.remove());
      markersRef.current.clear();
      map.remove();
      mapInstance.current = null;
      isInitialized.current = false;
    };
  }, []);

  // Update markers when layer or time filter changes
  useEffect(() => {
    updateMarkers();
  }, [updateMarkers]);

  const handleLayerChange = (layer: string) => {
    setActiveLayer(layer);
    setSelectedPin(null);
  };

  return (
    <div className="mapPage">
      {/* Top bar -- search + layers + time filter */}
      <div className="mapTopBar">
        <div className="mapTopBarInner">
          <div className="mapSearchRow">
            <div className="searchIcon">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
                <circle cx="11" cy="11" r="8" />
                <line x1="21" y1="21" x2="16.65" y2="16.65" />
              </svg>
            </div>
            <input
              className="searchInput"
              placeholder="Search nearby..."
              type="text"
              id="map-search"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
            <button className="appLogo" id="app-logo">
              <span className="appLogoText">
                {user?.username ? user.username.charAt(0).toUpperCase() : 'S'}
              </span>
            </button>
          </div>
          <LayerToggle activeLayer={activeLayer} onLayerChange={handleLayerChange} showDemoData={true} />
          <TimeFilter value={timeFilter} onChange={setTimeFilter} />
        </div>
      </div>

      {/* Happening Now badge */}
      {happeningNowCount > 0 && !selectedPin && (
        <div className="happeningNowBadge">
          <span className="happeningNowDot" />
          {happeningNowCount} happening now
        </div>
      )}

      {/* Time filter active indicator */}
      {timeFilter.mode !== 'all' && (
        <div className="timeFilterActiveBadge">
          Showing: {timeFilter.mode === 'now' ? 'Happening Now' : timeFilter.mode === 'today' ? 'Today' : timeFilter.mode === 'this-week' ? 'This Week' : 'Custom Range'}
          <button
            className="timeFilterClear"
            onClick={() => setTimeFilter({ mode: 'all' })}
          >
            x
          </button>
        </div>
      )}

      {/* Map */}
      <div className="mapContainer">
        <div ref={mapContainer} className="mapContainerInner" />
      </div>

      {/* Bottom sheet */}
      {selectedPin && (
        <BottomSheet
          pin={selectedPin}
          onClose={() => setSelectedPin(null)}
          stories={getStoriesForPin(selectedPin.id)}
        />
      )}
    </div>
  );
}
