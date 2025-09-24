import { WildlifeAlert, WildlifeObservation } from '@/types/wildlife';
import axios from 'axios';

const BASE_URL = "https://kf.kobotoolbox.org/api/v2/assets";
const TOKEN = "0c53a2d248e9d75499e8b4b149e32fd86c2c121e";

export const fetchKoboFormStructure = async (formUid: string) => {
  const response = await axios.get(`${BASE_URL}/${formUid}/`, {
		headers: {
			Authorization: `Token ${TOKEN}`,
			Accept: "application/json",
			"Content-Type": "application/json",
		},
	});

  if (!response.data) {
    throw new Error('Failed to fetch form structure');
  }

  const data= response.data;
  return data.content.survey; // array of questions
};


// Mock data for development
const mockAlerts: WildlifeAlert[] = [
  {
    id: '1',
    title: 'Bear Activity Reported',
    species: 'Black Bear',
    description: 'Multiple bear sightings reported near hiking trails. Visitors advised to maintain safe distance and secure food items.',
    location: 'Yellowstone National Park - Trail Section B',
    severity: 'high',
    timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(), // 2 hours ago
  },
  {
    id: '2',
    title: 'Wolf Pack Migration',
    species: 'Gray Wolf',
    description: 'Wolf pack spotted moving through the valley. This is part of their seasonal migration pattern.',
    location: 'Northern Forest Reserve',
    severity: 'medium',
    timestamp: new Date(Date.now() - 6 * 60 * 60 * 1000).toISOString(), // 6 hours ago
  },
  {
    id: '3',
    title: 'Rare Bird Sighting',
    species: 'Golden Eagle',
    description: 'Golden Eagle observed nesting in the canyon area. Protected species - maintain minimum 500m distance.',
    location: 'Canyon View Point',
    severity: 'low',
    timestamp: new Date(Date.now() - 12 * 60 * 60 * 1000).toISOString(), // 12 hours ago
  },
  {
    id: '4',
    title: 'Deer Crossing Alert',
    species: 'White-tailed Deer',
    description: 'Increased deer activity on main access road during dawn and dusk hours. Drive carefully.',
    location: 'Park Entrance Road',
    severity: 'medium',
    timestamp: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString(), // 1 day ago
  }
];

class WildlifeAPI {
  private baseUrl = 'https://api.wildtracker.com/v1';

  // Simulate network delay
  private delay(ms: number) {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  async getAlerts(): Promise<WildlifeAlert[]> {
    await this.delay(500); // Simulate network delay
    
    // In a real app, this would be an HTTP request:
    // const response = await fetch(`${this.baseUrl}/alerts`);
    // return response.json();
    
    return mockAlerts;
  }

  async submitObservation(observation: any): Promise<{ success: boolean; id: string }> {
    await this.delay(1000); // Simulate network delay
    
    // In a real app, this would be an HTTP POST request:
    // const response = await fetch(`${this.baseUrl}/observations`, {
    //   method: 'POST',
    //   headers: {
    //     'Content-Type': 'application/json',
    //     'Authorization': `Bearer ${authToken}`,
    //   },
    //   body: JSON.stringify(observation),
    // });
    // return response.json();
    
    console.log('Submitting observation:', observation);
    
    return {
      success: true,
      id: `obs_${Date.now()}`,
    };
  }

  async getObservations(): Promise<WildlifeObservation[]> {
    await this.delay(500);
    
    // Mock data - in real app would fetch from server
    return [
      {
        id: '1',
        species: 'Red Deer',
        location: 'Highland Forest',
        timestamp: new Date().toISOString(),
        observer: 'user123',
        count: 3,
        behavior: 'Grazing',
        habitat: 'Forest clearing',
        weather: 'Sunny',
        notes: 'Healthy looking herd, including one young deer',
      },
    ];
  }

  async authenticate(email: string, password: string): Promise<{ token: string; user: any }> {
    await this.delay(1000);
    
    // Mock authentication - in real app would validate credentials
    if (email && password) {
      return {
        token: 'mock_jwt_token',
        user: {
          id: 'user123',
          email,
          name: 'Wildlife Researcher',
          role: 'researcher',
        },
      };
    }
    
    throw new Error('Invalid credentials');
  }

  async register(userData: {
    name: string;
    email: string;
    password: string;
  }): Promise<{ success: boolean; user: any }> {
    await this.delay(1000);
    
    // Mock registration
    return {
      success: true,
      user: {
        id: `user_${Date.now()}`,
        email: userData.email,
        name: userData.name,
        role: 'researcher',
      },
    };
  }

  async resetPassword(email: string): Promise<{ success: boolean }> {
    await this.delay(1000);
    
    // Mock password reset
    console.log(`Password reset requested for: ${email}`);
    
    return { success: true };
  }
}

export const wildlifeApi = new WildlifeAPI();
