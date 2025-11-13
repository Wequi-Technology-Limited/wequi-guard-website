export type RequestMethod = "GET" | "POST" | "PUT" | "PATCH" | "DELETE";

export interface RequestOptions {
  method?: RequestMethod;
  params?: Record<string, string | number | boolean | undefined>;
  body?: unknown;
  headers?: HeadersInit;
  responseType?: "json" | "blob" | "text";
  signal?: AbortSignal;
}

const API_BASE_URL = import.meta.env.VITE_ADMIN_API_BASE_URL || "http://localhost:8080";
const API_TOKEN = import.meta.env.VITE_ADMIN_API_TOKEN || "";

const buildUrl = (path: string, params?: RequestOptions["params"]) => {
  const url = path.startsWith("http") ? new URL(path) : new URL(path, API_BASE_URL);
  if (params) {
    Object.entries(params).forEach(([key, value]) => {
      if (value === undefined || value === null || value === "") return;
      url.searchParams.set(key, String(value));
    });
  }
  return url.toString();
};

export class ApiError extends Error {
  status: number;
  payload?: unknown;
  constructor(message: string, status: number, payload?: unknown) {
    super(message);
    this.status = status;
    this.payload = payload;
  }
}

const request = async <T>(path: string, options: RequestOptions = {}): Promise<T> => {
  const { method = "GET", params, body, headers, responseType = "json", signal } = options;
  const url = buildUrl(path, params);
  const resolvedHeaders = new Headers(headers);
  if (body) {
    resolvedHeaders.set("Content-Type", resolvedHeaders.get("Content-Type") || "application/json");
  }
  if (API_TOKEN && !resolvedHeaders.get("Authorization")) {
    resolvedHeaders.set("Authorization", `Bearer ${API_TOKEN}`);
  }

  const init: RequestInit = {
    method,
    headers: resolvedHeaders,
    body: body ? JSON.stringify(body) : undefined,
    signal,
  };

  const response = await fetch(url, init);
  if (!response.ok) {
    let payload: unknown;
    try {
      payload = await response.json();
    } catch (error) {
      payload = await response.text();
    }
    throw new ApiError(response.statusText, response.status, payload);
  }

  if (responseType === "blob") {
    return (await response.blob()) as T;
  }

  if (responseType === "text") {
    return (await response.text()) as T;
  }

  if (response.status === 204) {
    return undefined as T;
  }

  return (await response.json()) as T;
};

export const adminApiClient = {
  get: <T>(path: string, options?: Omit<RequestOptions, "method">) => request<T>(path, { ...options, method: "GET" }),
  post: <T>(path: string, options?: Omit<RequestOptions, "method">) => request<T>(path, { ...options, method: "POST" }),
  put: <T>(path: string, options?: Omit<RequestOptions, "method">) => request<T>(path, { ...options, method: "PUT" }),
  patch: <T>(path: string, options?: Omit<RequestOptions, "method">) => request<T>(path, { ...options, method: "PATCH" }),
  delete: <T>(path: string, options?: Omit<RequestOptions, "method">) => request<T>(path, { ...options, method: "DELETE" }),
};

export const getAdminApiBaseUrl = () => API_BASE_URL;
