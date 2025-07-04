import axios from 'axios';
import { WeatherData, WeatherForecast, DailyForecast, WeatherError } from './types.js';

// Open-Meteo API响应类型
interface OpenMeteoCurrentResponse {
  latitude: number;
  longitude: number;
  generationtime_ms: number;
  utc_offset_seconds: number;
  timezone: string;
  timezone_abbreviation: string;
  elevation: number;
  current_units: {
    time: string;
    interval: string;
    temperature_2m: string;
    relative_humidity_2m: string;
    apparent_temperature: string;
    is_day: string;
    precipitation: string;
    rain: string;
    showers: string;
    snowfall: string;
    weather_code: string;
    cloud_cover: string;
    pressure_msl: string;
    surface_pressure: string;
    wind_speed_10m: string;
    wind_direction_10m: string;
    wind_gusts_10m: string;
  };
  current: {
    time: string;
    interval: number;
    temperature_2m: number;
    relative_humidity_2m: number;
    apparent_temperature: number;
    is_day: number;
    precipitation: number;
    rain: number;
    showers: number;
    snowfall: number;
    weather_code: number;
    cloud_cover: number;
    pressure_msl: number;
    surface_pressure: number;
    wind_speed_10m: number;
    wind_direction_10m: number;
    wind_gusts_10m: number;
  };
}

interface OpenMeteoForecastResponse {
  latitude: number;
  longitude: number;
  generationtime_ms: number;
  utc_offset_seconds: number;
  timezone: string;
  timezone_abbreviation: string;
  elevation: number;
  current_units: any;
  current: any;
  daily_units: {
    time: string;
    weather_code: string;
    temperature_2m_max: string;
    temperature_2m_min: string;
    apparent_temperature_max: string;
    apparent_temperature_min: string;
    sunrise: string;
    sunset: string;
    uv_index_max: string;
    precipitation_sum: string;
    rain_sum: string;
    showers_sum: string;
    snowfall_sum: string;
    precipitation_hours: string;
    precipitation_probability_max: string;
    wind_speed_10m_max: string;
    wind_gusts_10m_max: string;
    wind_direction_10m_dominant: string;
    shortwave_radiation_sum: string;
  };
  daily: {
    time: string[];
    weather_code: number[];
    temperature_2m_max: number[];
    temperature_2m_min: number[];
    apparent_temperature_max: number[];
    apparent_temperature_min: number[];
    sunrise: string[];
    sunset: string[];
    uv_index_max: number[];
    precipitation_sum: number[];
    rain_sum: number[];
    showers_sum: number[];
    snowfall_sum: number[];
    precipitation_hours: number[];
    precipitation_probability_max: number[];
    wind_speed_10m_max: number[];
    wind_gusts_10m_max: number[];
    wind_direction_10m_dominant: number[];
    shortwave_radiation_sum: number[];
  };
}

interface GeocodingResponse {
  results?: Array<{
    id: number;
    name: string;
    latitude: number;
    longitude: number;
    elevation: number;
    feature_code: string;
    country_code: string;
    admin1_id: number;
    admin2_id: number;
    admin3_id: number;
    admin4_id: number;
    timezone: string;
    population: number;
    country_id: number;
    country: string;
    admin1: string;
    admin2: string;
    admin3: string;
    admin4: string;
  }>;
  generationtime_ms: number;
}

export class WeatherService {
  private readonly baseUrl = 'https://api.open-meteo.com/v1';
  private readonly geocodingUrl = 'https://geocoding-api.open-meteo.com/v1';

  constructor() {
    // 使用Open-Meteo免费API，无需API密钥
  }

