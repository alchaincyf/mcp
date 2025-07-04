#!/usr/bin/env node

import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import { z } from "zod";
import { WeatherService } from './weather-service.js';
import { LocationService } from './location-service.js';
import { WeatherError, LocationError } from './types.js';

// 创建MCP服务器
const server = new McpServer({
  name: "weather-mcp-server",
  version: "1.0.0"
});

// 初始化服务（无需API密钥）
const weatherService = new WeatherService();
const locationService = new LocationService();

// 工具1: 根据地址获取当前天气
server.registerTool(
  "get-weather-by-address",
  {
    title: "根据地址获取天气",
    description: "根据提供的地址获取当前天气信息",
    inputSchema: {
      address: z.string().describe("地址，例如：北京市、上海市浦东新区、New York等")
    }
  },
  async ({ address }) => {
    try {
      const weather = await weatherService.getWeatherByAddress(address);
      const weatherText = weatherService.formatWeatherText(weather);
      const advice = weatherService.getWeatherAdvice(weather);
      
      return {
        content: [{
          type: "text",
          text: `${weatherText}\n\n💡 建议:\n${advice}`
        }]
      };
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : '未知错误';
      return {
        content: [{
          type: "text",
          text: `❌ 获取天气信息失败: ${errorMessage}`
        }],
        isError: true
      };
    }
  }
);

// 工具2: 根据地址获取天气预报
server.registerTool(
  "get-forecast-by-address",
  {
    title: "根据地址获取天气预报",
    description: "根据提供的地址获取未来几天的天气预报",
    inputSchema: {
      address: z.string().describe("地址，例如：北京市、上海市浦东新区、New York等"),
      days: z.number().min(1).max(10).default(5).describe("预报天数，1-10天，默认5天")
    }
  },
  async ({ address, days = 5 }) => {
    try {
      const forecast = await weatherService.getForecastByAddress(address, days);
      const forecastText = weatherService.formatForecastText(forecast);
      const advice = weatherService.getWeatherAdvice(forecast.current);
      
      return {
        content: [{
          type: "text",
          text: `${forecastText}\n\n💡 当前天气建议:\n${advice}`
        }]
      };
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : '未知错误';
      return {
        content: [{
          type: "text",
          text: `❌ 获取天气预报失败: ${errorMessage}`
        }],
        isError: true
      };
    }
  }
);

// 工具3: 获取当前位置的天气
server.registerTool(
  "get-current-location-weather",
  {
    title: "获取当前位置天气",
    description: "根据IP地址获取当前位置的天气信息",
    inputSchema: {}
  },
  async () => {
    try {
      const location = await locationService.getCurrentLocation();
      const weather = await weatherService.getCurrentWeather(location.latitude, location.longitude);
      const weatherText = weatherService.formatWeatherText(weather);
      const advice = weatherService.getWeatherAdvice(weather);
      
      return {
        content: [{
          type: "text",
          text: `🌍 检测到您的位置: ${location.address}\n\n${weatherText}\n\n💡 建议:\n${advice}`
        }]
      };
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : '未知错误';
      return {
        content: [{
          type: "text",
          text: `❌ 获取当前位置天气失败: ${errorMessage}`
        }],
        isError: true
      };
    }
  }
);

// 工具4: 获取当前位置的天气预报
server.registerTool(
  "get-current-location-forecast",
  {
    title: "获取当前位置天气预报",
    description: "根据IP地址获取当前位置的天气预报",
    inputSchema: {
      days: z.number().min(1).max(10).default(5).describe("预报天数，1-10天，默认5天")
    }
  },
  async ({ days = 5 }) => {
    try {
      const location = await locationService.getCurrentLocation();
      const forecast = await weatherService.getWeatherForecast(location.latitude, location.longitude, days);
      const forecastText = weatherService.formatForecastText(forecast);
      const advice = weatherService.getWeatherAdvice(forecast.current);
      
      return {
        content: [{
          type: "text",
          text: `🌍 检测到您的位置: ${location.address}\n\n${forecastText}\n\n💡 当前天气建议:\n${advice}`
        }]
      };
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : '未知错误';
      return {
        content: [{
          type: "text",
          text: `❌ 获取当前位置天气预报失败: ${errorMessage}`
        }],
        isError: true
      };
    }
  }
);

// 工具5: 根据坐标获取天气
server.registerTool(
  "get-weather-by-coordinates",
  {
    title: "根据坐标获取天气",
    description: "根据经纬度坐标获取天气信息",
    inputSchema: {
      latitude: z.number().min(-90).max(90).describe("纬度，-90到90之间"),
      longitude: z.number().min(-180).max(180).describe("经度，-180到180之间")
    }
  },
  async ({ latitude, longitude }) => {
    try {
      if (!locationService.validateCoordinates(latitude, longitude)) {
        throw new Error('无效的坐标');
      }
      
      const weather = await weatherService.getCurrentWeather(latitude, longitude);
      const weatherText = weatherService.formatWeatherText(weather);
      const advice = weatherService.getWeatherAdvice(weather);
      
      return {
        content: [{
          type: "text",
          text: `📍 坐标: ${latitude}, ${longitude}\n\n${weatherText}\n\n💡 建议:\n${advice}`
        }]
      };
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : '未知错误';
      return {
        content: [{
          type: "text",
          text: `❌ 获取天气信息失败: ${errorMessage}`
        }],
        isError: true
      };
    }
  }
);

