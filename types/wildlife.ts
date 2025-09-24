export interface WildlifeAlert {
  id: string;
  title: string;
  species: string;
  description: string;
  location: string;
  severity: 'low' | 'medium' | 'high';
  timestamp: string;
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
  role: 'researcher' | 'citizen' | 'admin';
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