  /**
   * 获取当前天气信息
   */
  async getCurrentWeather(latitude: number, longitude: number): Promise<WeatherData> {
    try {
      const response = await axios.get<OpenMeteoCurrentResponse>(`${this.baseUrl}/forecast`, {
        params: {
          latitude,
          longitude,
          current: [
            'temperature_2m',
            'relative_humidity_2m',
            'apparent_temperature',
            'is_day',
            'precipitation',
            'weather_code',
            'cloud_cover',
            'pressure_msl',
            'wind_speed_10m',
            'wind_direction_10m'
          ].join(','),
          timezone: 'auto'
        }
      });

      return this.formatCurrentWeather(response.data, latitude, longitude);
    } catch (error) {
      if (axios.isAxiosError(error)) {
        const message = error.response?.data?.reason || error.message;
        throw new WeatherError(`获取当前天气失败: ${message}`, 'API_ERROR');
      }
      throw new WeatherError(`获取当前天气失败: ${error instanceof Error ? error.message : '未知错误'}`, 'UNKNOWN_ERROR');
    }
  }

  /**
   * 获取天气预报（包含当前天气和未来几天预报）
   */
  async getWeatherForecast(latitude: number, longitude: number, days: number = 5): Promise<WeatherForecast> {
    try {
      const forecastDays = Math.min(Math.max(days, 1), 16); // Open-Meteo支持最多16天预报
      
      const response = await axios.get<OpenMeteoForecastResponse>(`${this.baseUrl}/forecast`, {
        params: {
          latitude,
          longitude,
          current: [
            'temperature_2m',
            'relative_humidity_2m',
            'apparent_temperature',
            'is_day',
            'precipitation',
            'weather_code',
            'cloud_cover',
            'pressure_msl',
            'wind_speed_10m',
            'wind_direction_10m'
          ].join(','),
          daily: [
            'weather_code',
            'temperature_2m_max',
            'temperature_2m_min',
            'uv_index_max',
            'precipitation_sum',
            'precipitation_probability_max',
            'wind_speed_10m_max',
            'wind_direction_10m_dominant'
          ].join(','),
          timezone: 'auto',
          forecast_days: forecastDays
        }
      });

      return this.formatWeatherForecast(response.data);
    } catch (error) {
      if (axios.isAxiosError(error)) {
        const message = error.response?.data?.reason || error.message;
        throw new WeatherError(`获取天气预报失败: ${message}`, 'API_ERROR');
      }
      throw new WeatherError(`获取天气预报失败: ${error instanceof Error ? error.message : '未知错误'}`, 'UNKNOWN_ERROR');
    }
  }

  /**
   * 根据地址获取天气信息
   */
  async getWeatherByAddress(address: string): Promise<WeatherData> {
    try {
      const location = await this.geocodeAddress(address);
      return await this.getCurrentWeather(location.latitude, location.longitude);
    } catch (error) {
      if (error instanceof WeatherError) {
        throw error;
      }
      throw new WeatherError(`获取天气信息失败: ${error instanceof Error ? error.message : '未知错误'}`, 'UNKNOWN_ERROR');
    }
  }

  /**
   * 根据地址获取天气预报
   */
  async getForecastByAddress(address: string, days: number = 5): Promise<WeatherForecast> {
    try {
      const location = await this.geocodeAddress(address);
      return await this.getWeatherForecast(location.latitude, location.longitude, days);
    } catch (error) {
      if (error instanceof WeatherError) {
        throw error;
      }
      throw new WeatherError(`获取天气预报失败: ${error instanceof Error ? error.message : '未知错误'}`, 'UNKNOWN_ERROR');
    }
  }

  /**
   * 地址解析
   */
  private async geocodeAddress(address: string): Promise<{latitude: number, longitude: number, name: string}> {
    try {
      const response = await axios.get<GeocodingResponse>(`${this.geocodingUrl}/search`, {
        params: {
          name: address,
          count: 1,
          language: 'zh,en',
          format: 'json'
        }
      });

      if (!response.data.results || response.data.results.length === 0) {
        throw new WeatherError(`无法找到地址: ${address}`, 'ADDRESS_NOT_FOUND');
      }

      const result = response.data.results[0];
      return {
        latitude: result.latitude,
        longitude: result.longitude,
        name: `${result.name}, ${result.admin1 || ''}, ${result.country}`.replace(/, ,/g, ',').replace(/,$/, '')
      };
    } catch (error) {
      if (error instanceof WeatherError) {
        throw error;
      }
      throw new WeatherError(`地址解析失败: ${error instanceof Error ? error.message : '未知错误'}`, 'GEOCODING_ERROR');
    }
  }

