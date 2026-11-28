export const UserRole = {
  ADMIN: "admin",
  MODERATOR: "moderator",
  CONTRIBUTOR: "contributor",
  REGULAR: "regular",
} as const;

export type UserRoleType = (typeof UserRole)[keyof typeof UserRole];

export const ALL_ROLES: readonly UserRoleType[] = [
  UserRole.ADMIN,
  UserRole.MODERATOR,
  UserRole.CONTRIBUTOR,
  UserRole.REGULAR,
] as const;

export const Permissions = {
  MANAGE_USERS: "manage_users",
  MANAGE_CATEGORIES: "manage_categories",
  MANAGE_ACCESSIBILITY_DATA: "manage_accessibility_data",
  VIEW_ANALYTICS: "view_analytics",
  CONFIGURE_SYSTEM: "configure_system",
  VERIFY_LOCATIONS: "verify_locations",
  VERIFY_BARRIERS: "verify_barriers",
  MANAGE_LOCATIONS: "manage_locations",
  MANAGE_BARRIERS: "manage_barriers",
  MODERATE_FEEDBACK: "moderate_feedback",
  SUBMIT_LOCATIONS: "submit_locations",
  UPDATE_LOCATIONS: "update_locations",
  TRACK_CONTRIBUTIONS: "track_contributions",
  SEARCH_LOCATIONS: "search_locations",
  REPORT_BARRIERS: "report_barriers",
  SUBMIT_FEEDBACK: "submit_feedback",
  MANAGE_FAVORITES: "manage_favorites",
} as const;

export type PermissionType = (typeof Permissions)[keyof typeof Permissions];

export const ROLE_PERMISSIONS: Record<UserRoleType, readonly PermissionType[]> = {
  [UserRole.ADMIN]: [
    Permissions.MANAGE_USERS,
    Permissions.MANAGE_CATEGORIES,
    Permissions.MANAGE_LOCATIONS,
    Permissions.MANAGE_ACCESSIBILITY_DATA,
    Permissions.MANAGE_BARRIERS,
    Permissions.VIEW_ANALYTICS,
    Permissions.CONFIGURE_SYSTEM,
    Permissions.VERIFY_LOCATIONS,
    Permissions.VERIFY_BARRIERS,
  ],
  [UserRole.MODERATOR]: [
    Permissions.VERIFY_LOCATIONS,
    Permissions.VERIFY_BARRIERS,
    Permissions.MANAGE_LOCATIONS,
    Permissions.MANAGE_BARRIERS,
    Permissions.MODERATE_FEEDBACK,
    Permissions.SEARCH_LOCATIONS,
  ],
  [UserRole.CONTRIBUTOR]: [
    Permissions.SUBMIT_LOCATIONS,
    Permissions.UPDATE_LOCATIONS,
    Permissions.REPORT_BARRIERS,
    Permissions.TRACK_CONTRIBUTIONS,
    Permissions.SEARCH_LOCATIONS,
  ],
  [UserRole.REGULAR]: [
    Permissions.SEARCH_LOCATIONS,
    Permissions.REPORT_BARRIERS,
    Permissions.SUBMIT_FEEDBACK,
    Permissions.MANAGE_FAVORITES,
  ],
};

export function hasRolePermission(
  role: UserRoleType | undefined,
  permission: PermissionType
): boolean {
  if (!role) return false;
  return (ROLE_PERMISSIONS[role] || []).includes(permission);
}

export const LocationCategory = {
  PUBLIC_BUILDINGS: "Public Buildings",
  PARKS: "Parks",
  EDUCATIONAL_INSTITUTIONS: "Educational Institutions",
  TRANSPORTATION_FACILITIES: "Transportation Facilities",
  GOVERNMENT_OFFICES: "Government Offices",
  COMMUNITY_CENTERS: "Community Centers",
} as const;

export type LocationCategoryType =
  (typeof LocationCategory)[keyof typeof LocationCategory];

export const ALL_LOCATION_CATEGORIES: readonly LocationCategoryType[] = [
  LocationCategory.PUBLIC_BUILDINGS,
  LocationCategory.PARKS,
  LocationCategory.EDUCATIONAL_INSTITUTIONS,
  LocationCategory.TRANSPORTATION_FACILITIES,
  LocationCategory.GOVERNMENT_OFFICES,
  LocationCategory.COMMUNITY_CENTERS,
] as const;

export const VerificationStatus = {
  PENDING: "pending",
  VERIFIED: "verified",
  REJECTED: "rejected",
} as const;

export type VerificationStatusType =
  (typeof VerificationStatus)[keyof typeof VerificationStatus];

export const BarrierCategory = {
  BROKEN_FOOTPATH: "Broken Footpath",
  MISSING_RAMP: "Missing Ramp",
  BLOCKED_SIDEWALK: "Blocked Sidewalk",
  BROKEN_ELEVATOR: "Broken Elevator",
  UNSAFE_CROSSING: "Unsafe Crossing",
} as const;

export type BarrierCategoryType =
  (typeof BarrierCategory)[keyof typeof BarrierCategory];

export const ALL_BARRIER_CATEGORIES: readonly BarrierCategoryType[] = [
  BarrierCategory.BROKEN_FOOTPATH,
  BarrierCategory.MISSING_RAMP,
  BarrierCategory.BLOCKED_SIDEWALK,
  BarrierCategory.BROKEN_ELEVATOR,
  BarrierCategory.UNSAFE_CROSSING,
] as const;

export const BarrierStatus = {
  PENDING: "pending",
  VERIFIED: "verified",
  REJECTED: "rejected",
  RESOLVED: "resolved",
} as const;

