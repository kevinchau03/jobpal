// lib/api.ts
export async function api<T>(path: string, init: RequestInit = {}): Promise<T> {
  const res = await fetch(`http://localhost:4000${path}`, {
    ...init,
    headers: {
      "Content-Type": "application/json",
      ...(init.headers || {}),
    },
    credentials: "include", // include cookies
  });

  const data = await res.json().catch(() => ({}));
  if (!res.ok) {
    const errorData = data as { message?: string };
    throw new Error(errorData?.message || `Request failed (${res.status})`);
  }
  return data as T;
}