  /**
   * 格式化当前天气数据
   */
  private formatCurrentWeather(data: OpenMeteoCurrentResponse, lat: number, lon: number): WeatherData {
    const { current, timezone } = data;
    
    return {
      location: `${lat.toFixed(4)}, ${lon.toFixed(4)}`,
      temperature: Math.round(current.temperature_2m),
      description: this.getWeatherDescription(current.weather_code, current.is_day),
      humidity: current.relative_humidity_2m,
      windSpeed: Math.round(current.wind_speed_10m),
      windDirection: this.getWindDirection(current.wind_direction_10m),
      pressure: Math.round(current.pressure_msl),
      visibility: 10, // Open-Meteo不提供能见度数据，使用默认值
      uvIndex: 0, // 当前天气不包含UV指数
      feelsLike: Math.round(current.apparent_temperature),
      timestamp: new Date(current.time).toLocaleString('zh-CN', {
        timeZone: timezone,
        year: 'numeric',
        month: '2-digit',
        day: '2-digit',
        hour: '2-digit',
        minute: '2-digit'
      })
    };
  }

  /**
   * 格式化天气预报数据
   */
  private formatWeatherForecast(data: OpenMeteoForecastResponse): WeatherForecast {
    const current = this.formatCurrentWeather(data, data.latitude, data.longitude);
    const forecast: DailyForecast[] = [];

    if (data.daily) {
      for (let i = 0; i < data.daily.time.length; i++) {
        forecast.push({
          date: data.daily.time[i],
          high: Math.round(data.daily.temperature_2m_max[i]),
          low: Math.round(data.daily.temperature_2m_min[i]),
          description: this.getWeatherDescription(data.daily.weather_code[i], 1),
          humidity: 50, // Open-Meteo日预报不提供湿度，使用默认值
          windSpeed: Math.round(data.daily.wind_speed_10m_max[i]),
          chanceOfRain: Math.round(data.daily.precipitation_probability_max[i] || 0)
        });
      }
    }

    return {
      location: current.location,
      current,
      forecast
    };
  }

  /**
   * 根据天气代码获取天气描述
   */
  private getWeatherDescription(weatherCode: number, isDay: number): string {
    const weatherCodes: { [key: number]: { day: string; night: string } } = {
      0: { day: '晴朗', night: '晴朗' },
      1: { day: '主要晴朗', night: '主要晴朗' },
      2: { day: '部分多云', night: '部分多云' },
      3: { day: '阴天', night: '阴天' },
      45: { day: '雾', night: '雾' },
      48: { day: '雾凇', night: '雾凇' },
      51: { day: '小毛毛雨', night: '小毛毛雨' },
      53: { day: '中毛毛雨', night: '中毛毛雨' },
      55: { day: '大毛毛雨', night: '大毛毛雨' },
      56: { day: '小冻毛毛雨', night: '小冻毛毛雨' },
      57: { day: '大冻毛毛雨', night: '大冻毛毛雨' },
      61: { day: '小雨', night: '小雨' },
      63: { day: '中雨', night: '中雨' },
      65: { day: '大雨', night: '大雨' },
      66: { day: '小冻雨', night: '小冻雨' },
      67: { day: '大冻雨', night: '大冻雨' },
      71: { day: '小雪', night: '小雪' },
      73: { day: '中雪', night: '中雪' },
      75: { day: '大雪', night: '大雪' },
      77: { day: '雪粒', night: '雪粒' },
      80: { day: '小阵雨', night: '小阵雨' },
      81: { day: '中阵雨', night: '中阵雨' },
      82: { day: '大阵雨', night: '大阵雨' },
      85: { day: '小阵雪', night: '小阵雪' },
      86: { day: '大阵雪', night: '大阵雪' },
      95: { day: '雷暴', night: '雷暴' },
      96: { day: '雷暴伴小冰雹', night: '雷暴伴小冰雹' },
      99: { day: '雷暴伴大冰雹', night: '雷暴伴大冰雹' }
    };

    const weather = weatherCodes[weatherCode];
    if (!weather) {
      return '未知天气';
    }

    return isDay ? weather.day : weather.night;
  }

