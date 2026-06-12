"use client";
import { useTranslations } from "next-intl";
import { useEffect, useRef } from "react";

const COORDS = { lat: 42.642504, lng: 77.18055 };
const MAPS_2GIS   = "https://2gis.kg/bishkek/geo/70030076136904677/77.180550,42.642504";
const MAPS_GOOGLE = "https://maps.app.goo.gl/Xw7oB1VUK7MuMgfs8";
const MAPS_YANDEX = "https://yandex.com/maps/-/CPtifOj2";

const MAP_STYLE = [
  { elementType: "geometry", stylers: [{ color: "#e8ede6" }] },
  { elementType: "labels.text.fill", stylers: [{ color: "#404846" }] },
  { elementType: "labels.text.stroke", stylers: [{ color: "#f4f1ea" }] },
  { featureType: "water", elementType: "geometry", stylers: [{ color: "#a0d0c3" }] },
  { featureType: "poi.park", elementType: "geometry", stylers: [{ color: "#c8ddc8" }] },
  { featureType: "road", elementType: "geometry", stylers: [{ color: "#d4d9d4" }] },
  { featureType: "landscape.natural", elementType: "geometry", stylers: [{ color: "#d6e4d4" }] },
];

declare global {
  interface Window {
    initFachwerkMap?: () => void;
    google?: any;
  }
}

interface Props { locale: string }

