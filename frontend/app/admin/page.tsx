"use client";
import { useState, useEffect } from "react";
import { getAdminBookings, updateBookingStatus } from "@/lib/api";

type Booking = {
  id: number;
  check_in: string;
  check_out: string;
  guests_count: number;
  guest_name: string;
  guest_phone: string;
  status: string;
  source: string;
  comment?: string;
  arrival_time?: string;
  created_at: string;
};

const STATUS_LABELS: Record<string, string> = {
  pending:   "Ожидает",
  confirmed: "Подтверждено",
  cancelled: "Отменено",
  blocked:   "Заблокировано",
};

const STATUS_COLORS: Record<string, string> = {
  pending:   "bg-amber-100 text-amber-800",
  confirmed: "bg-green-100 text-green-800",
  cancelled: "bg-gray-100 text-gray-600",
  blocked:   "bg-red-50 text-red-700",
};

function formatDate(d: string) {
  return new Date(d).toLocaleDateString("ru-RU", { day: "2-digit", month: "2-digit", year: "numeric" });
}

function nights(ci: string, co: string) {
  return Math.round((new Date(co).getTime() - new Date(ci).getTime()) / 86400000);
}

export default function AdminBookings() {
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [filter, setFilter] = useState("");
  const [loading, setLoading] = useState(true);

  async function load() {
    setLoading(true);
    try {
      const params: Record<string, string> = filter ? { status: filter } : {};
      const data = await getAdminBookings(params) as Booking[];
      setBookings(data);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => { load(); }, [filter]);

  async function changeStatus(id: number, status: string) {
    await updateBookingStatus(id, status);
    load();
  }

  return (
    <div className="p-8 flex flex-col  items-center">
      <div className="flex items-center flex-col  justify-between mb-8">
        <h1 className="font-serif text-[28px] text-on-surface" style={{ fontFamily: "var(--font-playfair), serif" }}>
          Брони
        </h1>
        <div className="flex mt-3 flex-wrap gap-2">
          {["", "pending", "confirmed", "cancelled", "blocked"].map((s) => (
            <button key={s} onClick={() => setFilter(s)}
              className={`px-4 py-2 text-[12px] font-bold tracking-wide uppercase border transition-colors ${
                filter === s
                  ? "bg-primary text-white border-primary"
                  : "border-outline text-on-surface-var hover:border-primary hover:text-primary"
              }`}>
              {s ? STATUS_LABELS[s] : "Все"}
            </button>
          ))}
        </div>
      </div>

      {loading ? (
        <p className="text-on-surface-var">Загрузка...</p>
      ) : bookings.length === 0 ? (
        <div className="text-center py-20">
          <p className="font-serif text-[20px] text-on-surface-var">Броней нет</p>
        </div>
      ) : (
        <div className="flex flex-col gap-3">
          {bookings.map((b) => (
            <div key={b.id} className="bg-white border border-outline-var p-5">
              <div className="flex flex-col md:flex-row md:items-start justify-between gap-4">
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-2">
                    <span className={`text-[11px] font-bold tracking-wide uppercase px-2 py-0.5 ${STATUS_COLORS[b.status]}`}>
                      {STATUS_LABELS[b.status]}
                    </span>
                    {b.source === "admin" && (
                      <span className="text-[11px] text-on-surface-var border border-outline-var px-2 py-0.5">Вручную</span>
                    )}
                    <span className="text-[12px] text-on-surface-var">#{b.id}</span>
                  </div>
                  <p className="font-serif text-[18px] text-on-surface" style={{ fontFamily: "var(--font-playfair), serif" }}>
                    {b.guest_name}
                  </p>
                  <p className="text-[14px] text-on-surface-var mt-0.5">{b.guest_phone}</p>
                  {b.comment && <p className="text-[13px] text-on-surface-var mt-1 italic">«{b.comment}»</p>}
                </div>

                <div className="flex flex-col sm:flex-row gap-6">
                  <div className="text-[13px]">
                    <p className="text-[11px] font-bold tracking-wide uppercase text-on-surface-var mb-1">Заезд</p>
                    <p className="text-on-surface font-medium">{formatDate(b.check_in)}</p>
                    {b.arrival_time && <p className="text-on-surface-var text-[12px]">в {b.arrival_time.slice(0,5)}</p>}
                  </div>
                  <div className="text-[13px]">
                    <p className="text-[11px] font-bold tracking-wide uppercase text-on-surface-var mb-1">Выезд</p>
                    <p className="text-on-surface font-medium">{formatDate(b.check_out)}</p>
                    <p className="text-on-surface-var text-[12px]">{nights(b.check_in, b.check_out)} ноч.</p>
                  </div>
                  <div className="text-[13px]">
                    <p className="text-[11px] font-bold tracking-wide uppercase text-on-surface-var mb-1">Гостей</p>
                    <p className="text-on-surface font-medium">{b.guests_count}</p>
                  </div>
                </div>

                {/* Actions */}
                <div className="flex gap-2 shrink-0">
                  {b.status === "pending" && (
                    <>
                      <button onClick={() => changeStatus(b.id, "confirmed")}
                        className="bg-primary text-white text-[11px] font-bold tracking-wide uppercase px-4 py-2 hover:bg-primary-hover transition-colors">
                        ✓ Принять
                      </button>
                      <button onClick={() => changeStatus(b.id, "cancelled")}
                        className="border border-error text-error text-[11px] font-bold tracking-wide uppercase px-4 py-2 hover:bg-error hover:text-white transition-colors">
                        ✕ Отклонить
                      </button>
                    </>
                  )}
                  {b.status === "confirmed" && (
                    <button onClick={() => changeStatus(b.id, "cancelled")}
                      className="border border-outline text-on-surface-var text-[11px] font-bold tracking-wide uppercase px-4 py-2 hover:bg-earth-sand transition-colors">
                      Отменить
                    </button>
                  )}
                  {b.status === "blocked" && (
                    <button onClick={() => changeStatus(b.id, "cancelled")}
                      className="border border-outline text-on-surface-var text-[11px] font-bold tracking-wide uppercase px-4 py-2 hover:bg-earth-sand transition-colors">
                      Снять блок
                    </button>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
