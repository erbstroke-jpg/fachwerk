"use client";
import { useTranslations } from "next-intl";
import { useBooking } from "@/lib/booking-state";
import { useState, useEffect, useRef, useCallback } from "react";
import { DayPicker, DateRange } from "react-day-picker";
import "react-day-picker/style.css";
import { format, differenceInDays, isBefore, startOfToday, parseISO } from "date-fns";
import { ru as ruLocale } from "date-fns/locale";
import { createBooking, getBookedDates, checkAvailability } from "@/lib/api";

const MAX_GUESTS = 10;

type DisabledRange = { from: Date; to: Date };

interface Props {
  locale: string;
}

export function BookingModal({ locale }: Props) {
  const t = useTranslations("booking");
  const { modalOpen, closeModal, checkIn, checkOut, guests, setGuests, setCheckIn, setCheckOut } = useBooking();

  // Form state
  const [range, setRange] = useState<DateRange | undefined>(
    checkIn && checkOut ? { from: checkIn, to: checkOut } : undefined
  );
  const [guestsLocal, setGuestsLocal] = useState(guests);
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [arrivalTime, setArrivalTime] = useState("");
  const [comment, setComment] = useState("");

  // UI state
  const [disabledRanges, setDisabledRanges] = useState<DisabledRange[]>([]);
  const [availability, setAvailability] = useState<{ available: boolean; nights: number } | null>(null);
  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState("");
  const [dirty, setDirty] = useState(false);
  const [confirmClose, setConfirmClose] = useState(false);

  // Load booked dates
  useEffect(() => {
    if (modalOpen) {
      getBookedDates().then((ranges) => {
        setDisabledRanges(ranges.map((r) => ({
          from: parseISO(r.check_in),
          to: new Date(new Date(parseISO(r.check_out)).setDate(new Date(parseISO(r.check_out)).getDate() - 1)),
        })));
      }).catch(() => {});
    }
  }, [modalOpen]);

  // Sync from hero bar on first open
  useEffect(() => {
    if (modalOpen && checkIn && checkOut && !range) {
      setRange({ from: checkIn, to: checkOut });
    }
  }, [modalOpen]);

  // Check availability when range changes
  useEffect(() => {
    if (range?.from && range?.to && range.from.getTime() !== range.to.getTime()) {
      const nights = differenceInDays(range.to, range.from);
      if (nights < 1) { setAvailability(null); return; }
      setDirty(true);
      checkAvailability(format(range.from, "yyyy-MM-dd"), format(range.to, "yyyy-MM-dd"))
        .then(setAvailability)
        .catch(() => setAvailability(null));
    } else {
      setAvailability(null);
    }
  }, [range]);

  const isDirty = dirty || name || phone || comment;

  function requestClose() {
    if (isDirty) {
      setConfirmClose(true);
    } else {
      handleClose();
    }
  }

  function handleClose() {
    setConfirmClose(false);
    setSubmitted(false);
    setError("");
    closeModal();
  }

  async function handleSubmit() {
    if (!range?.from || !range?.to) return setError("Выберите даты заезда и выезда");
    if (!name.trim()) return setError("Введите ваше имя");
    if (!phone.trim()) return setError("Введите номер телефона");
    if (guestsLocal < 1 || guestsLocal > MAX_GUESTS) return setError(`Максимум ${MAX_GUESTS} гостей`);
    if (!availability?.available) return setError("Выбранные даты недоступны");

    setLoading(true);
    setError("");
    try {
      await createBooking({
        check_in: format(range.from, "yyyy-MM-dd"),
        check_out: format(range.to, "yyyy-MM-dd"),
        guests_count: guestsLocal,
        guest_name: name,
        guest_phone: phone,
        arrival_time: arrivalTime || null,
        comment: comment || null,
      });
      // Sync back to global state
      setCheckIn(range.from);
      setCheckOut(range.to);
      setGuests(guestsLocal);
      setSubmitted(true);
    } catch (err: unknown) {
      const e = err as { detail?: string };
      setError(e?.detail ?? "Произошла ошибка. Попробуйте снова.");
    } finally {
      setLoading(false);
    }
  }

  if (!modalOpen) return null;

  const today = startOfToday();
  const nights = range?.from && range?.to ? differenceInDays(range.to, range.from) : 0;
  const whatsappUrl = `https://api.whatsapp.com/send?phone=${process.env.NEXT_PUBLIC_WHATSAPP_PHONE ?? "996501999900"}&text=${encodeURIComponent("Здравствуйте! Интересует коттедж.")}`;

  return (
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/50 z-50 backdrop-blur-sm"
        onClick={requestClose}
      />

      {/* Modal */}
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
        <div
          className="bg-snow-peak w-full max-w-4xl max-h-[92vh] overflow-auto shadow-2xl relative"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Header */}
          <div className="flex items-center justify-between px-7 pt-6 pb-4 border-b border-outline-var">
            <h2 className="font-serif text-[22px] text-on-surface">{t("headline")}</h2>
            <button
              onClick={requestClose}
              className="text-on-surface-var hover:text-on-surface text-2xl leading-none w-9 h-9 flex items-center justify-center hover:bg-earth-sand transition-colors"
              aria-label="Закрыть"
            >
              ×
            </button>
          </div>

          {submitted ? (
            /* Success screen */
            <div className="flex flex-col items-center justify-center py-20 px-8 text-center">
              <div className="w-16 h-16 rounded-full bg-forest/10 flex items-center justify-center mb-6">
                <svg width="32" height="32" viewBox="0 0 32 32" fill="none">
                  <path d="M6 16L13 23L26 9" stroke="#1b4a40" strokeWidth="2.5" strokeLinecap="square"/>
                </svg>
              </div>
              <h3 className="font-serif text-headline-sm text-on-surface mb-3">{t("success")}</h3>
              <p className="text-body-md text-on-surface-var max-w-sm">{t("successDesc")}</p>
              {range?.from && range?.to && (
                <div className="mt-6 bg-earth-sand px-8 py-4 text-sm text-on-surface-var text-left">
                  <p><strong>Заезд:</strong> {format(range.from, "dd.MM.yyyy")}</p>
                  <p><strong>Выезд:</strong> {format(range.to, "dd.MM.yyyy")}</p>
                  <p><strong>Гостей:</strong> {guestsLocal}</p>
                </div>
              )}
              <button onClick={handleClose} className="mt-8 bg-primary text-white text-[12px] font-bold tracking-widest uppercase px-8 py-3 hover:bg-primary-hover transition-colors">
                Закрыть
              </button>
            </div>
          ) : (
            <div className="flex flex-col lg:flex-row">
              {/* Calendar */}
              <div className="lg:w-auto lg:flex-shrink-0 px-6 py-6 border-b lg:border-b-0 lg:border-r border-outline-var bg-surface">
                <DayPicker
                  mode="range"
                  selected={range}
                  onSelect={(r) => { setRange(r); setDirty(true); }}
                  numberOfMonths={2}
                  locale={locale === "ru" ? ruLocale : undefined}
                  disabled={[
                    { before: today },
                    ...disabledRanges,
                  ]}
                  showOutsideDays={false}
                  className="!m-0"
                />
                {/* Availability indicator */}
                {range?.from && range?.to && availability !== null && (
                  <div className={`mt-3 px-4 py-2 text-[13px] font-medium text-center ${
                    availability?.available
                      ? "bg-forest/10 text-forest"
                      : "bg-error/10 text-error"
                  }`}>
                    {availability?.available
                      ? `✓ Доступно · ${nights} ${nights === 1 ? "ночь" : nights < 5 ? "ночи" : "ночей"}`
                      : "✕ Эти даты заняты"}
                  </div>
                )}
              </div>

              {/* Form */}
              <div className="flex-1 px-7 py-6 flex flex-col gap-5">
                {/* Guests */}
                <div>
                  <label className="block text-[11px] font-bold tracking-[0.12em] uppercase text-on-surface-var mb-2">
                    {t("guests")} (макс. {MAX_GUESTS})
                  </label>
                  <div className="flex items-center gap-3">
                    <button onClick={() => setGuestsLocal(Math.max(1, guestsLocal - 1))}
                      className="w-8 h-8 border border-outline flex items-center justify-center font-bold hover:bg-earth-sand transition-colors">−</button>
                    <span className="text-[16px] font-medium w-6 text-center">{guestsLocal}</span>
                    <button onClick={() => setGuestsLocal(Math.min(MAX_GUESTS, guestsLocal + 1))}
                      className="w-8 h-8 border border-outline flex items-center justify-center font-bold hover:bg-earth-sand transition-colors">+</button>
                  </div>
                </div>

                {/* Name */}
                <div>
                  <label className="block text-[11px] font-bold tracking-[0.12em] uppercase text-on-surface-var mb-2">{t("name")} *</label>
                  <input
                    type="text"
                    value={name}
                    onChange={(e) => { setName(e.target.value); setDirty(true); }}
                    className="w-full border-b border-outline bg-transparent pb-2 text-[15px] text-on-surface focus:outline-none focus:border-primary transition-colors placeholder:text-on-surface-var/40"
                    placeholder="Ваше имя"
                  />
                </div>

                {/* Phone */}
                <div>
                  <label className="block text-[11px] font-bold tracking-[0.12em] uppercase text-on-surface-var mb-2">{t("phone")} *</label>
                  <input
                    type="tel"
                    value={phone}
                    onChange={(e) => { setPhone(e.target.value); setDirty(true); }}
                    className="w-full border-b border-outline bg-transparent pb-2 text-[15px] text-on-surface focus:outline-none focus:border-primary transition-colors placeholder:text-on-surface-var/40"
                    placeholder="+996 ___ ___ ___"
                  />
                </div>

                {/* Arrival time */}
                <div>
                  <label className="block text-[11px] font-bold tracking-[0.12em] uppercase text-on-surface-var mb-2">{t("arrivalTime")}</label>
                  <input
                    type="time"
                    value={arrivalTime}
                    onChange={(e) => { setArrivalTime(e.target.value); setDirty(true); }}
                    className="w-full border-b border-outline bg-transparent pb-2 text-[15px] text-on-surface focus:outline-none focus:border-primary transition-colors"
                  />
                </div>

                {/* Comment */}
                <div>
                  <label className="block text-[11px] font-bold tracking-[0.12em] uppercase text-on-surface-var mb-2">{t("comment")}</label>
                  <textarea
                    value={comment}
                    onChange={(e) => { setComment(e.target.value); setDirty(true); }}
                    rows={2}
                    className="w-full border border-outline-var bg-transparent p-3 text-[14px] text-on-surface focus:outline-none focus:border-primary transition-colors resize-none placeholder:text-on-surface-var/40"
                    placeholder="Любые пожелания..."
                  />
                </div>

                {/* Error */}
                {error && (
                  <p className="text-error text-[13px] bg-error/5 px-4 py-2">{error}</p>
                )}

                {/* Submit */}
                <button
                  onClick={handleSubmit}
                  disabled={loading || !availability?.available || !range?.from || !range?.to}
                  className="bg-primary hover:bg-primary-hover disabled:bg-on-surface-var/30 text-white text-[12px] font-bold tracking-widest uppercase py-4 transition-colors"
                >
                  {loading ? "..." : t("submit")}
                </button>

                {/* Cottage hint */}
                <p className="text-[12px] text-on-surface-var/70 leading-relaxed">
                  {t("cottageHint")}{" "}
                  <a href={whatsappUrl} target="_blank" rel="noopener noreferrer"
                    className="underline underline-offset-2 hover:text-on-surface-var transition-colors">
                    {t("cottageLink")} →
                  </a>
                </p>
              </div>
            </div>
          )}
        </div>

        {/* Confirm close dialog */}
        {confirmClose && (
          <div className="fixed inset-0 z-60 flex items-center justify-center">
            <div className="bg-white shadow-2xl p-8 max-w-sm w-full mx-4">
              <p className="font-serif text-[18px] text-on-surface mb-6">{t("closeConfirm")}</p>
              <div className="flex gap-3">
                <button onClick={handleClose} className="flex-1 bg-primary text-white text-[12px] font-bold tracking-widest uppercase py-3 hover:bg-primary-hover transition-colors">
                  Закрыть
                </button>
                <button onClick={() => setConfirmClose(false)} className="flex-1 border border-outline text-on-surface text-[12px] font-bold tracking-widest uppercase py-3 hover:bg-earth-sand transition-colors">
                  Остаться
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </>
  );
}