export type BarrierStatusType =
  (typeof BarrierStatus)[keyof typeof BarrierStatus];

export const ALL_BARRIER_STATUSES: readonly BarrierStatusType[] = [
  BarrierStatus.PENDING,
  BarrierStatus.VERIFIED,
  BarrierStatus.REJECTED,
  BarrierStatus.RESOLVED,
] as const;

export const FeedbackStatus = {
  ACTIVE: "active",
  HIDDEN: "hidden",
} as const;

export type FeedbackStatusType =
  (typeof FeedbackStatus)[keyof typeof FeedbackStatus];

export interface IGeoPoint {
  type: "Point";
  coordinates: [number, number];
}

export interface IAccessibilityFeatures {
  wheelchairAccess: boolean;
  rampAvailability: boolean;
  elevatorAvailability: boolean;
  accessibleRestroom: boolean;
  accessibleParking: boolean;
  stairFreeEntry: boolean;
  doorAccessibility: boolean;
}

export interface IPaginationMeta {
  page: number;
  limit: number;
  totalRecords: number;
  totalPages: number;
  hasNextPage: boolean;
  hasPrevPage: boolean;
}

export interface IApiResponse<T = unknown> {
  success: boolean;
  statusCode: number;
  message: string;
  data?: T;
  meta?: IPaginationMeta;
}

export interface IApiErrorResponse {
  success: false;
  statusCode: number;
  message: string;
  errors?: unknown;
}

export interface IUser {
  id: string;
  name: string;
  email: string;
  role: UserRoleType;
  isActive: boolean;
  tokenVersion: number;
  createdAt: string;
  updatedAt: string;
}

export interface IAuthSession {
  user: IUser;
  accessToken: string;
  refreshToken: string;
}

export interface IAuthTokens {
  accessToken: string;
  refreshToken: string;
}

export interface ILocation {
  id: string;
  name: string;
  description: string;
  address: string;
  coordinates: {
    latitude: number;
    longitude: number;
  };
  location: IGeoPoint;
  category: LocationCategoryType;
  accessibilityScore: number;
  accessibilityFeatures: IAccessibilityFeatures;
  photos: string[];
  verificationStatus: VerificationStatusType;
  isVerified: boolean;
  rejectionReason?: string;
  submittedBy: string;
  verifiedBy?: string;
  verifiedAt?: string;
  distanceMeters?: number;
  createdAt: string;
  updatedAt: string;
}

export interface IBarrier {
  id: string;
  category: BarrierCategoryType;
  description: string;
  imageUrl?: string;
  coordinates: {
    latitude: number;
    longitude: number;
  };
  location: IGeoPoint;
  reportedBy: string;
  status: BarrierStatusType;
  isVerified: boolean;
  rejectionReason?: string;
  verifiedBy?: string;
  verifiedAt?: string;
  resolvedBy?: string;
  resolvedAt?: string;
  distanceMeters?: number;
  createdAt: string;
  updatedAt: string;
}

export interface IFeedback {
  id: string;
  locationId: string;
  userId: string;
  rating: number;
  comment: string;
  status: FeedbackStatusType;
  moderatedBy?: string;
  moderatedAt?: string;
  createdAt: string;
  updatedAt: string;
}

export interface IFavorite {
  id: string;
  userId: string;
  locationId: string;
  createdAt: string;
}

export interface IFavoriteWithLocation {
  favoriteId: string;
  savedAt: string;
  location: ILocation;
}

export interface IRoutePoint {
  latitude: number;
  longitude: number;
}

export interface IRoutePreferences {
  wheelchairFriendly?: boolean;
  requireRamp?: boolean;
  requireElevator?: boolean;
  avoidUnverified?: boolean;
}

export interface IRouteBarrierSummary {
  id: string;
  category: BarrierCategoryType;
  description: string;
  status: BarrierStatusType;
  isVerified: boolean;
  coordinates: IRoutePoint;
  distanceFromRouteMeters: number;
}

export interface IRouteOption {
  routeId: string;
  name: string;
  waypoints: IRoutePoint[];
  distanceMeters: number;
  estimatedTravelMinutes: number;
  accessibilityScore: number;
  isRecommended: boolean;
  barriers: IRouteBarrierSummary[];
  warnings: string[];
  positiveFeatures: string[];
}

export interface IRouteDiscoveryResult {
  start: IRoutePoint;
  destination: IRoutePoint;
  routes: IRouteOption[];
}

export interface IUploadResult {
  url: string;
  mimeType: string;
  sizeBytes: number;
}

export interface IAdminAnalytics {
  summary: {
    totalLocations: number;
    verifiedLocations: number;
    pendingLocations: number;
    rejectedLocations: number;
    totalBarrierReports: number;
    verifiedReports: number;
    pendingReports: number;
    resolvedReports: number;
    rejectedReports: number;
    totalFeedbackRecords: number;
  };
  accessibilityCategoryDistribution: Array<{
    category: LocationCategoryType;
    count: number;
    avgAccessibilityScore: number;
  }>;
  barrierCategoryDistribution: Array<{
    category: BarrierCategoryType;
    count: number;
  }>;
  mostReportedAreas: Array<{
    latitude: number;
    longitude: number;
    reportCount: number;
  }>;
  monthlyReportTrends: Array<{
    month: string;
    count: number;
  }>;
  communityContributionStats: {
    usersByRole: Array<{ role: UserRoleType; count: number }>;
    topLocationContributors: Array<{ userId: string; locationsSubmitted: number }>;
    topBarrierReporters: Array<{ userId: string; barriersReported: number }>;
  };
}
