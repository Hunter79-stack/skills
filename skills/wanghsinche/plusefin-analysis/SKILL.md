---
name: plusefin-analysis
description: AI-ready stock analysis - ticker data, options, sentiment, predictions. Free tier available!
metadata:
  {
    "openclaw":
      {
        "emoji": "📈",
        "homepage": "https://github.com/plusefin/plusefin-skill",
        "requires": { "bins": ["python3"], "env": ["PLUSEFIN_API_KEY"] },
        "primaryEnv": "PLUSEFIN_API_KEY"
      }
  }
---

# PlusE Financial Analysis

让 AI 帮你分析股票、期权、市场情绪。数据经过 ML 预处理，AI 直接能懂，不用你自己整理。

**免费额度**：注册就送数百次调用/月，无需信用卡。[立即注册 →](https://console.plusefin.com)

## 快速开始

```bash
# 1. 设置 API Key
export PLUSEFIN_API_KEY=your_api_key

# 2. 开始分析
python {baseDir}/plusefin.py ticker AAPL
```

## 能做什么

### 股票分析

| 命令 | 干什么 | 例子 |
|------|--------|------|
| `ticker` | 公司概况、估值、分析师评级 | `python {baseDir}/plusefin.py ticker AAPL` |
| `price-history` | 历史价格 + 技术指标信号 | `python {baseDir}/plusefin.py price-history NVDA 1y` |
| `statements` | 财务报表（利润表/资产负债表/现金流量表） | `python {baseDir}/plusefin.py statements AAPL income` |
| `earnings` | 财报历史，超预期还是不及预期 | `python {baseDir}/plusefin.py earnings NVDA` |
| `news` | 相关新闻 | `python {baseDir}/plusefin.py news TSLA` |

### 期权分析

| 命令 | 干什么 | 例子 |
|------|--------|------|
| `options` | 期权链数据 | `python {baseDir}/plusefin.py options TSLA 20` |
| `options-analyze` | 期权分析 | `python {baseDir}/plusefin.py options-analyze AAPL` |

### 市场情绪

| 命令 | 干什么 | 例子 |
|------|--------|------|
| `sentiment` | 当前市场恐慌/贪婪指数 | `python {baseDir}/plusefin.py sentiment` |
| `sentiment-history` | 历史情绪数据 | `python {baseDir}/plusefin.py sentiment-history 10` |
| `sentiment-trend` | 情绪趋势分析 | `python {baseDir}/plusefin.py sentiment-trend 10` |

### 预测 & 宏观

| 命令 | 干什么 | 例子 |
|------|--------|------|
| `prediction` | ML 价格预测 | `python {baseDir}/plusefin.py prediction AAPL` |
| `fred` | 美联储经济数据（GDP、失业率等） | `python {baseDir}/plusefin.py fred GDP` |
| `fred-search` | 搜索经济指标 | `python {baseDir}/plusefin.py fred-search unemployment` |

### 持仓 & 内幕

| 命令 | 干什么 | 例子 |
|------|--------|------|
| `holders` | 机构持仓 | `python {baseDir}/plusefin.py holders SPY` |
| `top25` | 前25大持仓 | `python {baseDir}/plusefin.py top25 AAPL` |
| `insiders` | 内幕交易 | `python {baseDir}/plusefin.py insiders NVDA` |

## 使用场景

### 深度分析一只股票

```
1. 公司概况：python {baseDir}/plusefin.py ticker AAPL
2. 看财报：python {baseDir}/plusefin.py earnings AAPL
3. 看财务报表：python {baseDir}/plusefin.py statements AAPL income
4. 看新闻：python {baseDir}/plusefin.py news AAPL
5. 综合分析，给出投资建议
```

### 期权交易分析

```
1. 当前股价：python {baseDir}/plusefin.py ticker TSLA
2. 期权链：python {baseDir}/plusefin.py options TSLA 20
3. 分析 Greeks 和隐含波动率
```

### 大盘情绪

```
1. 市场情绪：python {baseDir}/plusefin.py sentiment
2. 宏观数据：python {baseDir}/plusefin.py fred GDP
3. 综合判断市场环境
```

## 参数说明

- `price-history`: period 支持 `1mo`, `3mo`, `6mo`, `1y`, `2y`, `5y`
- `options`: num 是返回的期权数量，默认 20
- `statements`: type 支持 `income`, `balance`, `cash`；frequency 支持 `quarterly`, `annual`
- `sentiment-history/trend`: days 是天数，默认 10

## 获取 API Key

1. 访问 [console.plusefin.com](https://console.plusefin.com)
2. 注册账号（免费）
3. 复制 API Key
4. 设置环境变量：`export PLUSEFIN_API_KEY=your_key`

## 定价

| 方案 | 价格 | 说明 |
|------|------|------|
| **Trial** | **免费** | 数百次调用/月，无需信用卡 |
| Flex | $9.9/750 credits | 按需付费 |
| Trader | $39.9/月 | 高频交易者 |

## 链接

- [GitHub](https://github.com/plusefin/plusefin-skill)
- [ClawHub](https://clawhub.ai/skills/plusefin-analysis)
- [API 文档](https://mcp.plusefin.com/api/docs)
- [PlusE 官网](https://plusefin.com)
