/**
 * Thin fetch wrapper around the UstaGo Avto Laravel API.
 *
 * - Unwraps the backend's `{ success, message, data }` / `{ success, message, errors }`
 *   envelope automatically.
 * - Attaches the Sanctum bearer token (if present) to every request.
 * - Throws `ApiError` on any non-2xx or `success: false` response, with
 *   `.message` set to the backend's message string. The backend deliberately
 *   returns i18n keys (e.g. "errors.invalidCredentials") as messages, so
 *   callers can keep doing `t(err.message, { defaultValue: ... })` exactly
 *   like the old mock auth did — no call-site changes needed for that part.
 */

const TOKEN_KEY = "ustago.auth.token.v1";

const rawApiUrl = (import.meta.env.VITE_API_URL as string | undefined)?.trim().replace(/\/+$/, "");
export const API_BASE_URL: string = rawApiUrl
  ? (rawApiUrl.endsWith("/api") ? rawApiUrl : `${rawApiUrl}/api`)
  : (import.meta.env.DEV ? "/api" : "http://localhost:8000/api");

export function getToken(): string | null {
  try {
    return window.localStorage.getItem(TOKEN_KEY);
  } catch {
    return null;
  }
}

export function setToken(token: string) {
  try {
    window.localStorage.setItem(TOKEN_KEY, token);
  } catch {
    /* ignore — e.g. storage disabled */
  }
}

export function clearToken() {
  try {
    window.localStorage.removeItem(TOKEN_KEY);
  } catch {
    /* ignore */
  }
}

export class ApiError extends Error {
  status: number;
  errors: Record<string, string[]>;

  constructor(message: string, status: number, errors: Record<string, string[]> = {}) {
    super(message);
    this.name = "ApiError";
    this.status = status;
    this.errors = errors;
  }

  /** First validation message for a given field, if any — handy for inline form errors. */
  fieldError(field: string): string | undefined {
    return this.errors[field]?.[0];
  }
}

interface Envelope<T> {
  success: boolean;
  message: string;
  data?: T;
  errors?: Record<string, string[]>;
}

interface RequestOptions {
  method?: "GET" | "POST" | "PATCH" | "PUT" | "DELETE";
  body?: unknown;
  query?: Record<string, string | number | boolean | undefined | null>;
  /** Skip attaching the bearer token (only auth/register + public browsing need this). */
  anonymous?: boolean;
}

function buildUrl(path: string, query?: RequestOptions["query"]): string {
  const apiPath = `${API_BASE_URL}${path.startsWith("/") ? path : `/${path}`}`;
  const url = new URL(apiPath, apiPath.startsWith("/") ? window.location.origin : undefined);
  if (query) {
    for (const [key, value] of Object.entries(query)) {
      if (value !== undefined && value !== null && value !== "") {
        url.searchParams.set(key, String(value));
      }
    }
  }
  return url.toString();
}

async function request<T>(path: string, options: RequestOptions = {}): Promise<T> {
  const { method = "GET", body, query, anonymous } = options;

  const isFormData = typeof FormData !== "undefined" && body instanceof FormData;

  const headers: Record<string, string> = {
    Accept: "application/json",
  };
  if (body !== undefined && !isFormData) headers["Content-Type"] = "application/json";
  if (!anonymous) {
    const token = getToken();
    if (token) headers.Authorization = `Bearer ${token}`;
  }

  let response: Response;
  try {
    response = await fetch(buildUrl(path, query), {
      method,
      headers,
      body:
        body !== undefined ? (isFormData ? (body as FormData) : JSON.stringify(body)) : undefined,
    });
  } catch {
    throw new ApiError("errors.networkError", 0);
  }

  // 204/empty bodies (e.g. some DELETE responses) — treat as success with no data.
  const text = await response.text();
  let json: Envelope<T>;
  if (!text) {
    json = { success: response.ok, message: "" };
  } else {
    let parsed: unknown;
    try {
      parsed = JSON.parse(text);
    } catch {
      if (!response.ok) {
        if (response.status === 401) clearToken();
        throw new ApiError("errors.unexpected", response.status);
      }
      throw new ApiError("errors.invalidResponse", response.status);
    }
    if (parsed === null || typeof parsed !== "object" || Array.isArray(parsed)) {
      if (response.status === 401) clearToken();
      throw new ApiError("errors.invalidResponse", response.status);
    }
    json = parsed as Envelope<T>;
  }

  if (!response.ok || json.success === false) {
    if (response.status === 401) clearToken();
    throw new ApiError(json.message || "errors.unexpected", response.status, json.errors ?? {});
  }

  return json.data as T;
}

export const api = {
  get: <T>(path: string, query?: RequestOptions["query"], anonymous?: boolean) =>
    request<T>(path, { method: "GET", query, anonymous }),
  post: <T>(path: string, body?: unknown, anonymous?: boolean) =>
    request<T>(path, { method: "POST", body, anonymous }),
  patch: <T>(path: string, body?: unknown) => request<T>(path, { method: "PATCH", body }),
  put: <T>(path: string, body?: unknown) => request<T>(path, { method: "PUT", body }),
  delete: <T>(path: string) => request<T>(path, { method: "DELETE" }),
};

/** Standard paginated envelope shape returned by list endpoints (masters, bookings, reviews, admin lists). */
export interface Paginated<T> {
  items: T[];
  meta: {
    page: number;
    perPage: number;
    total: number;
    lastPage: number;
  };
}
