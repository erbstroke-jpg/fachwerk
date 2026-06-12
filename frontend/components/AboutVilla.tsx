"use client";
import { useTranslations } from "next-intl";

function IconEco() {
  return (
    <svg width="20" height="20" viewBox="0 0 22 22" fill="none">
      <circle cx="11" cy="11" r="9" stroke="#1b4a40" strokeWidth="1.4"/>
      <path d="M11 16c-3-1.5-4-4.5-3-7.5 3-1 6 0 7 3-1 3-2.5 4-4 4.5z" stroke="#1b4a40" strokeWidth="1.3" strokeLinejoin="round"/>
      <path d="M8.5 13.5C10 11.5 12 10 14 9.5" stroke="#1b4a40" strokeWidth="1.1"/>
    </svg>
  );
}

function IconPanorama() {
  return (
    <svg width="20" height="20" viewBox="0 0 22 22" fill="none">
      <rect x="2" y="4" width="18" height="14" rx="1" stroke="#1b4a40" strokeWidth="1.4"/>
      <path d="M2 15l5.5-6 4.5 5 3-3.5L20 15" stroke="#1b4a40" strokeWidth="1.3" strokeLinejoin="round"/>
      <circle cx="8" cy="8" r="1.3" stroke="#1b4a40" strokeWidth="1.1"/>
    </svg>
  );
}

export function AboutVilla() {
  const t = useTranslations("about");

  return (
    <section id="about" className="py-20 lg:py-24 bg-surface">
      <div className="max-w-[1100px] mx-auto px-6">
        <div className="grid lg:grid-cols-[440px_1fr] gap-12 lg:gap-16 items-center">

          {/* Framed photo */}
          <div className="bg-white p-3 rounded-[6px] shadow-[0_18px_45px_rgba(27,74,64,0.12)]">
            <div className="relative h-[360px] rounded-[3px] overflow-hidden">
              {/* Fallback */}
              <div className="absolute inset-0" style={{ background: "linear-gradient(140deg, #ece8dd 0%, #ddd6c6 100%)" }}>
                <div className="absolute inset-0 flex items-center justify-center">
                  <svg width="90" viewBox="0 0 200 68" fill="none" opacity="0.14">
                    <path d="M8 58 L82 10 L196 60" stroke="#00332a" strokeWidth="5" strokeLinecap="round" strokeLinejoin="round"/>
                    <path d="M30 58 L58 31 L94 58" stroke="#00332a" strokeWidth="5" strokeLinecap="round" strokeLinejoin="round"/>
                  </svg>
                </div>
              </div>
              {/* Real photo */}
              <div className="absolute inset-0 bg-cover bg-center" style={{ backgroundImage: "url('/images/about.jpg')" }} />
            </div>
          </div>

          {/* Text */}
          <div>
            <p className="text-[11px] font-bold tracking-[0.22em] uppercase text-timber-oak mb-3">
              {t("eyebrow")}
            </p>
            <h2 className="font-serif text-[28px] lg:text-[32px] text-on-surface mb-5">
              {t("headline")}
            </h2>
            <p className="text-[14px] text-on-surface-var leading-[1.75] mb-4">
              {t("body")}
            </p>
            <p className="text-[14px] text-on-surface-var leading-[1.75] mb-8">
              {t("body2")}
            </p>

            <div className="grid sm:grid-cols-2 gap-6">
              <div className="flex gap-3 items-start">
                <div className="w-9 h-9 rounded-full border border-forest/25 flex items-center justify-center shrink-0">
                  <IconEco />
                </div>
                <div>
                  <p className="text-[11px] font-bold tracking-[0.1em] uppercase text-on-surface mb-1">{t("eco")}</p>
                  <p className="text-[12px] text-on-surface-var leading-relaxed">{t("ecoDesc")}</p>
                </div>
              </div>
              <div className="flex gap-3 items-start">
                <div className="w-9 h-9 rounded-full border border-forest/25 flex items-center justify-center shrink-0">
                  <IconPanorama />
                </div>
                <div>
                  <p className="text-[11px] font-bold tracking-[0.1em] uppercase text-on-surface mb-1">{t("panorama")}</p>
                  <p className="text-[12px] text-on-surface-var leading-relaxed">{t("panoramaDesc")}</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
