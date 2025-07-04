import axios from 'axios';
import { LocationData, GeocodingResult, LocationError } from './types.js';

export class LocationService {
  private readonly ipApiUrl = 'http://ip-api.com/json/';
  private readonly geocodingUrl = 'https://geocoding-api.open-meteo.com/v1';

  constructor() {
    // 使用免费API，无需密钥
  }

  /**
   * 根据地址获取地理坐标
   */
  async geocodeAddress(address: string): Promise<GeocodingResult> {
    try {
      const response = await axios.get(this.geocodingUrl + '/search', {
        params: {
          name: address,
          count: 1,
          language: 'zh,en',
          format: 'json'
        }
      });

      if (!response.data.results || response.data.results.length === 0) {
        throw new LocationError(`无法找到地址: ${address}`, 'ADDRESS_NOT_FOUND');
      }

      const result = response.data.results[0];

      return {
        address: `${result.name}, ${result.admin1 || ''}, ${result.country}`.replace(/, ,/g, ',').replace(/,$/, ''),
        latitude: result.latitude,
        longitude: result.longitude,
        city: result.name,
        country: result.country,
        confidence: 0.9 // Open-Meteo不提供置信度，使用默认值
      };
    } catch (error) {
      if (error instanceof LocationError) {
        throw error;
      }
      throw new LocationError(`地址解析失败: ${error instanceof Error ? error.message : '未知错误'}`, 'GEOCODING_ERROR');
    }
  }

  /**
   * 获取当前IP地址的大致位置
   */
  async getCurrentLocation(): Promise<LocationData> {
    try {
      const response = await axios.get(this.ipApiUrl, {
        params: {
          fields: 'status,message,country,city,lat,lon,timezone,query'
        }
      });

      if (response.data.status === 'fail') {
        throw new LocationError(`获取当前位置失败: ${response.data.message}`, 'IP_LOCATION_ERROR');
      }

      const data = response.data;
      return {
        address: `${data.city}, ${data.country}`,
        latitude: data.lat,
        longitude: data.lon,
        city: data.city,
        country: data.country,
        timezone: data.timezone
      };
    } catch (error) {
      if (error instanceof LocationError) {
        throw error;
      }
      throw new LocationError(`获取当前位置失败: ${error instanceof Error ? error.message : '未知错误'}`, 'IP_LOCATION_ERROR');
    }
  }

  /**
   * 反向地理编码：根据坐标获取地址
   */
  async reverseGeocode(latitude: number, longitude: number): Promise<string> {
    try {
      const response = await axios.get(this.geocodingUrl + '/reverse', {
        params: {
          lat: latitude,
          lon: longitude,
          language: 'zh,en',
          format: 'json'
        }
      });

      if (response.data.results && response.data.results.length > 0) {
        const result = response.data.results[0];
        return `${result.name}, ${result.admin1 || ''}, ${result.country}`.replace(/, ,/g, ',').replace(/,$/, '');
      }

      return `${latitude}, ${longitude}`;
    } catch (error) {
      console.warn('反向地理编码失败:', error);
      return `${latitude}, ${longitude}`;
    }
  }

  /**
   * 验证坐标是否有效
   */
  validateCoordinates(latitude: number, longitude: number): boolean {
    return (
      latitude >= -90 && latitude <= 90 &&
      longitude >= -180 && longitude <= 180
    );
  }

  /**
   * 计算两点之间的距离（公里）
   */
  calculateDistance(lat1: number, lon1: number, lat2: number, lon2: number): number {
    const R = 6371; // 地球半径（公里）
    const dLat = this.toRadians(lat2 - lat1);
    const dLon = this.toRadians(lon2 - lon1);
    const a = 
      Math.sin(dLat/2) * Math.sin(dLat/2) +
      Math.cos(this.toRadians(lat1)) * Math.cos(this.toRadians(lat2)) * 
      Math.sin(dLon/2) * Math.sin(dLon/2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
    return R * c;
  }

  private toRadians(degrees: number): number {
    return degrees * (Math.PI / 180);
  }
} 