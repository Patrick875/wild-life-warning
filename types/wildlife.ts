export interface WildlifeAlert {
  id: string;
  title: string;
  species: string;
  count?: string;
  description: string;
  location?: { lat: number | undefined; lng: number | undefined };
  submittedBy?: string;
  severity: "low" | "medium" | "high" | "critical";
  timestamp: string;
  behavior?: string;
  evidence?: AlertEvidence[];
  feedbacks?: WarningFeedback[];
  replyNumber?: number;
  rawSubmission?: WarningSubmission;
  created_at: number;
  updated_at?: number;
  user_id?: string | number;
  status?: string;
  kobo_submission_id?: string;
}

export interface WarningFeedback {
  id?: string | number;
  message: string;
  warning_id?: string | number;
  user_id?: string | number;
  submitted_by?: string;
  user?: User;
  created_at?: number;
  updated_at?: number;
  timestamp?: string | number;
}
export interface Feedback {
  id?: string | number;
  message: string;
  warning_id?: string | number;
  submitted_by?: string;
  user?: User;
  created_at: number;
  updated_at: number;
  timestamp?: string;
}

export interface AlertEvidence {
  uri?: string;
  url?: string;
  name?: string;
  mimeType?: string;
  size?: string | number;
  type?: string;
  timestamp?: string | number;
}

export type WarningSeverity = "low" | "medium" | "high" | "critical";

export interface WarningSubmissionData {
  evidence?: string | AlertEvidence[];
  location?: string;
  number_of_animals?: string | number;
  observation?: string;
  species?: string;
  threat_level?: WarningSeverity | string;
  [key: string]: unknown;
}

export interface WarningSubmission {
  id: string | number;
  created_at: number;
  updated_at: number;
  _id?: string | number;
  _submitted_by?: string;
  _submission_time?: string;
  _uuid?: string;
  submitted_at?: string | number;
  feedback_count?: number;
  feedbacks?: WarningFeedback[];
  kobo_submission_id?: string;
  status?: string;
  submission_data: WarningSubmissionData;
  user?: User;
  user_id?: string | number;
  [key: string]: unknown;
}

export interface PaginatedWarningSubmissions {
  api_results: WarningSubmission[];
  count: number;
  next: string | null;
  previous: string | null;
}

export interface ApiEnvelope<T> {
  data: T;
  message: string;
  success: boolean;
  timestamp: number;
}

export interface WildlifeObservation {
  id: string;
  species: string;
  location: string;
  timestamp: string;
  observer: string;
  count: number;
  behavior: string;
  habitat: string;
  weather: string;
  notes: string;
  images?: string[];
  coordinates?: {
    latitude: number;
    longitude: number;
  };
}

export interface User {
  id: string | number;
  email: string;
  name: string;
  full_name?: string;
  username?: string;
  phone_number?: string;
  role: "researcher" | "citizen" | "admin" | "FARMER" | string;
  occupation?: string;
  profileImage?: string;
  organization?: string;
  verified?: boolean;
  is_active?: boolean;
  is_verified?: boolean;
  createdAt: string;
  created_at?: number;
  updated_at?: number;
}

export interface APIResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
}

export interface AuthTokens {
  accessToken: string;
  refreshToken: string;
  expiresAt: number;
}

export interface LocationData {
  latitude: number;
  longitude: number;
  accuracy?: number;
  altitude?: number;
  heading?: number;
  speed?: number;
  timestamp: number;
}
