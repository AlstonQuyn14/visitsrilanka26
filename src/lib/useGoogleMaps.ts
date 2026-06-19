import { useEffect, useState } from "react";

declare global {
  interface Window {
    google?: typeof google;
    __serendibMapsInit?: () => void;
  }
}

let loadPromise: Promise<void> | null = null;

function loadGoogleMaps(): Promise<void> {
  if (typeof window === "undefined") return Promise.reject(new Error("no window"));
  if (window.google?.maps) return Promise.resolve();
  if (loadPromise) return loadPromise;

  const key = import.meta.env.VITE_LOVABLE_CONNECTOR_GOOGLE_MAPS_BROWSER_KEY;
  const channel = import.meta.env.VITE_LOVABLE_CONNECTOR_GOOGLE_MAPS_TRACKING_ID;

  loadPromise = new Promise<void>((resolve, reject) => {
    window.__serendibMapsInit = () => resolve();
    const script = document.createElement("script");
    script.src = `https://maps.googleapis.com/maps/api/js?key=${key}&loading=async&callback=__serendibMapsInit&channel=${channel}`;
    script.async = true;
    script.onerror = () => reject(new Error("Failed to load Google Maps"));
    document.head.appendChild(script);
  });

  return loadPromise;
}

export function useGoogleMaps() {
  const [loaded, setLoaded] = useState<boolean>(
    typeof window !== "undefined" && !!window.google?.maps,
  );
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let active = true;
    loadGoogleMaps()
      .then(() => active && setLoaded(true))
      .catch((e) => active && setError(e.message));
    return () => {
      active = false;
    };
  }, []);

  return { loaded, error };
}
