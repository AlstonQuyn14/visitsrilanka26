import { useEffect, useRef, useState } from "react";
import { createFileRoute, Link } from "@tanstack/react-router";
import {
  ArrowLeft,
  Navigation,
  Layers,
  X,
  MapPin,
  Route as RouteIcon,
  Crosshair,
  LocateFixed,
  PersonStanding,
} from "lucide-react";
import { AppShell } from "@/components/layout/AppShell";
import { iconicPlaces, sriLankaCenter, type IconicPlace } from "@/lib/data";
import { useGoogleMaps } from "@/lib/useGoogleMaps";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/map")({
  head: () => ({
    meta: [
      { title: "Live Map & Street View — Visit Sri Lanka" },
      {
        name: "description",
        content:
          "Track your real-time location on an interactive 3D map of Sri Lanka, explore Street View, discover iconic landmarks and plan your route.",
      },
      { property: "og:title", content: "Live Map & Street View — Visit Sri Lanka" },
      {
        property: "og:description",
        content:
          "Real-time location, Street View and iconic places on an interactive map of Sri Lanka.",
      },
    ],
  }),
  validateSearch: (search: Record<string, unknown>) => ({
    lat:
      search.lat !== undefined && search.lat !== "" ? Number(search.lat) : undefined,
    lng:
      search.lng !== undefined && search.lng !== "" ? Number(search.lng) : undefined,
    place: typeof search.place === "string" ? search.place : undefined,
    region: typeof search.region === "string" ? search.region : undefined,
    category: typeof search.category === "string" ? search.category : undefined,
    emoji: typeof search.emoji === "string" ? search.emoji : undefined,
    sv: search.sv === true || search.sv === "1" || search.sv === "true",
  }),
  component: MapPage,
});

type MapType = "hybrid" | "terrain" | "roadmap";
type LatLng = { lat: number; lng: number };

