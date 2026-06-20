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
} from "lucide-react";
import { AppShell } from "@/components/layout/AppShell";
import { iconicPlaces, sriLankaCenter, type IconicPlace } from "@/lib/data";
import { useGoogleMaps } from "@/lib/useGoogleMaps";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/map")({
  head: () => ({
    meta: [
      { title: "Live Map — Visit Sri Lanka" },
      {
        name: "description",
        content:
          "Explore an interactive 3D map of Sri Lanka, discover iconic landmarks and add waypoints to plan your route.",
      },
      { property: "og:title", content: "Live Map — Visit Sri Lanka" },
      {
        property: "og:description",
        content:
          "Interactive 3D map of Sri Lanka with iconic places and waypoint routing.",
      },
    ],
  }),
  component: MapPage,
});

type MapType = "hybrid" | "terrain" | "roadmap";

function MapPage() {
  const { loaded, error } = useGoogleMaps();
  const mapEl = useRef<HTMLDivElement>(null);
  const mapRef = useRef<any>(null);
  const markersRef = useRef<Record<string, any>>({});
  const lineRef = useRef<any>(null);

  const [mapType, setMapType] = useState<MapType>("hybrid");
  const [waypoints, setWaypoints] = useState<IconicPlace[]>([]);
  const [selected, setSelected] = useState<IconicPlace | null>(null);

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
              <button
                onClick={() => toggleWaypoint(selected)}
                className={cn(
                  "mt-3 flex w-full items-center justify-center gap-2 rounded-2xl py-3 text-sm font-semibold transition-colors",
                  isWaypoint(selected.id)
                    ? "bg-accent text-accent-foreground"
                    : "bg-primary text-primary-foreground",
                )}
              >
                <Navigation className="h-4 w-4" />
                {isWaypoint(selected.id)
                  ? "Remove waypoint"
                  : "Add as waypoint"}
              </button>
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
      </div>
    </AppShell>
  );
}
