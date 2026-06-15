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
  const [isOpen, setIsOpen] = useState(false);

  // Во избежание падения скриптов на мобилках при ошибках сети обернем в try/catch
  useEffect(() => {
    getMe()
      .then((u) => {
        if (u && u.email) setEmail(u.email);
      })
      .catch((err) => {
        console.error("Auth error:", err);
        // Если вы удаленно тестируете, пока не редиректим жестко, чтобы не сломать сессию ngrok
        // router.push("/admin/login");
      });
  }, []);

  async function handleLogout() {
    try {
      await logout();
      router.push("/admin/login");
    } catch (e) {
      console.error(e);
    }
  }

  return (
    <div className="min-h-screen flex flex-col md:flex-row bg-surface">
      

      <header className="md:hidden w-full h-[60px] bg-primary flex items-center justify-between px-4 fixed top-0 left-0 z-50 border-b border-white/10">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-full border border-white/30 flex items-center justify-center">
            <svg width="18" height="13" viewBox="0 0 18 13" fill="none">
              <polyline points="1,12 9,2 17,12" stroke="white" strokeWidth="1.5" fill="none"/>
              <polyline points="4,12 9,5 14,12" stroke="white" strokeWidth="1.5" fill="none"/>
            </svg>
          </div>
          <div>
            <p className="text-white text-[14px] font-semibold" style={{ fontFamily: "var(--font-playfair), serif" }}>Fachwerk</p>
          </div>
        </div>

        <button 
          onClick={() => setIsOpen(!isOpen)} 
          className="text-white p-3 z-50 focus:outline-none relative block active:scale-95 transition-transform"
          aria-label="Toggle menu"
          type="button"
        >
          <div className="w-6 h-5 flex flex-col justify-between relative pointer-events-none">
            <span className={`w-full h-0.5 bg-white transition-all duration-300 ${isOpen ? 'rotate-45 translate-y-2' : ''}`} />
            <span className={`w-full h-0.5 bg-white transition-all duration-300 ${isOpen ? 'opacity-0' : ''}`} />
            <span className={`w-full h-0.5 bg-white transition-all duration-300 ${isOpen ? '-rotate-45 -translate-y-2' : ''}`} />
          </div>
        </button>
      </header>

      {isOpen && (
        <div 
          className="fixed inset-0 bg-black/60 z-40 md:hidden" 
          onClick={() => setIsOpen(false)}
        />
      )}


      <aside 
        className={`
          fixed top-0 bottom-0 left-0 z-45 bg-primary flex flex-col justify-between
          w-64 border-r border-white/10 transition-transform duration-300 ease-in-out
          md:relative md:translate-x-0 md:min-h-screen
          ${isOpen ? "translate-x-0" : "-translate-x-full"}
        `}
        style={{ fontFamily: "Montserrat, sans-serif" }}
      >
        <div>
          <div className="hidden md:flex px-6 py-6 border-b border-white/10 items-center gap-3">
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

          <nav className="px-3 pt-20 md:pt-4 flex flex-col gap-1">
            {NAV.map(({ href, label, icon }) => {
              const isActive = href === "/admin" ? pathname === "/admin" : pathname.startsWith(href);
              return (
                <a 
                  key={href} 
                  href={href}
                  onClick={() => setIsOpen(false)}
                  className={`flex items-center gap-3 px-4 py-3 text-[13px] font-bold tracking-wide transition-colors ${
                    isActive ? "bg-white/15 text-white" : "text-white/60 hover:text-white hover:bg-white/8"
                  }`}
                >
                  <span>{icon}</span>
                  {label}
                </a>
              );
            })}
          </nav>
        </div>

        <div className="px-6 py-5 border-t border-white/10 bg-primary">
          <p className="text-white/40 text-[11px] mb-2 truncate">{email || "admin@fachwerk.com"}</p>
          <button 
            onClick={handleLogout}
            className="text-white/60 hover:text-white text-[12px] font-bold tracking-widest uppercase transition-colors"
          >
            Выйти →
          </button>
        </div>
      </aside>


      <main className="pt-[60px] md:pt-0 flex-1 overflow-auto">
        <div className="p-4 md:p-8">
          {children}
        </div>
      </main>

    </div>
  );
}