// 工具6: 地址解析
server.registerTool(
  "geocode-address",
  {
    title: "地址解析",
    description: "将地址转换为经纬度坐标",
    inputSchema: {
      address: z.string().describe("要解析的地址")
    }
  },
  async ({ address }) => {
    try {
      const result = await locationService.geocodeAddress(address);
      
      return {
        content: [{
          type: "text",
          text: `📍 地址解析结果:\n\n原地址: ${address}\n标准地址: ${result.address}\n坐标: ${result.latitude}, ${result.longitude}\n城市: ${result.city}\n国家: ${result.country}\n置信度: ${result.confidence}`
        }]
      };
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : '未知错误';
      return {
        content: [{
          type: "text",
          text: `❌ 地址解析失败: ${errorMessage}`
        }],
        isError: true
      };
    }
  }
);

// 资源1: 天气服务状态
server.registerResource(
  "weather-service-status",
  "weather://status",
  {
    title: "天气服务状态",
    description: "显示天气服务的配置状态和可用性",
    mimeType: "text/plain"
  },
  async () => {
    const status = `
🌤️ 天气MCP服务器状态

✅ 服务器运行中
✅ 天气API (Open-Meteo): 免费服务，无需密钥
✅ 位置API (Open-Meteo Geocoding): 免费服务，无需密钥
✅ IP定位API (IP-API): 免费服务，无需密钥

📋 可用功能:
- 根据地址获取天气 ✅
- 根据地址获取天气预报 ✅
- 获取当前位置天气 ✅
- 获取当前位置天气预报 ✅
- 根据坐标获取天气 ✅
- 地址解析 ✅

💡 优势:
- 完全免费，无需注册API密钥
- 支持全球天气查询
- 数据来源可靠，更新及时
    `.trim();
    
    return {
      contents: [{
        uri: "weather://status",
        text: status
      }]
    };
  }
);

// 提示1: 天气查询助手
server.registerPrompt(
  "weather-assistant",
  {
    title: "天气查询助手",
    description: "帮助用户查询天气信息的智能助手",
    argsSchema: {
      location: z.string().optional().describe("可选的位置信息"),
      query_type: z.enum(["current", "forecast"]).optional().describe("查询类型：current（当前天气）或forecast（天气预报）")
    }
  },
  ({ location, query_type = "current" }) => {
    const isCurrentWeather = query_type === "current";
    const locationPrompt = location ? `位置：${location}` : "当前位置";
    
    return {
      messages: [{
        role: "assistant",
        content: {
          type: "text",
          text: `您好！我是天气查询助手。我可以帮您查询${locationPrompt}的${isCurrentWeather ? '当前天气' : '天气预报'}信息。

我的功能包括：
🌤️ 获取实时天气信息
📅 获取未来几天的天气预报
📍 根据地址或坐标查询天气
🌍 自动检测当前位置天气
💡 提供天气相关的生活建议

${location ? `正在为您查询${location}的天气信息...` : '您可以告诉我具体的地址，或者我可以帮您查询当前位置的天气。'}`
        }
      }]
    };
  }
);

// 启动服务器
async function main() {
  try {
    const transport = new StdioServerTransport();
    await server.connect(transport);
    
    console.error("🌤️ 天气MCP服务器已启动");
    console.error("📋 可用工具:");
    console.error("  - get-weather-by-address: 根据地址获取天气");
    console.error("  - get-forecast-by-address: 根据地址获取天气预报");
    console.error("  - get-current-location-weather: 获取当前位置天气");
    console.error("  - get-current-location-forecast: 获取当前位置天气预报");
    console.error("  - get-weather-by-coordinates: 根据坐标获取天气");
    console.error("  - geocode-address: 地址解析");
    console.error("📚 可用资源:");
    console.error("  - weather://status: 服务状态");
    console.error("🎯 可用提示:");
    console.error("  - weather-assistant: 天气查询助手");
    
  } catch (error) {
    console.error("❌ 启动服务器失败:", error);
    process.exit(1);
  }
}

// 处理未捕获的错误
process.on('uncaughtException', (error) => {
  console.error('未捕获的异常:', error);
  process.exit(1);
});

process.on('unhandledRejection', (reason, promise) => {
  console.error('未处理的Promise拒绝:', reason);
  process.exit(1);
});

// 启动服务器
main().catch((error) => {
  console.error("服务器启动失败:", error);
  process.exit(1);
}); 