function MapPage() {
  const search = Route.useSearch();
  const { loaded, error } = useGoogleMaps();
  const mapEl = useRef<HTMLDivElement>(null);
  const panoEl = useRef<HTMLDivElement>(null);
  const mapRef = useRef<any>(null);
  const panoRef = useRef<any>(null);
  const markersRef = useRef<Record<string, any>>({});
  const lineRef = useRef<any>(null);
  const userMarkerRef = useRef<any>(null);
  const userAccuracyRef = useRef<any>(null);

  const [mapType, setMapType] = useState<MapType>("hybrid");
  const [waypoints, setWaypoints] = useState<IconicPlace[]>([]);
  const [selected, setSelected] = useState<IconicPlace | null>(null);
  const [userPos, setUserPos] = useState<LatLng | null>(null);
  const [streetView, setStreetView] = useState(false);
  const [streetViewError, setStreetViewError] = useState<string | null>(null);

  // Init map once API is ready
  useEffect(() => {
    if (!loaded || !mapEl.current || mapRef.current) return;
    const g = (window as unknown as Record<string, any>).google;

    const map = new g.maps.Map(mapEl.current, {
      center: sriLankaCenter,
      zoom: 8,
      tilt: 47,
      heading: 20,
      mapTypeId: "hybrid",
      disableDefaultUI: true,
      gestureHandling: "greedy",
      zoomControl: true,
      streetViewControl: false,
    });
    mapRef.current = map;

    iconicPlaces.forEach((place) => {
      const marker = new g.maps.Marker({
        position: { lat: place.lat, lng: place.lng },
        map,
        title: place.name,
        label: {
          text: place.emoji,
          fontSize: "20px",
        },
        icon: {
          path: g.maps.SymbolPath.CIRCLE,
          scale: 14,
          fillColor: "#ffffff",
          fillOpacity: 0.95,
          strokeColor: "#0d9488",
          strokeWeight: 2,
        },
        animation: g.maps.Animation.DROP,
      });
      marker.addListener("click", () => {
        setSelected(place);
        map.panTo({ lat: place.lat, lng: place.lng });
      });
      markersRef.current[place.id] = marker;
    });
  }, [loaded]);

  // Watch the user's real-time location
  useEffect(() => {
    if (!loaded) return;
    if (typeof navigator === "undefined" || !navigator.geolocation) return;

    const watchId = navigator.geolocation.watchPosition(
      (pos) => {
        setUserPos({ lat: pos.coords.latitude, lng: pos.coords.longitude });
      },
      () => {
        /* ignore — user may deny */
      },
      { enableHighAccuracy: true, maximumAge: 5000, timeout: 15000 },
    );
    return () => navigator.geolocation.clearWatch(watchId);
  }, [loaded]);

  // Render / update the live location marker
  useEffect(() => {
    const g = (window as unknown as Record<string, any>).google;
    if (!mapRef.current || !g || !userPos) return;

    if (!userMarkerRef.current) {
      userAccuracyRef.current = new g.maps.Circle({
        map: mapRef.current,
        fillColor: "#2563eb",
        fillOpacity: 0.12,
        strokeColor: "#2563eb",
        strokeOpacity: 0.25,
        strokeWeight: 1,
        radius: 120,
      });
      userMarkerRef.current = new g.maps.Marker({
        map: mapRef.current,
        title: "You are here",
        zIndex: 999,
        icon: {
          path: g.maps.SymbolPath.CIRCLE,
          scale: 8,
          fillColor: "#2563eb",
          fillOpacity: 1,
          strokeColor: "#ffffff",
          strokeWeight: 3,
        },
      });
    }
    userMarkerRef.current.setPosition(userPos);
    userAccuracyRef.current.setCenter(userPos);
  }, [userPos]);

  // Update map type
  useEffect(() => {
    if (mapRef.current) {
      mapRef.current.setMapTypeId(mapType);
      mapRef.current.setTilt(mapType === "roadmap" ? 0 : 47);
    }
  }, [mapType]);

  // Draw route polyline through waypoints
  useEffect(() => {
    const g = (window as unknown as Record<string, any>).google;
    if (!mapRef.current || !g) return;

    if (lineRef.current) lineRef.current.setMap(null);

    if (waypoints.length >= 2) {
      lineRef.current = new g.maps.Polyline({
        path: waypoints.map((w) => ({ lat: w.lat, lng: w.lng })),
        geodesic: true,
        strokeColor: "#f97362",
        strokeOpacity: 0.95,
        strokeWeight: 4,
        map: mapRef.current,
      });
    }

    // Highlight selected waypoints
    Object.entries(markersRef.current).forEach(([id, marker]) => {
      const isWp = waypoints.some((w) => w.id === id);
      marker.setIcon({
        path: g.maps.SymbolPath.CIRCLE,
        scale: 14,
        fillColor: isWp ? "#f97362" : "#ffffff",
        fillOpacity: 0.95,
        strokeColor: isWp ? "#ffffff" : "#0d9488",
        strokeWeight: isWp ? 3 : 2,
      });
    });
  }, [waypoints]);

  const toggleWaypoint = (place: IconicPlace) => {
    setWaypoints((prev) =>
      prev.some((w) => w.id === place.id)
        ? prev.filter((w) => w.id !== place.id)
        : [...prev, place],
    );
  };

  const isWaypoint = (id: string) => waypoints.some((w) => w.id === id);

  const recenter = () => {
    if (mapRef.current) {
      mapRef.current.panTo(sriLankaCenter);
      mapRef.current.setZoom(8);
    }
  };

  const locateMe = () => {
    if (!mapRef.current) return;
    if (userPos) {
      mapRef.current.panTo(userPos);
      mapRef.current.setZoom(16);
    }
  };

  // Open Street View for a given location, finding the nearest panorama.
  const openStreetView = (location: LatLng) => {
    const g = (window as unknown as Record<string, any>).google;
    if (!g || !panoEl.current) return;
    setStreetViewError(null);

    const showPanorama = () => {
      const svService = new g.maps.StreetViewService();
      svService.getPanorama(
        { location, radius: 200, source: "outdoor" },
        (data: any, status: string) => {
          if (status !== "OK" || !data?.location) {
            setStreetViewError("No Street View imagery available here.");
            return;
          }
          if (!panoRef.current) {
            panoRef.current = new g.maps.StreetViewPanorama(panoEl.current, {
              pov: { heading: 0, pitch: 0 },
              zoom: 0,
              addressControl: true,
              fullscreenControl: false,
              motionTracking: false,
              motionTrackingControl: false,
            });
          }
          panoRef.current.setPano(data.location.pano);
          panoRef.current.setPov({ heading: 0, pitch: 0 });
          panoRef.current.setVisible(true);
        },
      );
    };

    setStreetView(true);
    // Defer so the panorama div is mounted before initialization.
    requestAnimationFrame(showPanorama);
  };

  const handleStreetView = () => {
    const target =
      (selected && { lat: selected.lat, lng: selected.lng }) ||
      userPos ||
      sriLankaCenter;
    openStreetView(target);
  };

  const closeStreetView = () => {
    setStreetView(false);
    setStreetViewError(null);
    if (panoRef.current) panoRef.current.setVisible(false);
  };

  // Focus a place passed via search params (e.g. tapped from Explore),
  // optionally opening Street View instantly.
  const didFocusRef = useRef(false);
  useEffect(() => {
    if (!loaded || didFocusRef.current) return;
    if (search.lat == null || search.lng == null || Number.isNaN(search.lat) || Number.isNaN(search.lng)) {
      return;
    }
    didFocusRef.current = true;
    const target = { lat: search.lat, lng: search.lng };

    setSelected({
      id: search.place ?? "place",
      name: search.place ?? "Selected place",
      region: search.region ?? "Sri Lanka",
      category: (search.category as IconicPlace["category"]) ?? "Historical",
      emoji: search.emoji ?? "📍",
      lat: search.lat,
      lng: search.lng,
    });

    if (mapRef.current) {
      mapRef.current.panTo(target);
      mapRef.current.setZoom(15);
    }
    if (search.sv) openStreetView(target);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [loaded, search.lat, search.lng, search.sv]);



  return (
    <AppShell>
      <div className="relative h-[calc(100vh-7rem)]">
        {/* Map canvas */}
        <div ref={mapEl} className="absolute inset-0 bg-muted" />

        {/* Loading / error overlay */}
        {!loaded && (
          <div className="absolute inset-0 grid place-items-center bg-background/80 backdrop-blur-sm">
            {error ? (
              <p className="px-8 text-center text-sm text-muted-foreground">
                Couldn't load the map. Please try again later.
              </p>
            ) : (
              <div className="flex flex-col items-center gap-3">
                <div className="h-8 w-8 animate-spin rounded-full border-2 border-primary border-t-transparent" />
                <p className="text-sm text-muted-foreground">Loading Sri Lanka…</p>
              </div>
            )}
          </div>
        )}

        {/* Top bar */}
        <div className="pointer-events-none absolute inset-x-0 top-0 flex items-start justify-between p-4 pt-[max(1rem,env(safe-area-inset-top))]">
          <Link
            to="/explore"
            className="pointer-events-auto grid h-11 w-11 place-items-center rounded-2xl bg-card/95 text-foreground shadow-lg backdrop-blur"
            aria-label="Back to explore"
          >
            <ArrowLeft className="h-5 w-5" />
          </Link>

          <div className="pointer-events-auto rounded-2xl bg-card/95 px-3 py-2 shadow-lg backdrop-blur">
            <p className="flex items-center gap-1.5 text-xs font-bold text-foreground">
              <MapPin className="h-3.5 w-3.5 text-accent" />
              Sri Lanka
            </p>
          </div>
        </div>

        {/* Right controls */}
        <div className="absolute right-4 top-1/2 flex -translate-y-1/2 flex-col gap-2">
          <button
            onClick={() =>
              setMapType((t) =>
                t === "hybrid" ? "terrain" : t === "terrain" ? "roadmap" : "hybrid",
              )
            }
            className="grid h-11 w-11 place-items-center rounded-2xl bg-card/95 text-foreground shadow-lg backdrop-blur"
            aria-label="Change map style"
          >
            <Layers className="h-5 w-5" />
          </button>
          <button
            onClick={handleStreetView}
            className="grid h-11 w-11 place-items-center rounded-2xl bg-card/95 text-foreground shadow-lg backdrop-blur"
            aria-label="Open Street View"
          >
            <PersonStanding className="h-5 w-5" />
          </button>
          <button
            onClick={locateMe}
            disabled={!userPos}
            className={cn(
              "grid h-11 w-11 place-items-center rounded-2xl shadow-lg backdrop-blur transition-colors",
              userPos
                ? "bg-primary text-primary-foreground"
                : "bg-card/95 text-muted-foreground/50",
            )}
            aria-label="Go to my location"
          >
            <LocateFixed className="h-5 w-5" />
          </button>
          <button
            onClick={recenter}
            className="grid h-11 w-11 place-items-center rounded-2xl bg-card/95 text-foreground shadow-lg backdrop-blur"
            aria-label="Recenter map"
          >
            <Crosshair className="h-5 w-5" />
          </button>
        </div>

        {/* Selected place sheet */}
        {selected && (
          <div className="absolute inset-x-0 bottom-0 p-4">
            <div className="rounded-3xl border border-border/60 bg-card/95 p-4 shadow-2xl backdrop-blur">
              <div className="flex items-start gap-3">
                <div className="grid h-12 w-12 shrink-0 place-items-center rounded-2xl bg-secondary text-2xl">
                  {selected.emoji}
                </div>
                <div className="min-w-0 flex-1">
                  <p className="truncate text-base font-bold text-foreground">
                    {selected.name}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    {selected.region} · {selected.category}
                  </p>
                </div>
                <button
                  onClick={() => setSelected(null)}
                  className="grid h-8 w-8 place-items-center rounded-full bg-secondary text-muted-foreground"
                  aria-label="Close"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>
              <div className="mt-3 flex gap-2">
                <button
                  onClick={() => toggleWaypoint(selected)}
                  className={cn(
                    "flex flex-1 items-center justify-center gap-2 rounded-2xl py-3 text-sm font-semibold transition-colors",
                    isWaypoint(selected.id)
                      ? "bg-accent text-accent-foreground"
                      : "bg-primary text-primary-foreground",
                  )}
                >
                  <Navigation className="h-4 w-4" />
                  {isWaypoint(selected.id) ? "Remove" : "Add waypoint"}
                </button>
                <button
                  onClick={() =>
                    openStreetView({ lat: selected.lat, lng: selected.lng })
                  }
                  className="flex items-center justify-center gap-2 rounded-2xl bg-secondary px-4 py-3 text-sm font-semibold text-secondary-foreground"
                >
                  <PersonStanding className="h-4 w-4" />
                  Street View
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Route summary bar */}
        {!selected && waypoints.length > 0 && (
          <div className="absolute inset-x-0 bottom-0 p-4">
            <div className="rounded-3xl border border-border/60 bg-card/95 p-4 shadow-2xl backdrop-blur">
              <div className="mb-2 flex items-center justify-between">
                <p className="flex items-center gap-1.5 text-sm font-bold text-foreground">
                  <RouteIcon className="h-4 w-4 text-accent" />
                  Your route ({waypoints.length})
                </p>
                <button
                  onClick={() => setWaypoints([])}
                  className="text-xs font-medium text-muted-foreground"
                >
                  Clear all
                </button>
              </div>
              <div className="no-scrollbar flex gap-2 overflow-x-auto pb-1">
                {waypoints.map((w, i) => (
                  <button
                    key={w.id}
                    onClick={() => setSelected(w)}
                    className="flex shrink-0 items-center gap-1.5 rounded-full border border-border/70 bg-secondary px-3 py-1.5 text-xs font-medium text-foreground"
                  >
                    <span className="grid h-4 w-4 place-items-center rounded-full bg-accent text-[10px] font-bold text-accent-foreground">
                      {i + 1}
                    </span>
                    {w.name}
                  </button>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Street View overlay */}
        <div
          className={cn(
            "absolute inset-0 z-20 bg-background transition-opacity",
            streetView ? "opacity-100" : "pointer-events-none opacity-0",
          )}
        >
          <div ref={panoEl} className="absolute inset-0 bg-muted" />

          {streetViewError && (
            <div className="absolute inset-0 grid place-items-center p-8">
              <p className="text-center text-sm text-muted-foreground">
                {streetViewError}
              </p>
            </div>
          )}

          <button
            onClick={closeStreetView}
            className="absolute left-4 top-4 z-30 flex items-center gap-1.5 rounded-2xl bg-card/95 px-3.5 py-2.5 text-sm font-semibold text-foreground shadow-lg backdrop-blur"
            style={{ top: "max(1rem, env(safe-area-inset-top))" }}
          >
            <ArrowLeft className="h-4 w-4" />
            Back to map
          </button>
        </div>
      </div>
    </AppShell>
  );
}
