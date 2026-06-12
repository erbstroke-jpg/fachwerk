"use client";
import { useBooking } from "@/lib/booking-state";
import { useTranslations } from "next-intl";

export function FloatingBookButton() {
  const { openModal } = useBooking();
  const t = useTranslations("booking");

  return (
    <button
      onClick={openModal}
      className="fixed bottom-4 right-4 md:bottom-8 md:right-8 z-40 h-14 bg-primary hover:bg-primary-hover text-white flex items-center rounded-full shadow-2xl transition-colors duration-300 group"
      aria-label="Открыть форму бронирования"
    >
      {/* Фиксированная иконка (центрированная) */}
      <div className="w-14 h-14 flex items-center justify-center flex-shrink-0">
        <svg width="18" height="18" viewBox="0 0 18 18" fill="none">
          <rect x="1" y="3" width="16" height="14" rx="0" stroke="white" strokeWidth="1.5"/>
          <path d="M5 1V5M13 1V5M1 7H17" stroke="white" strokeWidth="1.5"/>
        </svg>
      </div>

      {/* Ультра-плавный контейнер на CSS Grid */}
      <div className="grid grid-cols-[0fr] opacity-0 md:group-hover:grid-cols-[1fr] md:group-hover:opacity-100 transition-all duration-300 ease-out">
        {/* Внутренний контейнер, который скрывает выходящий за рамки текст */}
        <div className="overflow-hidden">
          <span className="text-[12px] font-bold tracking-widest uppercase whitespace-nowrap pr-6 block">
            {t("submit")}
          </span>
        </div>
      </div>
    </button>
  );
}