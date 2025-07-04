# 天气MCP服务器 🌤️

一个基于Model Context Protocol (MCP)的天气查询服务器，可以根据用户输入的地址或自动获取当前位置来查询天气信息和预报。

## 功能特性 ✨

- 🌍 **多种位置查询方式**：支持地址、坐标、当前位置
- 🌤️ **实时天气信息**：获取当前详细天气数据
- 📅 **天气预报**：支持1-10天的未来天气预报
- 📍 **地理编码**：地址与坐标之间的转换
- 💡 **智能建议**：根据天气条件提供生活建议
- 🌐 **多语言支持**：中文界面，支持全球地址查询
- 🔧 **易于集成**：标准MCP协议，兼容多种AI客户端

## 安装 🚀

### 1. 克隆项目

```bash
git clone <repository-url>
cd weather-mcp-server
```

### 2. 安装依赖

```bash
npm install
```

### 3. 编译和运行

> 🎉 **无需API密钥！** 本项目使用完全免费的Open-Meteo API，无需注册或配置任何密钥。

```bash
# 编译TypeScript
npm run build

# 启动服务器
npm start

# 或者开发模式（自动重编译）
npm run dev
```

## 使用方法 📖

### 在Claude Desktop中使用

1. 打开Claude Desktop配置文件：
   - macOS: `~/Library/Application Support/Claude/claude_desktop_config.json`
   - Windows: `%APPDATA%/Claude/claude_desktop_config.json`

2. 添加MCP服务器配置：

```json
{
  "mcpServers": {
    "weather": {
      "command": "node",
      "args": ["/path/to/weather-mcp-server/dist/index.js"]
    }
  }
}
```

3. 重启Claude Desktop

### 在其他MCP客户端中使用

参考各客户端的文档，使用stdio传输协议连接到服务器：

```bash
node /path/to/weather-mcp-server/dist/index.js
```

## 可用工具 🔧

### 1. get-weather-by-address
根据地址获取当前天气信息

**参数:**
- `address` (string): 地址，例如："北京市"、"上海市浦东新区"、"New York"

**示例:**
```
获取北京市的天气
```

### 2. get-forecast-by-address
根据地址获取天气预报

**参数:**
- `address` (string): 地址
- `days` (number, 可选): 预报天数，1-10天，默认5天

**示例:**
```
获取上海市未来7天的天气预报
```

### 3. get-current-location-weather
获取当前位置的天气信息（基于IP地址）

**参数:** 无

**示例:**
```
获取我当前位置的天气
```

### 4. get-current-location-forecast
获取当前位置的天气预报

**参数:**
- `days` (number, 可选): 预报天数，1-10天，默认5天

**示例:**
```
获取我当前位置未来3天的天气预报
```

### 5. get-weather-by-coordinates
根据经纬度坐标获取天气信息

**参数:**
- `latitude` (number): 纬度，-90到90之间
- `longitude` (number): 经度，-180到180之间

**示例:**
```
获取坐标(39.9042, 116.4074)的天气信息
```

### 6. geocode-address
将地址转换为经纬度坐标

**参数:**
- `address` (string): 要解析的地址

**示例:**
```
解析"天安门广场"的坐标
```

## 可用资源 📚

### weather://status
显示天气服务的配置状态和可用性

## 可用提示 🎯

### weather-assistant
天气查询智能助手

**参数:**
- `location` (string, 可选): 位置信息
- `query_type` (enum, 可选): 查询类型，"current"或"forecast"

## 示例输出 📋

### 天气信息示例
```
📍 位置: Beijing, Beijing, China
🌡️ 温度: 22°C (体感温度: 24°C)
🌤️ 天气: 晴
💧 湿度: 45%
💨 风速: 12 km/h (SW)
🌡️ 气压: 1013 mb
👁️ 能见度: 10 km
☀️ 紫外线指数: 6
🕐 更新时间: 2024-01-15 14:30

💡 建议:
☀️ 天气较热，穿轻便衣物
🧴 紫外线较强，建议涂抹防晒霜
```

### 天气预报示例
```
📍 Beijing, Beijing, China 天气预报

🌟 当前天气:
温度: 22°C (体感: 24°C)
天气: 晴
湿度: 45% | 风速: 12 km/h

📅 未来几天预报:
今天 (2024-01-15):
  🌡️ 18°C ~ 25°C | 晴
  💧 湿度: 45% | 🌧️ 降雨概率: 10%

明天 (2024-01-16):
  🌡️ 16°C ~ 23°C | 多云
  💧 湿度: 55% | 🌧️ 降雨概率: 20%
```

## 技术架构 🏗️

### 核心组件

- **WeatherService**: 天气API调用和数据格式化
- **LocationService**: 地理位置服务和地址解析
- **MCP Server**: 基于标准MCP协议的服务器实现

### 依赖项

- `@modelcontextprotocol/sdk`: MCP协议实现
- `axios`: HTTP请求库
- `zod`: 数据验证
- `dotenv`: 环境变量管理

### API服务商

- **Open-Meteo**: 免费天气数据提供商
- **Open-Meteo Geocoding**: 免费地理编码服务
- **IP-API**: 免费IP地址定位服务

## 开发 🛠️

### 项目结构

```
weather-mcp-server/
├── src/
│   ├── index.ts              # 主服务器文件
│   ├── weather-service.ts    # 天气服务
│   ├── location-service.ts   # 位置服务
│   └── types.ts             # 类型定义
├── dist/                    # 编译输出
├── package.json
├── tsconfig.json
├── env.example
└── README.md
```

### 开发命令

```bash
# 安装依赖
npm install

# 开发模式（自动重编译）
npm run dev

# 编译
npm run build

# 运行
npm start
```

### 添加新功能

1. 在相应的服务类中添加新方法
2. 在 `src/index.ts` 中注册新的工具、资源或提示
3. 更新类型定义（如需要）
4. 重新编译和测试

## 故障排除 🔧

### 常见问题

1. **网络连接问题**
   - 检查网络连接
   - 确认防火墙设置允许外部API访问

2. **地址解析失败**
   - 尝试使用更具体的地址
   - 检查地址拼写是否正确

3. **编译错误**
   - 确保Node.js版本 >= 18.0.0
   - 删除 `node_modules` 和 `dist` 目录后重新安装

4. **服务暂时不可用**
   - Open-Meteo服务偶尔可能维护，请稍后重试

### 调试模式

启用详细日志：

```bash
DEBUG=weather-mcp-server npm start
```

## 贡献 🤝

欢迎贡献代码！请遵循以下步骤：

1. Fork 项目
2. 创建功能分支 (`git checkout -b feature/AmazingFeature`)
3. 提交更改 (`git commit -m 'Add some AmazingFeature'`)
4. 推送到分支 (`git push origin feature/AmazingFeature`)
5. 创建Pull Request

## 许可证 📄

本项目采用 MIT 许可证。详见 [LICENSE](LICENSE) 文件。

## 支持 💬

如果您遇到问题或有建议，请：

1. 查看[常见问题](#故障排除)
2. 搜索现有的Issues
3. 创建新的Issue并详细描述问题

## 更新日志 📝

### v1.0.0
- 初始版本发布
- 使用Open-Meteo免费API，无需密钥
- 支持基本天气查询功能
- 支持地址和坐标查询
- 支持当前位置自动检测
- 支持天气预报（最多16天）
- 提供智能天气建议
- 完全免费使用

---

**享受使用天气MCP服务器！** 🌤️✨ 