export function LocationSection({ locale }: Props) {
  const t = useTranslations("location");
  const mapRef = useRef<HTMLDivElement>(null);

  const apiKey = process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY;
  const hasApiKey = apiKey && apiKey !== "PENDING";

  useEffect(() => {
    if (!hasApiKey) return;
    window.initFachwerkMap = () => {
      if (!mapRef.current || !window.google) return;
      const g: any = window.google;
      const map = new g.maps.Map(mapRef.current, {
        center: COORDS, zoom: 16, styles: MAP_STYLE, disableDefaultUI: true, zoomControl: true,
      });
      new g.maps.Marker({
        position: COORDS, map,
        icon: {
          url: "data:image/svg+xml;charset=UTF-8," + encodeURIComponent(`
            <svg width="40" height="50" viewBox="0 0 40 50" xmlns="http://www.w3.org/2000/svg">
              <path d="M20 0 C9 0 0 9 0 20 C0 33 20 50 20 50 C20 50 40 33 40 20 C40 9 31 0 20 0Z" fill="#1b4a40"/>
              <polyline points="8,30 18,15 34,31" stroke="white" stroke-width="2" fill="none" stroke-linejoin="round" stroke-linecap="round"/>
              <polyline points="13,30 18,22 24,30" stroke="white" stroke-width="2" fill="none" stroke-linejoin="round" stroke-linecap="round"/>
            </svg>`),
          scaledSize: new g.maps.Size(40, 50),
          anchor: new g.maps.Point(20, 50),
        },
      });
    };
    if (!document.getElementById("google-maps-script")) {
      const s = document.createElement("script");
      s.id = "google-maps-script";
      s.src = `https://maps.googleapis.com/maps/api/js?key=${apiKey}&callback=initFachwerkMap`;
      s.async = true; s.defer = true;
      document.head.appendChild(s);
    } else if (window.google) {
      window.initFachwerkMap?.();
    }
  }, [hasApiKey, apiKey]);

  const links = [
    { label: "2ГИС", href: MAPS_2GIS },
    { label: "Google Maps", href: MAPS_GOOGLE },
    { label: "Яндекс Карты", href: MAPS_YANDEX },
  ];

  return (
    <section id="location" className="py-20 lg:py-24 bg-earth-sand/40">
      <div className="max-w-[1100px] mx-auto px-6">
        {/* Centered heading */}
        <div className="text-center mb-10">
          <p className="text-[11px] font-bold tracking-[0.22em] uppercase text-timber-oak mb-2">{t("eyebrow")}</p>
          <h2 className="font-serif text-[26px] lg:text-[30px] text-on-surface">{t("headline")}</h2>
        </div>

        {/* White card: map left + text right */}
        <div className="bg-white rounded-[8px] shadow-[0_18px_45px_rgba(27,74,64,0.10)] p-5 lg:p-7">
          <div className="grid lg:grid-cols-[1.5fr_1fr] gap-7 items-center">

            {/* Map */}
            {/* <div className="relative h-[320px] rounded-[6px] overflow-hidden">
              {hasApiKey ? (
                <div ref={mapRef} className="absolute inset-0" />
              ) : (
                <a href={MAPS_2GIS} target="_blank" rel="noopener noreferrer"
                  className="absolute inset-0 flex flex-col items-center justify-center gap-3 group"
                  style={{ background: "radial-gradient(ellipse at 60% 35%, #dbe7db 0%, #cfdfd6 45%, #c3d4cb 100%)" }}>
                  {/* Topo-style contour rings */}
                  {/* <svg className="absolute inset-0 w-full h-full" viewBox="0 0 600 320" fill="none" preserveAspectRatio="none" opacity="0.35">
                    <ellipse cx="190" cy="135" rx="135" ry="86" stroke="#9fb6a6" strokeWidth="1.2"/>
                    <ellipse cx="195" cy="138" rx="100" ry="62" stroke="#9fb6a6" strokeWidth="1.2"/>
                    <ellipse cx="200" cy="142" rx="66" ry="40" stroke="#9fb6a6" strokeWidth="1.2"/>
                    <ellipse cx="430" cy="225" rx="150" ry="80" stroke="#9fb6a6" strokeWidth="1.2"/>
                    <ellipse cx="435" cy="228" rx="105" ry="54" stroke="#9fb6a6" strokeWidth="1.2"/>
                    <path d="M0 270 C140 240 260 285 400 262 C500 246 560 252 600 244" stroke="#8fb3c9" strokeWidth="2"/>
                  </svg>
                  {/* Pin */}
                  {/* <svg width="44" height="55" viewBox="0 0 40 50" className="relative drop-shadow-md">
                    <path d="M20 0 C9 0 0 9 0 20 C0 33 20 50 20 50 C20 50 40 33 40 20 C40 9 31 0 20 0Z" fill="#1b4a40"/>
                    <polyline points="8,30 18,15 34,31" stroke="white" strokeWidth="2" fill="none" strokeLinejoin="round" strokeLinecap="round"/>
                    <polyline points="13,30 18,22 24,30" stroke="white" strokeWidth="2" fill="none" strokeLinejoin="round" strokeLinecap="round"/>
                  </svg>
                  <span className="relative bg-white rounded-[4px] px-3 py-1.5 text-[11px] font-bold tracking-[0.08em] text-on-surface shadow group-hover:shadow-md transition-shadow">
                    Fachwerk Issyk-Kul
                  </span>
                </a>
              )} */}
            {/* </div> */}

            <div className="w-full h-[320px] rounded-[6px] overflow-hidden" style={{ backgroundImage: "url('/images/map.jpeg')", backgroundSize:'cover' }} />

            {/* Right text + buttons */}
            <div>
              <p className="text-[13px] text-on-surface-var leading-[1.8] mb-5">
                {t("navigatorHint")}
              </p>
              <p className="text-[12px] text-on-surface-var/80 leading-relaxed mb-6">
                {t("address")}
              </p>
              <div className="flex flex-col gap-2.5">
                {links.map(({ label, href }) => (
                  <a key={label} href={href} target="_blank" rel="noopener noreferrer"
                    className="flex items-center justify-between border border-outline-var rounded-[5px] px-4 py-3 text-[11px] font-bold tracking-[0.14em] uppercase text-on-surface hover:border-primary hover:text-primary transition-colors">
                    {label}
                    <svg width="12" height="12" viewBox="0 0 12 12" fill="none"><path d="M2 10L10 2M10 2H4M10 2v6" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round"/></svg>
                  </a>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
