"use client";
import { useState, useEffect } from "react";
import { getCalendar } from "@/lib/api";

type BookingSlot = {
  id: number;
  check_in: string;
  check_out: string;
  status: string;
  guest_name: string;
  guest_phone: string;
  guests_count: number;
  source: string;
};

const STATUS_COLORS: Record<string, string> = {
  confirmed: "bg-forest text-white",
  pending:   "bg-amber-500 text-white",
  blocked:   "bg-gray-400 text-white",
  cancelled: "bg-gray-200 text-gray-500",
};

const STATUS_LABELS: Record<string, string> = {
  confirmed: "Подтверждено",
  pending:   "Ожидает",
  blocked:   "Заблокировано",
  cancelled: "Отменено",
};

const MONTHS_RU = [
  "Январь","Февраль","Март","Апрель","Май","Июнь",
  "Июль","Август","Сентябрь","Октябрь","Ноябрь","Декабрь",
];
const DAYS_RU = ["Пн","Вт","Ср","Чт","Пт","Сб","Вс"];

function getDaysInMonth(year: number, month: number) {
  return new Date(year, month, 0).getDate();
}

function getFirstDayOfWeek(year: number, month: number) {
  // 0=Mon...6=Sun
  const d = new Date(year, month - 1, 1).getDay();
  return d === 0 ? 6 : d - 1;
}

function isoDate(year: number, month: number, day: number) {
  return `${year}-${String(month).padStart(2, "0")}-${String(day).padStart(2, "0")}`;
}

function bookingsForDay(bookings: BookingSlot[], date: string) {
  return bookings.filter(
    (b) => b.status !== "cancelled" && b.check_in <= date && b.check_out > date
  );
}

