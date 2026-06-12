"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { login } from "@/lib/api";

export default function AdminLogin() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleLogin() {
    setLoading(true);
    setError("");
    try {
      await login(email, password);
      router.push("/admin");
    } catch {
      setError("Неверный email или пароль");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen bg-earth-sand flex items-center justify-center px-4"
      style={{ fontFamily: "Montserrat, sans-serif" }}>
      <div className="bg-white shadow-xl w-full max-w-sm p-10">
        {/* Logo */}
        <div className="flex flex-col items-center mb-10">
          <div className="w-14 h-14 rounded-full bg-primary flex items-center justify-center mb-4">
            <svg width="28" height="20" viewBox="0 0 28 20" fill="none">
              <polyline points="1,19 14,2 27,19" stroke="white" strokeWidth="1.8" fill="none"/>
              <polyline points="6,19 14,7 22,19" stroke="white" strokeWidth="1.8" fill="none"/>
            </svg>
          </div>
          <h1 className="font-serif text-[22px] text-on-surface" style={{ fontFamily: "var(--font-playfair), serif" }}>
            Fachwerk
          </h1>
          <p className="text-[11px] tracking-[0.15em] uppercase text-on-surface-var">Admin panel</p>
        </div>

        <div className="flex flex-col gap-5">
          <div>
            <label className="block text-[11px] font-bold tracking-[0.12em] uppercase text-on-surface-var mb-2">Email</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full border-b border-outline bg-transparent pb-2 text-[15px] text-on-surface focus:outline-none focus:border-primary transition-colors"
              placeholder="admin@fachwerk.kg"
              onKeyDown={(e) => e.key === "Enter" && handleLogin()}
            />
          </div>
          <div>
            <label className="block text-[11px] font-bold tracking-[0.12em] uppercase text-on-surface-var mb-2">Пароль</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full border-b border-outline bg-transparent pb-2 text-[15px] text-on-surface focus:outline-none focus:border-primary transition-colors"
              placeholder="••••••••"
              onKeyDown={(e) => e.key === "Enter" && handleLogin()}
            />
          </div>

          {error && <p className="text-error text-[13px]">{error}</p>}

          <button
            onClick={handleLogin}
            disabled={loading}
            className="bg-primary hover:bg-primary-hover disabled:opacity-50 text-white text-[12px] font-bold tracking-widest uppercase py-4 mt-2 transition-colors"
          >
            {loading ? "..." : "Войти"}
          </button>
        </div>
      </div>
    </div>
  );
}
