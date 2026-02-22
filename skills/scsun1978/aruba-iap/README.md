# Aruba IAP Skill for OpenClaw

Aruba Instant AP (IAP/UAP) 配置管理、故障排除和自动化 OpenClaw Skill。

## 功能特性

- ✅ **稳定连接** - 自动处理提示符、分页、超时和重试
- ✅ **标准化输出** - JSON + 原始文本日志，便于 OpenClaw 审计和仪表板
- ✅ **安全性** - SSH 密钥认证、密钥脱敏、审批工作流
- ✅ **完整操作** - discover, snapshot, diff, apply, verify, rollback
- ✅ **密钥管理** - 支持多种密钥存储方式（内存、环境变量、文件）
- ✅ **风险评估** - 自动评估配置变更的风险级别
- ✅ **完整审计** - 每个操作都有完整的时间戳、步骤和输出生成

## 快速开始

1. **安装**：

```bash
cd /Users/scsun/.openclaw/workspace/skills/aruba-iap
./install.sh
```

2. **发现集群**：

```bash
iapctl discover --cluster office-iap --vc 192.168.20.56 --out ./out
```

3. **查看完整文档**：

- [快速开始指南](QUICKSTART.md) - 5 分钟上手
- [技能文档](SKILL.md) - 完整 API 文档
- [功能清单](FEATURES.md) - 所有支持的命令和变更类型
- [开发总结](DEVELOPMENT_SUMMARY.md) - 开发进度和测试结果
- [CLI 文档](iapctl/README.md) - 命令参考

## 支持的操作

| 操作 | 功能 | 状态 |
|------|------|------|
| `discover` | 发现 IAP 集群并收集基本信息 | ✅ 已实现 |
| `snapshot` | 获取完整的配置快照 | ✅ 已实现 |
| `diff` | 生成当前配置与期望配置的差异 | ✅ 已实现 |
| `apply` | 应用配置变更 | ✅ 已实现 |
| `verify` | 验证配置状态 | ✅ 已实现 |
| `rollback` | 回滚到之前的配置 | ✅ 已实现 |

## 目录结构

```
aruba-iap/
├── SKILL.md              # OpenClaw 技能文档
├── README.md             # 本文件
├── QUICKSTART.md         # 快速开始指南
├── install.sh            # 安装脚本
├── _meta.json            # 技能元数据
├── examples/             # 示例文件
│   ├── example-changes.json
│   └── example-secrets.json
├── iapctl/               # iapctl CLI 工具
│   ├── src/
│   │   └── iapctl/
│   │       ├── __init__.py
│   │       ├── cli.py          # CLI 界面
│   │       ├── models.py       # 数据模型
│   │       ├── connection.py   # 连接管理
│   │       ├── operations.py   # 操作实现
│   │       ├── diff_engine.py  # 差异生成引擎
│   │       └── secrets.py      # 密钥管理
│   ├── tests/
│   │   └── test_manual.py      # 手动测试
│   ├── pyproject.toml          # Python 项目配置
│   ├── README.md               # CLI 文档
│   └── install.sh              # CLI 安装脚本
├── references/           # 参考文档
└── scripts/             # 辅助脚本
```

## 技术栈

- **Python**: 3.9+
- **CLI 框架**: Typer
- **网络自动化**: Scrapli (Paramiko transport)
- **数据验证**: Pydantic
- **终端输出**: Rich
- **SSH**: Paramiko

## 工作流程

```
┌─────────────┐
│  discover   │  发现集群
└──────┬──────┘
       │
┌──────▼─────────┐
│   snapshot     │  建立基线
└──────┬─────────┘
       │
┌──────▼─────────┐
│     diff       │  生成差异
└──────┬─────────┘
       │
┌──────▼─────────┐
│   review       │  审查命令
└──────┬─────────┘
       │
┌──────▼─────────┐
│    apply       │  应用变更
└──────┬─────────┘
       │
┌──────▼─────────┐
│    verify      │  验证配置
└───────────────┘
```

如果出现问题，可以随时使用 `rollback` 命令回滚。

## 输出格式

每个操作都会生成：

