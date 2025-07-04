# 快速开始指南 🚀

## 1. 安装和启动

```bash
# 安装依赖
npm install

# 编译项目
npm run build

# 启动服务器
npm start
```

## 2. 测试功能

### 测试服务器状态
```bash
echo '{"jsonrpc": "2.0", "id": 1, "method": "initialize", "params": {"protocolVersion": "2024-11-05", "capabilities": {}, "clientInfo": {"name": "test-client", "version": "1.0.0"}}}' | node dist/index.js
```

### 测试天气查询
```bash
echo '{"jsonrpc": "2.0", "id": 1, "method": "initialize", "params": {"protocolVersion": "2024-11-05", "capabilities": {}, "clientInfo": {"name": "test-client", "version": "1.0.0"}}}
{"jsonrpc": "2.0", "id": 2, "method": "tools/call", "params": {"name": "get-weather-by-address", "arguments": {"address": "Beijing"}}}' | node dist/index.js
```

### 测试坐标查询
```bash
echo '{"jsonrpc": "2.0", "id": 1, "method": "initialize", "params": {"protocolVersion": "2024-11-05", "capabilities": {}, "clientInfo": {"name": "test-client", "version": "1.0.0"}}}
{"jsonrpc": "2.0", "id": 2, "method": "tools/call", "params": {"name": "get-weather-by-coordinates", "arguments": {"latitude": 39.9075, "longitude": 116.3972}}}' | node dist/index.js
```

## 3. 可用工具

1. **get-weather-by-address**: 根据地址获取天气
2. **get-forecast-by-address**: 根据地址获取天气预报
3. **get-current-location-weather**: 获取当前位置天气
4. **get-current-location-forecast**: 获取当前位置天气预报
5. **get-weather-by-coordinates**: 根据坐标获取天气
6. **geocode-address**: 地址解析

## 4. 在AI客户端中使用

将以下配置添加到你的AI客户端配置中：

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

## 5. 注意事项

- 🌍 地址查询建议使用英文名称（如"Beijing"而不是"北京"）
- 🔄 服务完全免费，无需API密钥
- 📡 需要网络连接访问Open-Meteo API
- 🌤️ 支持全球天气查询
- 📅 天气预报支持最多16天

## 6. 故障排除

如果遇到问题：
1. 检查网络连接
2. 确认Node.js版本 >= 18.0.0
3. 重新编译项目：`npm run build`
4. 查看错误日志获取详细信息 