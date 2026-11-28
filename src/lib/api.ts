import { apiRequest, buildQueryString } from "@/lib/api-client";
import type {
  BarrierCategoryType,
  BarrierStatusType,
  FeedbackStatusType,
  IAccessibilityFeatures,
  IAdminAnalytics,
  IApiResponse,
  IBarrier,
  IFavorite,
  IFavoriteWithLocation,
  IFeedback,
  ILocation,
  IRouteDiscoveryResult,
  IRoutePoint,
  IRoutePreferences,
  IUploadResult,
  IUser,
  LocationCategoryType,
  UserRoleType,
  VerificationStatusType,
} from "@/types/api";

export const authApi = {
  register(payload: { name: string; email: string; password: string }) {
    return apiRequest<{
      user: IUser;
      accessToken: string;
      refreshToken: string;
    }>("/auth/register", {
      method: "POST",
      body: payload,
      skipAuth: true,
    });
  },

  login(payload: { email: string; password: string }) {
    return apiRequest<{
      user: IUser;
      accessToken: string;
      refreshToken: string;
    }>("/auth/login", {
      method: "POST",
      body: payload,
      skipAuth: true,
    });
  },

  refresh(refreshToken: string) {
    return apiRequest<{ accessToken: string; refreshToken: string }>(
      "/auth/refresh",
      {
        method: "POST",
        body: { refreshToken },
        skipAuth: true,
      }
    );
  },

  logout(refreshToken?: string) {
    return apiRequest<undefined>("/auth/logout", {
      method: "POST",
      body: refreshToken ? { refreshToken } : {},
    });
  },

  logoutAll() {
    return apiRequest<undefined>("/auth/logout-all", {
      method: "POST",
    });
  },

  me() {
    return apiRequest<IUser>("/auth/me", {
      method: "GET",
    });
  },
};

export interface LocationListParams {
  page?: number;
  limit?: number;
  search?: string;
  category?: LocationCategoryType;
  verificationStatus?: VerificationStatusType;
  submittedBy?: string;
  lat?: number;
  lng?: number;
  radiusKm?: number;
  sortBy?: "createdAt" | "accessibilityScore" | "name" | "distance";
  sortOrder?: "asc" | "desc";
  wheelchairAccess?: boolean;
  rampAvailability?: boolean;
  elevatorAvailability?: boolean;
  accessibleRestroom?: boolean;
  accessibleParking?: boolean;
  stairFreeEntry?: boolean;
  doorAccessibility?: boolean;
}

export interface CreateLocationPayload {
  name: string;
  description: string;
  address: string;
  coordinates: { latitude: number; longitude: number };
  category: LocationCategoryType;
  accessibilityFeatures: IAccessibilityFeatures;
  photos?: string[];
}

export const locationsApi = {
  list(params: LocationListParams = {}) {
    const qs = buildQueryString({ ...params });
    return apiRequest<ILocation[]>(`/locations${qs}`, {
      method: "GET",
      skipAuth: true,
    });
  },

  getById(id: string) {
    return apiRequest<ILocation>(`/locations/${encodeURIComponent(id)}`, {
      method: "GET",
      skipAuth: true,
    });
  },

  create(payload: CreateLocationPayload) {
    return apiRequest<ILocation>("/locations", {
      method: "POST",
      body: payload,
    });
  },

  update(id: string, payload: Partial<CreateLocationPayload>) {
    return apiRequest<ILocation>(`/locations/${encodeURIComponent(id)}`, {
      method: "PATCH",
      body: payload,
    });
  },

  remove(id: string) {
    return apiRequest<undefined>(`/locations/${encodeURIComponent(id)}`, {
      method: "DELETE",
    });
  },

  verify(
    id: string,
    payload: { status: "verified" | "rejected"; rejectionReason?: string }
  ) {
    return apiRequest<ILocation>(`/locations/${encodeURIComponent(id)}/verify`, {
      method: "PATCH",
      body: payload,
    });
  },
};

export interface BarrierListParams {
  page?: number;
  limit?: number;
  search?: string;
  category?: BarrierCategoryType;
  status?: BarrierStatusType;
  reportedBy?: string;
  lat?: number;
  lng?: number;
  radiusKm?: number;
  sortBy?: "createdAt" | "distance";
  sortOrder?: "asc" | "desc";
}

export interface CreateBarrierPayload {
  category: BarrierCategoryType;
  description: string;
  imageUrl?: string;
  coordinates: { latitude: number; longitude: number };
}