1. **result.json** - 结构化输出（机器可读）
2. **raw/*.txt** - 原始 CLI 输出（人类可审计）

### result.json 示例

```json
{
  "ok": true,
  "action": "snapshot",
  "cluster": "office-iap",
  "vc": "192.168.20.56",
  "os_major": "8",
  "is_vc": true,
  "artifacts": [
    {
      "name": "result.json",
      "path": "./out/snapshot/result.json",
      "size_bytes": 1024,
      "content_type": "application/json"
    }
  ],
  "checks": [],
  "warnings": [],
  "errors": [],
  "timing": {
    "total_seconds": 2.5,
    "steps": {
      "version": 0.3,
      "running_config": 0.8,
      "wlan": 0.4
    }
  },
  "timestamp": "2026-02-22T10:30:00.000Z"
}
```

## OpenClaw 集成

### 工具白名单

```json
{
  "allowedTools": [
    "Bash(iapctl:*)"
  ]
}
```

### 审批流程

- **需要审批**: `apply`, `rollback` 命令
- **自动批准**: `discover`, `snapshot`, `diff`, `verify` 命令

### 工作流示例

```python
# OpenClaw 自动化工作流

# 1. 建立基线
run("iapctl snapshot --cluster office-iap --vc 192.168.20.56 --out ./baseline")

# 2. 生成差异
run("iapctl diff --cluster office-iap --vc 192.168.20.56 --in changes.json --out ./diff")

# 3. 审查差异（OpenClaw 会自动显示命令）
review("./diff/commands.txt")

# 4. 请求审批
request_approval("Apply configuration changes?")

# 5. 应用变更（审批后）
run("iapctl apply --cluster office-iap --vc 192.168.20.56 --change-id chg_20260222_0001 --in ./diff/commands.json --out ./apply")

# 6. 验证
run("iapctl verify --cluster office-iap --vc 192.168.20.56 --level basic --out ./verify")
```

## 配置变更格式

```json
{
  "changes": [
    {
      "type": "ntp",
      "servers": ["10.10.10.1", "10.10.10.2"]
    },
    {
      "type": "dns",
      "servers": ["10.10.10.3", "10.10.10.4"]
    },
    {
      "type": "ssid_vlan",
      "profile": "Corporate",
      "essid": "CorporateWiFi",
      "vlan_id": 100
    },
    {
      "type": "radius_server",
      "name": "radius-primary",
      "ip": "10.10.10.5",
      "auth_port": 1812,
      "acct_port": 1813,
      "secret_ref": "secret:radius-primary-key"
    },
    {
      "type": "ssid_bind_radius",
      "profile": "Corporate",
      "radius_primary": "radius-primary"
    },
    {
      "type": "rf_template",
      "template": "office-default"
    }
  ]
}
```

## 支持的变更类型

- **ntp** - NTP 服务器配置
- **dns** - DNS 服务器配置
- **ssid_vlan** - SSID 和 VLAN 配置
- **radius_server** - RADIUS 服务器配置
- **ssid_bind_radius** - SSID 与 RADIUS 绑定
- **rf_template** - RF 模板配置

## 版本兼容性

- **Aruba Instant 6.x** - 基础 IAP 功能
- **Aruba Instant 8.x** - WiFi 6 (802.11ax) 支持
- **Aruba AOS 10.x** - 最新功能和云管理

## 开发

### 本地开发

```bash
cd /Users/scsun/.openclaw/workspace/skills/aruba-iap/iapctl
source venv/bin/activate
pip install -e . 'scrapli[paramiko]'

# 运行测试
python tests/test_manual.py

# 代码格式化
black src/
ruff check src/

# 类型检查
mypy src/
```

### 添加新功能

1. 在 `models.py` 中定义数据模型
2. 在 `diff_engine.py` 中实现命令生成逻辑
3. 在 `operations.py` 中实现操作逻辑
4. 在 `cli.py` 中添加 CLI 命令
5. 在 `SKILL.md` 中更新文档

## 贡献

欢迎提交 Issue 和 Pull Request！

## 许可证

MIT License

## 联系方式

- OpenClaw 社区: https://discord.gg/clawd
- 文档: https://docs.openclaw.ai
- GitHub: https://github.com/openclaw/openclaw

## 更新日志

### v0.1.0 (2026-02-22)

**新增功能：**
- ✅ `discover` 命令 - 收集基本 IAP 信息
- ✅ `snapshot` 命令 - 完整配置快照
- ✅ `diff` 命令 - 生成配置差异
- ✅ `apply` 命令 - 应用配置变更（含 dry_run 模式）
- ✅ `verify` 命令 - 验证配置状态（basic/full 级别）
- ✅ `rollback` 命令 - 回滚到之前配置
- ✅ 密钥管理（内存存储、环境变量、文件）
- ✅ 风险评估功能
- ✅ 完整审计日志
- ✅ SSH 密钥和密码认证
- ✅ 结构化 JSON 输出 + 原始文本日志

**技术实现：**
- 使用 Scrapli + Paramiko 进行 SSH 连接
- Pydantic 数据模型验证
- Rich 终端输出
- Typer CLI 框架

**文档：**
- SKILL.md - 完整 API 文档
- QUICKSTART.md - 快速开始指南
- README.md - CLI 文档
- 示例文件和测试

### TODO

- [ ] macOS Keychain 密钥解析
- [ ] Vault 集成（HashiCorp Vault、AWS Secrets Manager）
- [ ] OpenClaw 审批工作流集成
- [ ] 单元测试覆盖
- [ ] 集成测试（真实 IAP 硬件）
- [ ] verify 命令中的期望状态比较
