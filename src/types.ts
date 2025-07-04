// 天气相关类型定义
export interface WeatherData {
  location: string;
  temperature: number;
  description: string;
  humidity: number;
  windSpeed: number;
  windDirection: string;
  pressure: number;
  visibility: number;
  uvIndex: number;
  feelsLike: number;
  timestamp: string;
}

export interface WeatherForecast {
  location: string;
  current: WeatherData;
  forecast: DailyForecast[];
}

export interface DailyForecast {
  date: string;
  high: number;
  low: number;
  description: string;
  humidity: number;
  windSpeed: number;
  chanceOfRain: number;
}

// 位置相关类型定义
export interface LocationData {
  address: string;
  latitude: number;
  longitude: number;
  city: string;
  country: string;
  timezone: string;
}

export interface GeocodingResult {
  address: string;
  latitude: number;
  longitude: number;
  city: string;
  country: string;
  confidence: number;
}

// API响应类型
export interface WeatherAPIResponse {
  location: {
    name: string;
    region: string;
    country: string;
    lat: number;
    lon: number;
    tz_id: string;
    localtime: string;
  };
  current: {
    temp_c: number;
    temp_f: number;
    condition: {
      text: string;
      icon: string;
    };
    wind_mph: number;
    wind_kph: number;
    wind_dir: string;
    pressure_mb: number;
    pressure_in: number;
    humidity: number;
    cloud: number;
    feelslike_c: number;
    feelslike_f: number;
    vis_km: number;
    vis_miles: number;
    uv: number;
  };
  forecast?: {
    forecastday: Array<{
      date: string;
      day: {
        maxtemp_c: number;
        mintemp_c: number;
        condition: {
          text: string;
          icon: string;
        };
        avghumidity: number;
        maxwind_kph: number;
        daily_chance_of_rain: number;
      };
    }>;
  };
}

// 错误类型
export class WeatherError extends Error {
  constructor(message: string, public code?: string) {
    super(message);
    this.name = 'WeatherError';
  }
}

export class LocationError extends Error {
  constructor(message: string, public code?: string) {
    super(message);
    this.name = 'LocationError';
  }
} 