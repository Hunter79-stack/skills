# Cue Skill 安全指南 / Security Guide

## 概述 / Overview

Cue 是一个具有持久化状态和后台行为的金融研究+监控工具。在安装前，请了解以下安全相关信息。

> Cue is a financial research + monitoring tool with persistent state and background behavior. Please understand the following security information before installing.

---

## 权限和行为 / Permissions & Behaviors

### 1. 本地存储 / Local Storage

**位置 / Location:** `$HOME/.cuecue/`

**存储内容 / Contents:**
- 用户数据和初始化标记
- 研究任务配置和状态
- 监控项配置和触发历史
- 日志文件

**风险 / Risk:**
- 数据持久化在本地文件系统
- 多用户场景下通过 chat_id 隔离数据
- 需要定期清理旧日志以释放空间

### 2. 后台任务 / Background Jobs

**Cron 作业 / Cron Jobs:**
- `monitor-daemon.sh` 每30分钟运行一次
- 检查监控条件并触发通知

**后台进程 / Background Processes:**
- 研究任务可能运行60分钟
- 使用 nohup 确保进程不随会话结束

**风险 / Risk:**
- 持续占用系统资源（CPU/内存/网络）
- 定期产生外部 API 调用（可能产生费用）
- 需要手动管理或卸载 cron 作业

### 3. 外部 API 访问 / External API Access

**必需端点 / Required Endpoints:**
- `https://cuecue.cn` - 深度研究服务

**可选端点 / Optional Endpoints:**
- `https://api.tavily.com` - 新闻搜索（监控功能）

**数据流向 / Data Flow:**
- 研究主题和查询发送到 CueCue API
- 监控关键词发送到 Tavily API（如启用）
- API 响应存储在本地并展示给用户

**风险 / Risk:**
- API Key 可能被滥用于超出预期的查询
- 外部服务可能记录查询内容
- 需要保护好 API Key 不被泄露

### 4. 环境变量使用 / Environment Variable Usage

**必需 / Required:**
```bash
CUECUE_API_KEY=your-api-key
```

**可选 / Optional:**
```bash
TAVILY_API_KEY=your-tavily-key      # 监控搜索
FEISHU_APP_ID=your-app-id           # 飞书通知
FEISHU_APP_SECRET=your-secret       # 飞书通知
OPENCLAW_CHANNEL=feishu             # 渠道选择
CHAT_ID=user:xxx                    # 用户识别
```

**风险 / Risk:**
- 可能复用 OpenClaw 已有的渠道令牌
- 环境变量需要正确配置才能正常工作
- 建议限制环境变量访问权限

---

## 安全建议 / Security Recommendations

### 安装前 / Before Installation

1. **审查代码 / Review Code**
   ```bash
   # 检查所有脚本内容
   cat scripts/*.sh
   cat scripts/executor/*.sh
   cat scripts/cuecue-client.js
   ```

2. **测试环境验证 / Test in Sandbox**
   - 在非生产环境先测试所有功能
   - 验证 cron 作业和后台进程行为
   - 确认 API 调用和网络访问正常

3. **权限控制 / Permission Control**
   - 确保只有授权用户可以访问 `$HOME/.cuecue`
   - 限制 API Key 的可见性和使用范围
   - 考虑使用只读或受限的 API Key 进行测试

### 运行时 / Runtime

1. **监控资源使用 / Monitor Resource Usage**
   ```bash
   # 检查后台进程
   ps aux | grep cue
   
   # 检查磁盘使用
   du -sh ~/.cuecue
   
   # 检查 cron 作业
   crontab -l
   ```

2. **定期清理 / Regular Cleanup**
   - 清理旧的研究任务和日志
   - 删除不再需要的监控项
   - 归档或删除历史通知

3. **API 使用监控 / API Usage Monitoring**
   - 监控 CueCue API 调用量和费用
   - 监控 Tavily API 使用情况（如启用）
   - 设置使用限制和告警

### 卸载 / Uninstallation

1. **停止后台进程 / Stop Background Processes**
   ```bash
   # 查找并停止所有 cuecue 相关进程
   pkill -f cuecue
   ```

2. **移除 Cron 作业 / Remove Cron Jobs**
   ```bash
   # 编辑 crontab 删除 monitor-daemon 条目
   crontab -e
   ```

3. **清理本地数据 / Clean Local Data**
   ```bash
   # 删除所有本地存储数据
   rm -rf ~/.cuecue
   ```

4. **撤销 API Key / Revoke API Keys**
   - 在 CueCue 控制台撤销或删除 API Key
   - 在 Tavily 控制台撤销 API Key（如使用）

---

## 数据隐私 / Data Privacy

### 本地数据 / Local Data

所有用户数据存储在本地文件系统，不会自动上传到远程服务器（除了通过 API 进行的必要查询）。

### API 数据传输 / API Data Transmission

发送到 CueCue API 的数据：
- 研究主题和查询内容
- 用户 chat_id（用于数据隔离）
- 任务配置和参数

**注意：** 敏感信息（如具体股票代码、财务数据）会通过 API 发送到外部服务进行处理。

### 建议 / Recommendations

- 不要在研究主题中包含高度敏感的个人或商业机密信息
- 使用环境变量或配置文件管理 API Key，避免硬编码
- 定期审计 API 调用日志

---

## 漏洞报告 / Vulnerability Reporting

如果您发现安全问题，请联系：
- GitHub Issues: https://github.com/openclaw/skills/cue/issues
- Email: security@openclaw.ai

---

## 更新日志 / Change Log

### v1.0.3 (2026-02-25)
- 添加完整的安全声明和权限说明
- 明确列出所有环境变量和权限要求
- 提供详细的安全建议

### v1.0.2 (2026-02-24)
- 修复 API 调用安全问题（使用内置客户端）
- 改进数据隔离机制

### v1.0.0 (2026-02-23)
- 初始版本
