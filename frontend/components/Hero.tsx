"use client";
import { useTranslations } from "next-intl";
import { useBooking } from "@/lib/booking-state";
import { format } from "date-fns";

const MAX_GUESTS = 10;

/* Vertical timber slats for the side frames */
function TimberFrame({ side }: { side: "left" | "right" }) {
  return (
    <div
      className={`hidden lg:block absolute top-0 bottom-0 ${side === "left" ? "left-0" : "right-0"} w-[72px] z-[5]`}
      style={{
        background:
          "repeating-linear-gradient(90deg, #2a2018 0px, #3a2c20 10px, #2e2418 12px, #41342a 22px, #2a2018 24px)",
        boxShadow: side === "left" ? "inset -12px 0 18px rgba(0,0,0,0.45)" : "inset 12px 0 18px rgba(0,0,0,0.45)",
      }}
    />
  );
}

export function Hero() {
  const t = useTranslations("hero");
  const { checkIn, checkOut, guests, setGuests, openModal } = useBooking();

  return (
    <section id="hero" className="relative h-[86vh] min-h-[560px] h-[100vh] overflow-hidden flex flex-col">
      {/* Background */}
      <div className="absolute inset-0 h-full">
        {/* Fallback gradient + mountains */}
        <div className="absolute inset-0" style={{ background: "linear-gradient(165deg, #14352c 0%, #1b4a40 55%, #0d2a22 100%)" }}>
          <svg className="absolute bottom-0 left-0 w-full" viewBox="0 0 1440 260" fill="none" preserveAspectRatio="none" style={{ height: "55%" }}>
            <path d="M0,260 L0,170 L150,60 L320,160 L470,40 L650,150 L800,55 L970,165 L1120,60 L1290,150 L1440,90 L1440,260Z" fill="rgba(8,30,24,0.55)" />
            <path d="M0,260 L0,210 L180,130 L360,205 L540,120 L730,200 L910,125 L1090,200 L1270,135 L1440,195 L1440,260Z" fill="rgba(5,22,17,0.8)" />
          </svg>
        </div>
        {/* Real photo overlays the fallback */}
        <div className="absolute inset-0 bg-cover bg-center" style={{ backgroundImage: "url('/images/hero.jpeg')", backgroundPositionY: "60%" }} />
        <div className="absolute inset-0" style={{ background: "linear-gradient(to bottom, rgba(0,15,10,0.35) 0%, rgba(0,15,10,0.05) 45%, rgba(0,15,10,0.55) 100%)" }} />
      </div>

      {/* Timber side frames */}
      <TimberFrame side="left" />
      <TimberFrame side="right" />

      {/* Content */}
      <div className="relative z-10 flex-1 flex flex-col justify-end max-w-[1280px] mx-auto w-full px-6 lg:px-24 pb-10">
        <h1 className="font-serif text-white text-[22px] md:text-[29px] leading-[1.15] max-w-3xl   mb-8 drop-shadow-md">
          {t("headline")}
        </h1>

        {/* Booking bar — glass panel with white fields */}
        <div className="bg-[#0d2b23]/55 backdrop-blur-md rounded-[8px] p-3 flex flex-col sm:flex-row gap-2 max-w-3xl shadow-2xl">
          {/* Check-in */}
          <button onClick={openModal}
            className="flex-1 bg-white rounded-[5px] px-4 py-2.5 text-left hover:bg-earth-sand transition-colors">
            <span className="block text-[9px] font-bold tracking-[0.14em] uppercase text-on-surface-var">{t("checkin")}</span>
            <span className="flex items-center gap-2 mt-0.5">
              <svg width="13" height="13" viewBox="0 0 14 14" fill="none" className="shrink-0">
                <rect x="1" y="2.5" width="12" height="10.5" rx="1" stroke="#707976" strokeWidth="1.2"/>
                <path d="M4 1v3M10 1v3M1 6h12" stroke="#707976" strokeWidth="1.2"/>
              </svg>
              <span className={`text-[13px] ${checkIn ? "text-on-surface font-medium" : "text-outline"}`}>
                {checkIn ? format(checkIn, "dd.MM.yyyy") : t("selectDate")}
              </span>
            </span>
          </button>

          {/* Check-out */}
          <button onClick={openModal}
            className="flex-1 bg-white rounded-[5px] px-4 py-2.5 text-left hover:bg-earth-sand transition-colors">
            <span className="block text-[9px] font-bold tracking-[0.14em] uppercase text-on-surface-var">{t("checkout")}</span>
            <span className="flex items-center gap-2 mt-0.5">
              <svg width="13" height="13" viewBox="0 0 14 14" fill="none" className="shrink-0">
                <rect x="1" y="2.5" width="12" height="10.5" rx="1" stroke="#707976" strokeWidth="1.2"/>
                <path d="M4 1v3M10 1v3M1 6h12" stroke="#707976" strokeWidth="1.2"/>
              </svg>
              <span className={`text-[13px] ${checkOut ? "text-on-surface font-medium" : "text-outline"}`}>
                {checkOut ? format(checkOut, "dd.MM.yyyy") : t("selectDate")}
              </span>
            </span>
          </button>

          {/* Guests */}
          <div className="flex-1 bg-white rounded-[5px] px-4 py-2.5 flex items-center justify-between gap-2">
            <div>
              <span className="block text-[9px] font-bold tracking-[0.14em] uppercase text-on-surface-var">{t("guests")}</span>
              <span className="text-[13px] text-on-surface font-medium mt-0.5 block">
                {guests} {t("guestsUnit")}
              </span>
            </div>
            <div className="flex items-center gap-1.5">
              <button onClick={() => setGuests(Math.max(1, guests - 1))}
                className="w-6 h-6 rounded-[3px] border border-outline-var text-on-surface-var hover:border-primary hover:text-primary transition-colors text-[14px] leading-none">−</button>
              <button onClick={() => setGuests(Math.min(MAX_GUESTS, guests + 1))}
                className="w-6 h-6 rounded-[3px] border border-outline-var text-on-surface-var hover:border-primary hover:text-primary transition-colors text-[14px] leading-none">+</button>
            </div>
          </div>

          {/* CTA */}
          <button onClick={openModal}
            className="bg-primary hover:bg-primary-hover text-white text-[12px] font-bold tracking-[0.16em] uppercase px-8 py-3 rounded-[5px] transition-colors shrink-0">
            {t("search")}
          </button>
        </div>
      </div>
    </section>
  );
}
