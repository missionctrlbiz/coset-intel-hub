'use client';

import { useEffect, useRef } from 'react';

// CoSET HQ — Marrakesh Street, Wuse 2, Abuja, Nigeria
const LAT = 9.0643;
const LNG = 7.4892;
const ZOOM = 15;

export function CosetMap() {
    const containerRef = useRef<HTMLDivElement>(null);
    const mapRef = useRef<any>(null);

    useEffect(() => {
        if (!containerRef.current || mapRef.current) return;

        let isMounted = true;

        // Dynamically import leaflet (client-only)
        import('leaflet').then((L) => {
            if (!isMounted || !containerRef.current || mapRef.current) return;

            // Check if container already has a map attached (Leaflet sets an internal ID)
            if ((containerRef.current as any)._leaflet_id) return;

            // Fix default icon paths broken by webpack
            delete (L.Icon.Default.prototype as any)._getIconUrl;
            L.Icon.Default.mergeOptions({
                iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
                iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
                shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
            });

            // Import leaflet CSS once
            if (!document.getElementById('leaflet-css')) {
                const link = document.createElement('link');
                link.id = 'leaflet-css';
                link.rel = 'stylesheet';
                link.href = 'https://unpkg.com/leaflet@1.9.4/dist/leaflet.css';
                document.head.appendChild(link);
            }

            const map = L.map(containerRef.current!, {
                center: [LAT, LNG],
                zoom: ZOOM,
                scrollWheelZoom: true,
                zoomControl: true,
            });

            // OpenStreetMap tiles — free, no API key needed
            L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
                maxZoom: 19,
                attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
            }).addTo(map);

            // CoSET pin
            L.marker([LAT, LNG])
                .addTo(map)
                .bindPopup(
                    `<div style="font-family:sans-serif;font-size:13px;line-height:1.5">
                        <strong style="color:#0b2f52">CoSET HQ</strong><br/>
                        Marrakesh Street, Wuse 2<br/>Abuja, Nigeria
                    </div>`,
                    { maxWidth: 220 }
                )
                .openPopup();

            mapRef.current = map;
        });

        return () => {
            isMounted = false;
            if (mapRef.current) {
                mapRef.current.remove();
                mapRef.current = null;
            }
        };
    }, []);

    return (
        <div
            ref={containerRef}
            className="h-full w-full rounded-2xl overflow-hidden z-0"
            style={{ minHeight: '550px' }}
            aria-label="CoSET headquarters map"
        />
    );
}