  /**
   * 根据风向角度获取风向描述
   */
  private getWindDirection(degrees: number): string {
    const directions = [
      '北', '北北东', '东北', '东北东',
      '东', '东南东', '东南', '南南东',
      '南', '南南西', '西南', '西南西',
      '西', '西北西', '西北', '北北西'
    ];
    
    const index = Math.round(degrees / 22.5) % 16;
    return directions[index];
  }

  /**
   * 格式化天气数据为易读的文本
   */
  formatWeatherText(weather: WeatherData): string {
    return `
📍 位置: ${weather.location}
🌡️ 温度: ${weather.temperature}°C (体感温度: ${weather.feelsLike}°C)
🌤️ 天气: ${weather.description}
💧 湿度: ${weather.humidity}%
💨 风速: ${weather.windSpeed} km/h (${weather.windDirection})
🌡️ 气压: ${weather.pressure} hPa
🕐 更新时间: ${weather.timestamp}
    `.trim();
  }

  /**
   * 格式化天气预报为易读的文本
   */
  formatForecastText(forecast: WeatherForecast): string {
    let text = `📍 ${forecast.location} 天气预报\n\n`;
    
    // 当前天气
    text += `🌟 当前天气:\n`;
    text += `温度: ${forecast.current.temperature}°C (体感: ${forecast.current.feelsLike}°C)\n`;
    text += `天气: ${forecast.current.description}\n`;
    text += `湿度: ${forecast.current.humidity}% | 风速: ${forecast.current.windSpeed} km/h\n\n`;
    
    // 未来几天预报
    text += `📅 未来几天预报:\n`;
    forecast.forecast.forEach((day, index) => {
      const date = new Date(day.date);
      const dayName = index === 0 ? '今天' : 
                     index === 1 ? '明天' : 
                     date.toLocaleDateString('zh-CN', { weekday: 'long' });
      
      text += `${dayName} (${day.date}):\n`;
      text += `  🌡️ ${day.low}°C ~ ${day.high}°C | ${day.description}\n`;
      text += `  💨 风速: ${day.windSpeed} km/h | 🌧️ 降雨概率: ${day.chanceOfRain}%\n\n`;
    });
    
    return text.trim();
  }

  /**
   * 获取天气建议
   */
  getWeatherAdvice(weather: WeatherData): string {
    const advice: string[] = [];
    
    if (weather.temperature < 0) {
      advice.push('🧥 天气寒冷，请注意保暖，穿厚外套');
    } else if (weather.temperature < 10) {
      advice.push('🧥 天气较冷，建议穿外套');
    } else if (weather.temperature > 30) {
      advice.push('🌞 天气炎热，注意防暑降温，多喝水');
    } else if (weather.temperature > 25) {
      advice.push('☀️ 天气较热，穿轻便衣物');
    }
    
    if (weather.humidity > 80) {
      advice.push('💧 湿度较高，感觉可能比较闷热');
    } else if (weather.humidity < 30) {
      advice.push('🏜️ 湿度较低，注意补水保湿');
    }
    
    if (weather.windSpeed > 30) {
      advice.push('💨 风力较大，外出注意安全');
    }
    
    if (weather.description.includes('雨')) {
      advice.push('🌧️ 有降雨，记得带伞');
    }
    
    if (weather.description.includes('雪')) {
      advice.push('❄️ 有降雪，注意保暖和路面湿滑');
    }
    
    if (weather.description.includes('雾')) {
      advice.push('🌫️ 有雾，驾驶时请小心');
    }
    
    return advice.length > 0 ? advice.join('\n') : '天气条件良好，适合外出活动';
  }
} 