export default function AdminCalendar() {
  const now = new Date();
  const [year, setYear] = useState(now.getFullYear());
  const [month, setMonth] = useState(now.getMonth() + 1);
  const [bookings, setBookings] = useState<BookingSlot[]>([]);
  const [loading, setLoading] = useState(true);
  const [selected, setSelected] = useState<BookingSlot | null>(null);

  useEffect(() => {
    setLoading(true);
    getCalendar(year, month)
      .then((data) => setBookings(data as BookingSlot[]))
      .finally(() => setLoading(false));
  }, [year, month]);

  function prevMonth() {
    if (month === 1) { setYear(y => y - 1); setMonth(12); }
    else setMonth(m => m - 1);
  }
  function nextMonth() {
    if (month === 12) { setYear(y => y + 1); setMonth(1); }
    else setMonth(m => m + 1);
  }

  const daysInMonth = getDaysInMonth(year, month);
  const firstDow = getFirstDayOfWeek(year, month);
  const todayStr = isoDate(now.getFullYear(), now.getMonth() + 1, now.getDate());

  const cells: (number | null)[] = [
    ...Array(firstDow).fill(null),
    ...Array.from({ length: daysInMonth }, (_, i) => i + 1),
  ];
  // pad to complete last row
  while (cells.length % 7 !== 0) cells.push(null);

  return (
    <div className="p-8">
      <div className="flex gap-2 items-center justify-between mb-8">
        <h1 className="font-serif text-[22px] md:text-[28px] text-on-surface" style={{ fontFamily: "var(--font-playfair), serif" }}>
          Календарь
        </h1>
        <div className="flex items-center gap-4">
          {/* Legend */}
          <div className="hidden sm:flex items-center gap-4 text-[12px]">
            {Object.entries(STATUS_LABELS).filter(([k]) => k !== "cancelled").map(([k, v]) => (
              <span key={k} className="flex items-center gap-1.5">
                <span className={`w-3 h-3 inline-block ${STATUS_COLORS[k]}`} />
                {v}
              </span>
            ))}
          </div>
          {/* Nav */}
          <div className="flex items-center gap-3">
            <button onClick={prevMonth}
              className="w-9 h-9 border border-outline flex items-center justify-center hover:bg-earth-sand transition-colors">
              ←
            </button>
            <span className="font-serif text-[18px] text-on-surface md:min-w-[160px] text-center"
              style={{ fontFamily: "var(--font-playfair), serif" }}>
              {MONTHS_RU[month - 1]} {year}
            </span>
            <button onClick={nextMonth}
              className="w-9 h-9 border border-outline flex items-center justify-center hover:bg-earth-sand transition-colors">
              →
            </button>
          </div>
        </div>
      </div>

      {/* Calendar grid */}
      <div className="bg-white border border-outline-var">
        {/* Header */}
        <div className="grid grid-cols-7 border-b border-outline-var">
          {DAYS_RU.map((d) => (
            <div key={d} className="py-3 text-center text-[11px] font-bold tracking-widest uppercase text-on-surface-var">
              {d}
            </div>
          ))}
        </div>

        {/* Days */}
        {Array.from({ length: cells.length / 7 }, (_, week) => (
          <div key={week} className="grid grid-cols-7 border-b last:border-b-0 border-outline-var min-h-[100px]">
            {cells.slice(week * 7, week * 7 + 7).map((day, i) => {
              if (!day) return <div key={i} className="border-r last:border-r-0 border-outline-var bg-surface/50" />;
              const dateStr = isoDate(year, month, day);
              const dayBookings = bookingsForDay(bookings, dateStr);
              const isToday = dateStr === todayStr;
              const isPast = dateStr < todayStr;

              return (
                <div key={day}
                  className={`border-r last:border-r-0 border-outline-var p-1.5 ${isPast ? "bg-surface/50" : ""}`}>
                  <div className={`text-[13px] font-medium mb-1 w-7 h-7 flex items-center justify-center ${
                    isToday ? "bg-primary text-white" : isPast ? "text-on-surface-var/50" : "text-on-surface"
                  }`}>
                    {day}
                  </div>
                  <div className="flex flex-col gap-0.5">
                    {dayBookings.slice(0, 2).map((b) => (
                      <button
                        key={b.id}
                        onClick={() => setSelected(b)}
                        className={`text-left text-[10px] font-bold px-1.5 py-0.5 truncate w-full leading-tight ${STATUS_COLORS[b.status]}`}
                        title={b.guest_name}
                      >
                        {b.status === "blocked" ? "Блок" : b.guest_name}
                      </button>
                    ))}
                    {dayBookings.length > 2 && (
                      <span className="text-[10px] text-on-surface-var px-1">+{dayBookings.length - 2}</span>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        ))}
      </div>

      {/* Booking detail popup */}
      {selected && (
        <div className="fixed inset-0 z-50 bg-black/40 flex items-center justify-center p-4"
          onClick={() => setSelected(null)}>
          <div className="bg-white shadow-2xl p-8 max-w-sm w-full" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-start justify-between mb-5">
              <div>
                <span className={`text-[11px] font-bold tracking-wide uppercase px-2 py-0.5 ${STATUS_COLORS[selected.status]}`}>
                  {STATUS_LABELS[selected.status]}
                </span>
              </div>
              <button onClick={() => setSelected(null)} className="text-on-surface-var hover:text-on-surface text-xl">×</button>
            </div>
            <h3 className="font-serif text-[20px] text-on-surface mb-1" style={{ fontFamily: "var(--font-playfair), serif" }}>
              {selected.status === "blocked" ? "Блокировка" : selected.guest_name}
            </h3>
            {selected.status !== "blocked" && (
              <p className="text-[14px] text-on-surface-var mb-5">{selected.guest_phone}</p>
            )}
            <div className="grid grid-cols-2 gap-4 text-[13px] bg-earth-sand p-4">
              <div>
                <p className="text-[11px] font-bold tracking-wide uppercase text-on-surface-var mb-1">Заезд</p>
                <p className="text-on-surface">{new Date(selected.check_in).toLocaleDateString("ru-RU")}</p>
              </div>
              <div>
                <p className="text-[11px] font-bold tracking-wide uppercase text-on-surface-var mb-1">Выезд</p>
                <p className="text-on-surface">{new Date(selected.check_out).toLocaleDateString("ru-RU")}</p>
              </div>
              {selected.guests_count > 0 && (
                <div>
                  <p className="text-[11px] font-bold tracking-wide uppercase text-on-surface-var mb-1">Гостей</p>
                  <p className="text-on-surface">{selected.guests_count}</p>
                </div>
              )}
              <div>
                <p className="text-[11px] font-bold tracking-wide uppercase text-on-surface-var mb-1">Источник</p>
                <p className="text-on-surface">{selected.source === "admin" ? "Вручную" : "Сайт"}</p>
              </div>
            </div>
            <div className="flex gap-2 mt-5">
              <a href="/admin"
                className="flex-1 bg-primary text-white text-[11px] font-bold tracking-wide uppercase py-3 text-center hover:bg-primary-hover transition-colors">
                Управление →
              </a>
              <button onClick={() => setSelected(null)}
                className="px-5 border border-outline text-on-surface-var text-[11px] font-bold tracking-wide uppercase hover:bg-earth-sand transition-colors">
                Закрыть
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
