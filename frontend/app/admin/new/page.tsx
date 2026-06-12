"use client";
import { useState } from "react";
import { createAdminBooking, blockDates } from "@/lib/api";

type Mode = "booking" | "block";

export default function AdminNewBooking() {
  const [mode, setMode] = useState<Mode>("booking");

  // Booking fields
  const [checkIn, setCheckIn] = useState("");
  const [checkOut, setCheckOut] = useState("");
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [guests, setGuests] = useState(2);
  const [arrivalTime, setArrivalTime] = useState("");
  const [comment, setComment] = useState("");

  // UI state
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  function reset() {
    setCheckIn(""); setCheckOut(""); setName(""); setPhone("");
    setGuests(2); setArrivalTime(""); setComment("");
    setError(""); setSuccess("");
  }

  async function handleSubmitBooking() {
    if (!checkIn || !checkOut) return setError("Укажите даты заезда и выезда");
    if (!name.trim()) return setError("Введите имя гостя");
    if (!phone.trim()) return setError("Введите телефон");
    setLoading(true); setError("");
    try {
      await createAdminBooking({
        check_in: checkIn, check_out: checkOut,
        guests_count: guests, guest_name: name,
        guest_phone: phone,
        arrival_time: arrivalTime || null,
        comment: comment || null,
      });
      setSuccess("Бронь создана и подтверждена.");
      reset();
    } catch (e: unknown) {
      const err = e as { detail?: string };
      setError(err?.detail ?? "Ошибка при создании брони");
    } finally {
      setLoading(false);
    }
  }

  async function handleSubmitBlock() {
    if (!checkIn || !checkOut) return setError("Укажите даты блокировки");
    setLoading(true); setError("");
    try {
      await blockDates({ check_in: checkIn, check_out: checkOut, comment: comment || null });
      setSuccess(`Даты ${checkIn} — ${checkOut} заблокированы.`);
      reset();
    } catch (e: unknown) {
      const err = e as { detail?: string };
      setError(err?.detail ?? "Ошибка при блокировке дат");
    } finally {
      setLoading(false);
    }
  }

  const inputCls = "w-full border-b border-outline bg-transparent pb-2 text-[15px] text-on-surface focus:outline-none focus:border-primary transition-colors placeholder:text-on-surface-var/40";
  const labelCls = "block text-[11px] font-bold tracking-[0.12em] uppercase text-on-surface-var mb-2";

  return (
    <div className="p-8 max-w-xl">
      <h1 className="font-serif text-[28px] text-on-surface mb-8" style={{ fontFamily: "var(--font-playfair), serif" }}>
        Создать бронь
      </h1>

      {/* Mode toggle */}
      <div className="flex mb-8 border border-outline-var">
        <button onClick={() => { setMode("booking"); reset(); }}
          className={`flex-1 py-3 text-[12px] font-bold tracking-widest uppercase transition-colors ${
            mode === "booking" ? "bg-primary text-white" : "text-on-surface-var hover:bg-earth-sand"
          }`}>
          📋 Новая бронь
        </button>
        <button onClick={() => { setMode("block"); reset(); }}
          className={`flex-1 py-3 text-[12px] font-bold tracking-widest uppercase border-l border-outline-var transition-colors ${
            mode === "block" ? "bg-primary text-white" : "text-on-surface-var hover:bg-earth-sand"
          }`}>
          🚫 Заблокировать даты
        </button>
      </div>

      <div className="bg-white p-8 border border-outline-var flex flex-col gap-6">
        {/* Dates */}
        <div className="grid grid-cols-2 gap-6">
          <div>
            <label className={labelCls}>Дата заезда *</label>
            <input type="date" value={checkIn} onChange={(e) => setCheckIn(e.target.value)}
              className={inputCls} min={new Date().toISOString().split("T")[0]} />
          </div>
          <div>
            <label className={labelCls}>Дата выезда *</label>
            <input type="date" value={checkOut} onChange={(e) => setCheckOut(e.target.value)}
              className={inputCls} min={checkIn || new Date().toISOString().split("T")[0]} />
          </div>
        </div>

        {mode === "booking" && (
          <>
            {/* Name */}
            <div>
              <label className={labelCls}>Имя гостя *</label>
              <input type="text" value={name} onChange={(e) => setName(e.target.value)}
                className={inputCls} placeholder="Имя и фамилия" />
            </div>

            {/* Phone */}
            <div>
              <label className={labelCls}>Телефон *</label>
              <input type="tel" value={phone} onChange={(e) => setPhone(e.target.value)}
                className={inputCls} placeholder="+996 ___ ___ ___" />
            </div>

            {/* Guests */}
            <div>
              <label className={labelCls}>Кол-во гостей</label>
              <div className="flex items-center gap-3 mt-1">
                <button onClick={() => setGuests(Math.max(1, guests - 1))}
                  className="w-8 h-8 border border-outline flex items-center justify-center font-bold hover:bg-earth-sand transition-colors">−</button>
                <span className="text-[16px] font-medium w-6 text-center">{guests}</span>
                <button onClick={() => setGuests(Math.min(10, guests + 1))}
                  className="w-8 h-8 border border-outline flex items-center justify-center font-bold hover:bg-earth-sand transition-colors">+</button>
              </div>
            </div>

            {/* Arrival time */}
            <div>
              <label className={labelCls}>Примерное время заезда</label>
              <input type="time" value={arrivalTime} onChange={(e) => setArrivalTime(e.target.value)}
                className={inputCls} />
            </div>
          </>
        )}

        {/* Comment */}
        <div>
          <label className={labelCls}>{mode === "block" ? "Причина (необязательно)" : "Комментарий"}</label>
          <textarea value={comment} onChange={(e) => setComment(e.target.value)}
            rows={2}
            className="w-full border border-outline-var bg-transparent p-3 text-[14px] text-on-surface focus:outline-none focus:border-primary transition-colors resize-none placeholder:text-on-surface-var/40"
            placeholder={mode === "block" ? "Ремонт, личное использование..." : "Любые пожелания гостя..."} />
        </div>

        {/* Info for block mode */}
        {mode === "block" && (
          <div className="bg-amber-50 border border-amber-200 px-4 py-3 text-[13px] text-amber-800">
            ⚠️ Заблокированные даты будут недоступны для бронирования на сайте.
          </div>
        )}

        {/* Error / Success */}
        {error && <p className="text-error text-[13px] bg-error/5 px-4 py-2">{error}</p>}
        {success && <p className="text-forest text-[13px] bg-forest/5 px-4 py-3 font-medium">✓ {success}</p>}

        {/* Submit */}
        <button
          onClick={mode === "booking" ? handleSubmitBooking : handleSubmitBlock}
          disabled={loading}
          className="bg-primary hover:bg-primary-hover disabled:opacity-50 text-white text-[12px] font-bold tracking-widest uppercase py-4 transition-colors"
        >
          {loading ? "..." : mode === "booking" ? "Создать бронь" : "Заблокировать даты"}
        </button>
      </div>

      {mode === "booking" && (
        <p className="mt-4 text-[12px] text-on-surface-var">
          Ручная бронь автоматически получает статус «Подтверждено» и не требует обработки.
        </p>
      )}
    </div>
  );
}
