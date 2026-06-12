"use client";
import { useState, useEffect } from "react";
import { usePathname, useRouter } from "next/navigation";
import { getMe, logout } from "@/lib/api";

const NAV = [
  { href: "/admin", label: "Брони", icon: "📋" },
  { href: "/admin/calendar", label: "Календарь", icon: "📅" },
  { href: "/admin/new", label: "Новая бронь", icon: "➕" },
];

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();
  const [email, setEmail] = useState("");

  useEffect(() => {
    getMe()
      .then((u) => setEmail(u.email))
      .catch(() => router.push("/admin/login"));
  }, []);

  async function handleLogout() {
    await logout();
    router.push("/admin/login");
  }

  return (
    <div className="min-h-screen flex" style={{ fontFamily: "Montserrat, sans-serif" }}>
      {/* Sidebar */}
      <aside className="w-64 bg-primary flex flex-col">
        <div className="px-6 py-6 border-b border-white/10">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-full border border-white/30 flex items-center justify-center">
              <svg width="18" height="13" viewBox="0 0 18 13" fill="none">
                <polyline points="1,12 9,2 17,12" stroke="white" strokeWidth="1.5" fill="none"/>
                <polyline points="4,12 9,5 14,12" stroke="white" strokeWidth="1.5" fill="none"/>
              </svg>
            </div>
            <div>
              <p className="text-white text-[14px] font-semibold" style={{ fontFamily: "var(--font-playfair), serif" }}>Fachwerk</p>
              <p className="text-white/40 text-[10px] tracking-widest uppercase">Admin</p>
            </div>
          </div>
        </div>

        <nav className="flex-1 px-3 py-4 flex flex-col gap-1">
          {NAV.map(({ href, label, icon }) => {
            const isActive = href === "/admin" ? pathname === "/admin" : pathname.startsWith(href);
            return (
              <a key={href} href={href}
                className={`flex items-center gap-3 px-4 py-3 text-[13px] font-bold tracking-wide transition-colors ${
                  isActive ? "bg-white/15 text-white" : "text-white/60 hover:text-white hover:bg-white/8"
                }`}>
                <span>{icon}</span>
                {label}
              </a>
            );
          })}
        </nav>

        <div className="px-6 py-5 border-t border-white/10">
          <p className="text-white/40 text-[11px] mb-2 truncate">{email}</p>
          <button onClick={handleLogout}
            className="text-white/60 hover:text-white text-[12px] font-bold tracking-widest uppercase transition-colors">
            Выйти →
          </button>
        </div>
      </aside>

      {/* Content */}
      <main className="flex-1 bg-surface overflow-auto">
        {children}
      </main>
    </div>
  );
}