export const barriersApi = {
  list(params: BarrierListParams = {}) {
    const qs = buildQueryString({ ...params });
    return apiRequest<IBarrier[]>(`/barriers${qs}`, {
      method: "GET",
      skipAuth: true,
    });
  },

  listMy(params: { page?: number; limit?: number; status?: BarrierStatusType } = {}) {
    const qs = buildQueryString({ ...params });
    return apiRequest<IBarrier[]>(`/barriers/my${qs}`, {
      method: "GET",
    });
  },

  getById(id: string) {
    return apiRequest<IBarrier>(`/barriers/${encodeURIComponent(id)}`, {
      method: "GET",
      skipAuth: true,
    });
  },

  create(payload: CreateBarrierPayload) {
    return apiRequest<IBarrier>("/barriers", {
      method: "POST",
      body: payload,
    });
  },

  update(id: string, payload: Partial<CreateBarrierPayload>) {
    return apiRequest<IBarrier>(`/barriers/${encodeURIComponent(id)}`, {
      method: "PATCH",
      body: payload,
    });
  },

  remove(id: string) {
    return apiRequest<undefined>(`/barriers/${encodeURIComponent(id)}`, {
      method: "DELETE",
    });
  },

  verify(
    id: string,
    payload: {
      status: "verified" | "rejected" | "resolved";
      rejectionReason?: string;
    }
  ) {
    return apiRequest<IBarrier>(`/barriers/${encodeURIComponent(id)}/verify`, {
      method: "PATCH",
      body: payload,
    });
  },
};

export const feedbackApi = {
  list(params: {
    page?: number;
    limit?: number;
    locationId?: string;
    status?: FeedbackStatusType;
  } = {}) {
    const qs = buildQueryString({ ...params });
    return apiRequest<IFeedback[]>(`/feedback${qs}`, {
      method: "GET",
    });
  },

  create(payload: { locationId: string; rating: number; comment: string }) {
    return apiRequest<IFeedback>("/feedback", {
      method: "POST",
      body: payload,
    });
  },

  update(id: string, payload: { rating?: number; comment?: string }) {
    return apiRequest<IFeedback>(`/feedback/${encodeURIComponent(id)}`, {
      method: "PATCH",
      body: payload,
    });
  },

  remove(id: string) {
    return apiRequest<undefined>(`/feedback/${encodeURIComponent(id)}`, {
      method: "DELETE",
    });
  },

  moderate(id: string, payload: { status: FeedbackStatusType }) {
    return apiRequest<IFeedback>(
      `/feedback/${encodeURIComponent(id)}/moderate`,
      {
        method: "PATCH",
        body: payload,
      }
    );
  },
};

export const favoritesApi = {
  list(params: { page?: number; limit?: number } = {}) {
    const qs = buildQueryString({ ...params });
    return apiRequest<IFavoriteWithLocation[]>(`/favorites${qs}`, {
      method: "GET",
    });
  },

  add(locationId: string) {
    return apiRequest<IFavorite>(
      `/favorites/${encodeURIComponent(locationId)}`,
      {
        method: "POST",
      }
    );
  },

  remove(locationId: string) {
    return apiRequest<undefined>(
      `/favorites/${encodeURIComponent(locationId)}`,
      {
        method: "DELETE",
      }
    );
  },
};

export const routesApi = {
  discover(payload: {
    start: IRoutePoint;
    destination: IRoutePoint;
    preferences?: IRoutePreferences;
  }): Promise<IApiResponse<IRouteDiscoveryResult>> {
    return apiRequest<IRouteDiscoveryResult>("/routes/discover", {
      method: "POST",
      body: payload,
      skipAuth: true,
    });
  },
};

export const uploadsApi = {
  uploadImage(file: File) {
    const contentType =
      file.type && file.type.startsWith("image/") ? file.type : "image/png";
    return apiRequest<IUploadResult>("/uploads", {
      method: "POST",
      headers: {
        "Content-Type": contentType,
      },
      body: file,
    });
  },
};

export const adminApi = {
  listUsers(params: {
    page?: number;
    limit?: number;
    role?: UserRoleType;
    isActive?: boolean;
    search?: string;
  } = {}) {
    const qs = buildQueryString({ ...params });
    return apiRequest<IUser[]>(`/admin/users${qs}`, {
      method: "GET",
    });
  },

  updateUser(
    id: string,
    payload: { role?: UserRoleType; isActive?: boolean }
  ) {
    return apiRequest<IUser>(`/admin/users/${encodeURIComponent(id)}`, {
      method: "PATCH",
      body: payload,
    });
  },

  getAnalytics() {
    return apiRequest<IAdminAnalytics>("/admin/analytics", {
      method: "GET",
    });
  },
};
