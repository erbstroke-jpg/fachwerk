"use client";
import { useTranslations } from "next-intl";
import { useState } from "react";

const ROOMS = [
  { key: "living",  labelRu: "Гостиная",  labelEn: "Living Room", img: "/images/interiors/living.jpg",  badgeRu: "Панорамные окна", badgeEn: "Panoramic windows", capRu: "Первый этаж · зона отдыха",  capEn: "Ground floor · lounge" },
  { key: "kitchen", labelRu: "Кухня",     labelEn: "Kitchen",     img: "/images/interiors/kitchen.jpg", badgeRu: "Полное оснащение", badgeEn: "Fully equipped",   capRu: "Первый этаж · столовая",   capEn: "Ground floor · dining" },
  { key: "bed1",    labelRu: "Спальня 1", labelEn: "Bedroom 1",   img: "/images/interiors/bed1.jpg",    badgeRu: "Вид на озеро",     badgeEn: "Lake view",        capRu: "Второй этаж",              capEn: "First floor" },
  { key: "bed2",    labelRu: "Спальня 2", labelEn: "Bedroom 2",   img: "/images/interiors/bed2.jpg",    badgeRu: "Панорама гор",     badgeEn: "Mountain view",    capRu: "Второй этаж",              capEn: "First floor" },
  { key: "terrace", labelRu: "Терраса",   labelEn: "Terrace",     img: "/images/interiors/terrace.jpg", badgeRu: "Открытый воздух",  badgeEn: "Open air",         capRu: "Выход к саду",             capEn: "Garden access" },
  { key: "bath",    labelRu: "Санузел",   labelEn: "Bathroom",    img: "/images/interiors/bath.jpg",    badgeRu: "Современный",      badgeEn: "Modern",           capRu: "На каждом этаже",          capEn: "Every floor" },
];

const FALLBACKS = [
  "linear-gradient(140deg, #e9e5da 0%, #d9d3c4 100%)",
  "linear-gradient(140deg, #e4e8e3 0%, #d0d8cf 100%)",
  "linear-gradient(140deg, #ece7df 0%, #d8d1c5 100%)",
];

interface Props { locale: string }

export function InteriorGallery({ locale }: Props) {
  const t = useTranslations("interiors");
  const [start, setStart] = useState(0);
  const ru = locale === "ru";

  const prev = () => setStart((s) => (s - 1 + ROOMS.length) % ROOMS.length);
  const next = () => setStart((s) => (s + 1) % ROOMS.length);

  const visible = [ROOMS[start % ROOMS.length], ROOMS[(start + 1) % ROOMS.length]];

  return (
    <section id="interiors" className="py-20 lg:py-24 bg-earth-sand/60">
      <div className="max-w-[1100px] mx-auto px-6">

        {/* Header row: eyebrow left, arrows right */}
        <div className="flex items-end justify-between mb-8">
          <div>
            <p className="text-[11px] font-bold tracking-[0.22em] uppercase text-timber-oak">{t("eyebrow")}</p>
            <h2 className="font-serif text-[26px] lg:text-[30px] text-on-surface mt-2">{t("headline")}</h2>
          </div>
          <div className="flex gap-3">
            <button onClick={prev} aria-label="Назад"
              className="w-10 h-10 rounded-full border border-outline-var flex items-center justify-center text-on-surface-var hover:border-primary hover:text-primary transition-colors">
              <svg width="14" height="14" viewBox="0 0 14 14" fill="none"><path d="M9 2L4 7l5 5" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"/></svg>
            </button>
            <button onClick={next} aria-label="Вперёд"
              className="w-10 h-10 rounded-full border border-outline-var flex items-center justify-center text-on-surface-var hover:border-primary hover:text-primary transition-colors">
              <svg width="14" height="14" viewBox="0 0 14 14" fill="none"><path d="M5 2l5 5-5 5" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"/></svg>
            </button>
          </div>
        </div>

        {/* Two cards */}
        <div className="grid sm:grid-cols-2 gap-6">
          {visible.map((room, i) => {
            const idx = ROOMS.findIndex((r) => r.key === room.key);
            return (
              <div key={room.key} className="group">
                {/* Image */}
                <div className="relative h-[300px] lg:h-[340px] rounded-[6px] overflow-hidden">
                  <div className="absolute inset-0" style={{ background: FALLBACKS[idx % FALLBACKS.length] }}>
                    <div className="absolute inset-0 flex items-center justify-center">
                      <svg width="64" viewBox="0 0 200 68" fill="none" opacity="0.15">
                        <path d="M8 58 L82 10 L196 60" stroke="#00332a" strokeWidth="6" strokeLinecap="round" strokeLinejoin="round"/>
                        <path d="M30 58 L58 31 L94 58" stroke="#00332a" strokeWidth="6" strokeLinecap="round" strokeLinejoin="round"/>
                      </svg>
                    </div>
                  </div>
                  <div className="absolute inset-0 bg-cover bg-center transition-transform duration-700 group-hover:scale-[1.03]"
                    style={{ backgroundImage: `url('${room.img}')` }} />
                  {/* Badge */}
                  <span className="absolute top-3 left-3 bg-white/95 text-on-surface text-[10px] font-bold tracking-[0.12em] uppercase px-2.5 py-1 rounded-[3px]">
                    {ru ? room.badgeRu : room.badgeEn}
                  </span>
                </div>
                {/* Caption */}
                <p className="font-serif text-[19px] text-on-surface mt-4">{ru ? room.labelRu : room.labelEn}</p>
                <div className="h-px bg-outline-var/70 my-2.5" />
                <p className="text-[12px] text-on-surface-var">{ru ? room.capRu : room.capEn}</p>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
