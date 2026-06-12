const API_URL = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:8000";

async function apiFetch<T>(path: string, options?: RequestInit): Promise<T> {
  const res = await fetch(`${API_URL}${path}`, {
    credentials: "include",
    ...options,
    headers: {
      "Content-Type": "application/json",
      ...options?.headers,
    },
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({ detail: res.statusText }));
    throw { status: res.status, detail: err.detail ?? "Unknown error" };
  }
  return res.json();
}

// Public
export const getBookedDates = () =>
  apiFetch<{ check_in: string; check_out: string; status: string }[]>("/api/booked-dates");

export const checkAvailability = (check_in: string, check_out: string) =>
  apiFetch<{ available: boolean; nights: number }>(
    `/api/availability?check_in=${check_in}&check_out=${check_out}`
  );

export const createBooking = (data: Record<string, unknown>) =>
  apiFetch("/api/bookings", { method: "POST", body: JSON.stringify(data) });

export const getConfig = () => apiFetch<Record<string, unknown>>("/api/config");

// Auth
export const login = (email: string, password: string) =>
  apiFetch("/api/auth/login", { method: "POST", body: JSON.stringify({ email, password }) });

export const logout = () => apiFetch("/api/auth/logout", { method: "POST" });

export const getMe = () => apiFetch<{ id: number; email: string }>("/api/auth/me");

// Admin
export const getAdminBookings = (params?: Record<string, string>) => {
  const qs = params ? "?" + new URLSearchParams(params).toString() : "";
  return apiFetch<unknown[]>(`/api/admin/bookings${qs}`);
};

export const createAdminBooking = (data: Record<string, unknown>) =>
  apiFetch("/api/admin/bookings", { method: "POST", body: JSON.stringify(data) });

export const updateBookingStatus = (id: number, status: string) =>
  apiFetch(`/api/admin/bookings/${id}`, {
    method: "PATCH",
    body: JSON.stringify({ status }),
  });

export const blockDates = (data: Record<string, unknown>) =>
  apiFetch("/api/admin/blocks", { method: "POST", body: JSON.stringify(data) });

export const deleteBlock = (id: number) =>
  apiFetch(`/api/admin/blocks/${id}`, { method: "DELETE" });

export const getCalendar = (year: number, month: number) =>
  apiFetch<unknown[]>(`/api/admin/calendar?year=${year}&month=${month}`);
