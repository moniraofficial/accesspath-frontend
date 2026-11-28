import type {
  IApiErrorResponse,
  IApiResponse,
  IAuthTokens,
} from "@/types/api";

const RAW_API_BASE =
  process.env.NEXT_PUBLIC_API_URL?.replace(/\/+$/, "") ||
  "http://localhost:5000";

export const API_BASE_URL = RAW_API_BASE;
export const API_V1_URL = `${RAW_API_BASE}/api/v1`;

const ACCESS_TOKEN_KEY = "accesspath_access_token";
const REFRESH_TOKEN_KEY = "accesspath_refresh_token";

export class ApiClientError extends Error {
  public readonly statusCode: number;
  public readonly errors?: unknown;

  constructor(message: string, statusCode: number, errors?: unknown) {
    super(message);
    this.name = "ApiClientError";
    this.statusCode = statusCode;
    this.errors = errors;
  }
}

export function getStoredTokens(): {
  accessToken: string | null;
  refreshToken: string | null;
} {
  if (typeof window === "undefined") {
    return { accessToken: null, refreshToken: null };
  }
  return {
    accessToken: window.localStorage.getItem(ACCESS_TOKEN_KEY),
    refreshToken: window.localStorage.getItem(REFRESH_TOKEN_KEY),
  };
}

export function setStoredTokens(tokens: IAuthTokens): void {
  if (typeof window === "undefined") return;
  window.localStorage.setItem(ACCESS_TOKEN_KEY, tokens.accessToken);
  window.localStorage.setItem(REFRESH_TOKEN_KEY, tokens.refreshToken);
}

export function clearStoredTokens(): void {
  if (typeof window === "undefined") return;
  window.localStorage.removeItem(ACCESS_TOKEN_KEY);
  window.localStorage.removeItem(REFRESH_TOKEN_KEY);
}

export function resolveUploadUrl(pathOrUrl?: string): string | undefined {
  if (!pathOrUrl) return undefined;
  if (pathOrUrl.startsWith("http://") || pathOrUrl.startsWith("https://")) {
    return pathOrUrl;
  }
  if (pathOrUrl.startsWith("/uploads/")) {
    return `${API_BASE_URL}${pathOrUrl}`;
  }
  return pathOrUrl;
}

type SessionInvalidListener = () => void;
const sessionInvalidListeners = new Set<SessionInvalidListener>();

export function onSessionInvalid(listener: SessionInvalidListener): () => void {
  sessionInvalidListeners.add(listener);
  return () => sessionInvalidListeners.delete(listener);
}

function notifySessionInvalid(): void {
  clearStoredTokens();
  sessionInvalidListeners.forEach((listener) => listener());
}

let inFlightRefresh: Promise<IAuthTokens | null> | null = null;

async function refreshTokensSingleFlight(): Promise<IAuthTokens | null> {
  if (inFlightRefresh) {
    return inFlightRefresh;
  }

  const { refreshToken } = getStoredTokens();
  if (!refreshToken) {
    return null;
  }

  inFlightRefresh = (async () => {
    try {
      const response = await fetch(`${API_V1_URL}/auth/refresh`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ refreshToken }),
      });

      if (!response.ok) {
        notifySessionInvalid();
        return null;
      }

      const payload = (await response.json()) as IApiResponse<IAuthTokens>;
      if (!payload.success || !payload.data?.accessToken || !payload.data?.refreshToken) {
        notifySessionInvalid();
        return null;
      }

      setStoredTokens(payload.data);
      return payload.data;
    } catch {
      notifySessionInvalid();
      return null;
    } finally {
      inFlightRefresh = null;
    }
  })();

  return inFlightRefresh;
}

export interface RequestOptions extends Omit<RequestInit, "body"> {
  body?: unknown;
  skipAuth?: boolean;
  skipRefreshRetry?: boolean;
}

export async function apiRequest<T>(
  path: string,
  options: RequestOptions = {}
): Promise<IApiResponse<T>> {
  const {
    body,
    headers: customHeaders,
    skipAuth = false,
    skipRefreshRetry = false,
    ...rest
  } = options;

  const headers = new Headers(customHeaders);
  const isBinaryBody =
    body instanceof Blob || body instanceof ArrayBuffer || body instanceof File;

  if (body !== undefined && !isBinaryBody && !headers.has("Content-Type")) {
    headers.set("Content-Type", "application/json");
  }

  if (!skipAuth) {
    const { accessToken } = getStoredTokens();
    if (accessToken) {
      headers.set("Authorization", `Bearer ${accessToken}`);
    }
  }

  const serializedBody =
    body === undefined
      ? undefined
      : isBinaryBody
        ? (body as BodyInit)
        : JSON.stringify(body);

  let response: Response;
  try {
    response = await fetch(`${API_V1_URL}${path}`, {
      ...rest,
      headers,
      body: serializedBody,
    });
  } catch {
    throw new ApiClientError(
      "Unable to reach the AccessPath server. Please check your connection and API URL.",
      0
    );
  }

  if (
    response.status === 401 &&
    !skipAuth &&
    !skipRefreshRetry &&
    !path.startsWith("/auth/login") &&
    !path.startsWith("/auth/register") &&
    !path.startsWith("/auth/refresh")
  ) {
    const refreshed = await refreshTokensSingleFlight();
    if (refreshed) {
      return apiRequest<T>(path, {
        ...options,
        skipRefreshRetry: true,
      });
    }
  }

  let parsed: IApiResponse<T> | IApiErrorResponse | null = null;
  try {
    parsed = (await response.json()) as IApiResponse<T> | IApiErrorResponse;
  } catch {
    parsed = null;
  }

  if (!response.ok || !parsed || !parsed.success) {
    const message =
      parsed && "message" in parsed && parsed.message
        ? parsed.message
        : `Request failed with status ${response.status}`;
    const errors =
      parsed && "errors" in parsed ? parsed.errors : undefined;
    throw new ApiClientError(message, response.status, errors);
  }

  return parsed as IApiResponse<T>;
}

export function buildQueryString(
  params: Record<string, string | number | boolean | undefined | null>
): string {
  const sp = new URLSearchParams();
  for (const [key, value] of Object.entries(params)) {
    if (value !== undefined && value !== null && value !== "") {
      sp.set(key, String(value));
    }
  }
  const qs = sp.toString();
  return qs ? `?${qs}` : "";
}
