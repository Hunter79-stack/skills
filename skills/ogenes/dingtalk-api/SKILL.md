---
name: dingtalk-api
description: 调用钉钉开放平台API，实现用户搜索、部门管理等功能。从系统环境变量读取应用凭证。Use when needing to interact with DingTalk API, search users by name, get user details, or manage organizational contacts.
---

# DingTalk API Skill

用于调用钉钉开放平台API的技能，支持用户搜索、部门查询等功能。

## 前置要求

- 钉钉应用已创建并拥有以下权限：
  - `qyapi_addresslist_search` - 搜索企业通讯录的权限
- 已获取应用的 **AppKey** 和 **AppSecret**
- 已设置环境变量 `DINGTALK_APP_KEY` 和 `DINGTALK_APP_SECRET`

## 环境变量配置

在使用脚本前，需要导出以下环境变量：

```bash
export DINGTALK_APP_KEY="<your-app-key>"
export DINGTALK_APP_SECRET="<your-app-secret>"
```

或者在一行中执行：

```bash
export DINGTALK_APP_KEY="<your-app-key>" && export DINGTALK_APP_SECRET="<your-app-secret>" && npx ts-node scripts/search-user.ts "搜索关键词"
```

## 功能列表

### 1. 搜索用户 (searchUser)

根据姓名搜索用户，返回匹配的 UserId 列表。脚本会自动获取 access_token。

**使用方式:**

```bash
cd ~/Data/www/dingtalk-api
export DINGTALK_APP_KEY="<your-app-key>"
export DINGTALK_APP_SECRET="<your-app-secret>"
npx ts-node scripts/search-user.ts "<搜索关键词>"
```

**示例:**

```bash
export DINGTALK_APP_KEY="<your-app-key>"
export DINGTALK_APP_SECRET="<your-app-secret>"
npx ts-node scripts/search-user.ts "张三"
```

**输出:**

```json
{
  "success": true,
  "keyword": "<搜索关键词>",
  "totalCount": 3,
  "hasMore": false,
  "userIds": [
    "123456789",
    "987654321",
    "456789123"
  ]
}
```

> **注意:** 钉钉搜索用户 API 返回的是匹配用户的 **userid 列表**。

**错误输出:**

```json
{
  "success": false,
  "error": {
    "code": "MISSING_CREDENTIALS",
    "message": "缺少钉钉应用凭证，请设置环境变量 DINGTALK_APP_KEY 和 DINGTALK_APP_SECRET"
  }
}
```
