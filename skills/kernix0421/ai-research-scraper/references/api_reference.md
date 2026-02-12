# AI Research Scraper API Reference

## Overview

这个API提供了从AI领域知名网站抓取最新研究和产品发展信息的功能。

## Main Script

### scraper.py

主要的抓取脚本，包含以下功能：

#### 命令行选项

```bash
python3 scraper.py [options]
```

| 选项 | 描述 | 默认值 |
|------|------|--------|
| --max-tokens | 最大摘要长度（token数） | 300 |
| --days | 只获取最近几天的信息 | 7 |
| --topic | 主题筛选 | product-development |
| --no-cache | 不使用缓存（默认使用） | False |

#### 使用示例

```bash
# 基本使用，使用默认参数
python3 scraper.py

# 自定义摘要长度为500个token
python3 scraper.py --max-tokens 500

# 只获取最近3天的信息
python3 scraper.py --days 3

# 指定主题筛选（产品开发）
python3 scraper.py --topic product-development
```

## Configuration

### websites.txt

网站列表配置文件，格式为：

```
网站名称|网站URL|RSS/Feed URL（可选）
```

示例：
```
TechCrunch AI|https://techcrunch.com/ai/|https://techcrunch.com/ai/feed/
OpenAI Blog|https://openai.com/blog|https://openai.com/blog/rss
```

### 添加新网站

1. 在 `websites.txt` 中添加一行
2. 格式：`网站名称|网站URL|RSS/Feed URL（可选）`
3. 确保网站支持RSS/Feed以便更好地抓取

## Scraping Methods

### RSS/Feed Scraping

如果网站提供RSS/Feed，脚本会优先使用这种方式，因为它更可靠和高效。

### HTML Scraping

如果没有RSS/Feed，脚本会尝试从HTML页面直接抓取信息，使用常见的文章标题和链接选择器。

## Filters

### Product Development Focus

脚本会优先抓取与AI产品发展相关的内容，识别以下关键词：

- product, launch, release, feature, update, announcement
- api, platform, tool, framework, library, service
- deployment, integration, use case, application, solution
- demo, preview, beta, version

### Duplicate Detection

脚本会基于链接去重，确保相同的文章不会重复显示。

## Output Format

### Console Output

结果会以以下格式打印到控制台：

```
1. [网站名称] 文章标题
   摘要: 文章摘要（限制在指定的token数内）
   链接: 原始网页链接
```

### Data Structure

每个结果包含以下字段：

| 字段 | 类型 | 描述 |
|------|------|------|
| site | string | 来源网站名称 |
| title | string | 文章标题 |
| summary | string | 文章摘要 |
| link | string | 原始网页链接 |

## Error Handling

脚本包含基本的错误处理机制，包括：

- 网络连接错误
- 超时处理
- 页面解析错误
- 内容提取失败

## Performance Optimization

为了避免被网站封禁，脚本实现了以下优化：

- 随机延迟（1-3秒）
- 合理的请求频率
- 浏览器用户代理标识

## Extensibility

脚本的设计考虑了扩展性，您可以：

1. 扩展主题筛选关键词
2. 添加新的网站解析规则
3. 自定义输出格式
4. 集成到其他系统中

## Dependencies

需要安装以下Python库：

```bash
pip install requests beautifulsoup4 lxml
```

或使用apt安装（Debian/Ubuntu系统）：

```bash
apt install python3-requests python3-bs4 python3-lxml
```
