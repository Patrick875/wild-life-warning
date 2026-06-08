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
  rawSubmission?: Record<string, any>;
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
  id: string;
  email: string;
  name: string;
  role: "researcher" | "citizen" | "admin";
  profileImage?: string;
  organization?: string;
  verified: boolean;
  createdAt: string;
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
