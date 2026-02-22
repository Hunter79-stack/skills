# DingTalk API Skill

[![ClawHub](https://img.shields.io/badge/ClawHub-已发布-blue)](https://clawhub.com/ogenes/dingtalk-api)

钉钉开放平台 API 调用技能，支持 获取企业内部应用的accessToken、搜索用户userId 等功能。


> **已发布到 [ClawHub](https://clawhub.com/ogenes/dingtalk-api)**，可通过 `clawhub install dingtalk-api` 一键安装。

## 功能特性

- 🔍 **用户搜索** - 根据姓名搜索用户，返回 UserId 列表
- 🔐 **自动认证** - 自动获取 access_token，无需手动管理
- 📝 **TypeScript** - 类型安全，代码提示友好
- 🔄 **自动文档** - 代码变更后自动更新 SKILL.md

## 安装方式

### 方式一：通过 ClawHub 安装（推荐）

[ClawHub](https://clawhub.com) 是 OpenClaw 官方技能仓库。

#### 1. 安装 ClawHub CLI

```bash
#安装
npm install -g clawhub

#校验
clawhub search dingtalk-api
```

#### 2. 安装 DingTalk API Skill

```bash
# 安装最新版本

clawhub install dingtalk-api
# 或安装指定版本
clawhub install dingtalk-api --version 1.0.0
```

#### 3. 更新 Skill

```bash
# 更新到最新版本
clawhub update dingtalk-api

# 或强制重新安装
clawhub update dingtalk-api --force
```

### 方式二：通过 Git 安装

```bash
git clone https://github.com/ogenes/dingtalk-api.git
cd dingtalk-api
npm install
```

### 方式三：手动安装

1. 下载项目 ZIP 包并解压
2. 进入项目目录：`cd dingtalk-api`
3. 安装依赖：`npm install`

## 配置环境变量

无论哪种安装方式，都需要配置钉钉应用凭证：

```bash
export DINGTALK_APP_KEY="<your-app-key>"
export DINGTALK_APP_SECRET="<your-app-secret>"
```

或添加到 shell 配置文件：

```bash
echo 'export DINGTALK_APP_KEY="<your-app-key>"' >> ~/.zshrc
echo 'export DINGTALK_APP_SECRET="<your-app-secret>"' >> ~/.zshrc
source ~/.zshrc
```

## 使用方法

### 搜索用户

```bash
cd /path/to/dingtalk-api
npx ts-node scripts/search-user.ts "张三"
```

或

```bash
npm run search-user -- "张三"
```

**输出示例：**

```json
{
  "success": true,
  "keyword": "张三",
  "totalCount": 3,
  "hasMore": false,
  "userIds": [
    "123456789",
    "987654321",
    "456789123"
  ]
}
```

## 前置要求

1. **钉钉应用**
   - 在 [钉钉开放平台](https://open.dingtalk.com/) 创建企业内部应用
   - 添加权限：`qyapi_addresslist_search` （搜索企业通讯录的权限）
   - 获取 **AppKey** 和 **AppSecret**

2. **环境**
   - Node.js >= 16
   - TypeScript

## 开发指南

### 项目结构

```
dingtalk-api/
├── scripts/
│   ├── search-user.ts       # 用户搜索脚本
│   ├── update-skill-doc.js  # 自动更新 SKILL.md
│   └── setup-hooks.sh       # Git hooks 安装脚本
├── types/
│   └── dingtalk.d.ts        # 类型定义
├── SKILL.md                 # Skill 文档（自动维护）
├── README.md                # 本文件
├── package.json
└── tsconfig.json
```

## API 文档

- [钉钉开放平台 - 获取企业内部应用的accessToken](https://open.dingtalk.com/document/orgapp/obtain-the-access_token-of-an-internal-app?spm=ding_open_doc.document.0.0.775370c2UiAYAm)
- [钉钉开放平台 - 搜索用户userId](https://open.dingtalk.com/document/api/explore/explorer-page?api=contact_1.0%23SearchUser&devType=org)

## 常见问题

### Q: ClawHub 安装后在哪里？

默认安装在 `./skills` 目录下，可通过 `--dir` 参数指定：

```bash
clawhub install dingtalk-api --dir ~/my-skills
```

### Q: 如何卸载？

```bash
clawhub uninstall dingtalk-api
```

### Q: 查看已安装的技能？

```bash
clawhub list
```

## 许可证

MIT

## 贡献

欢迎提交 Issue 和 PR！

- GitHub: https://github.com/ogenes/dingtalk-api
- ClawHub: https://clawhub.com/ogenes/dingtalk-api

### 发布到 Clawhub
clawhub publish /Users/ogenes/Data/www/dingtalk-api --slug dingtalk-api --name "DingTalk API" --version 1.0.3 --changelog "钉钉API技能 - 更新reamme文档"