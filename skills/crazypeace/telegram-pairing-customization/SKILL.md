# Telegram 配对消息持续响应技能

## 概述
此技能描述如何修改 OpenClaw 的 Telegram 配对逻辑，使未批准的用户在配对被批准前，每次发送 `/start` 消息时都能收到配对码回复。

## 适用场景
- 需要让未批准的用户每次发送 `/start` 都收到配对消息（而非仅首次）
- 用户可能错过首次配对消息，需要重新获取配对码
- 提升用户体验，确保用户始终能获得配对指引

## 修改步骤

### 修改配对消息触发逻辑
文件路径：`/usr/lib/node_modules/openclaw/dist/telegram/bot-message-context.js`

原始代码：
```javascript
if (dmPolicy === "pairing") {
    try {
        const from = msg.from;
        const telegramUserId = from?.id ? String(from.id) : candidate;
        const { code, created } = await upsertTelegramPairingRequest({
            chatId: candidate,
            username: from?.username,
            firstName: from?.first_name,
            lastName: from?.last_name,
        });
        if (created) {  // <-- 关键修改点
            logger.info({
                chatId: candidate,
                username: from?.username,
                firstName: from?.first_name,
                lastName: from?.last_name,
                matchKey: allowMatch.matchKey ?? "none",
                matchSource: allowMatch.matchSource ?? "none",
            }, "telegram pairing request");
            await withTelegramApiErrorLogging({
                operation: "sendMessage",
                fn: () => bot.api.sendMessage(chatId, [
                    "OpenClaw: access not configured.",
                    "",
                    `Your Telegram user id: ${telegramUserId}`,
                    "",
                    `Pairing code: ${code}`,
                    "",
                    "Ask the bot owner to approve with:",
                    formatCliCommand("openclaw pairing approve telegram <code>"),
                ].join("\n")),
            });
        }
    }
    catch (err) {
        logVerbose(`telegram pairing reply failed for chat ${chatId}: ${String(err)}`);
    }
}
```

修改方法：
- 移除 `if (created)` 条件判断，使代码总是执行配对消息发送
- 删除 `if (created)` 和对应的 `}`，让配对消息发送代码块无条件执行

修改后的代码应为：
```javascript
if (dmPolicy === "pairing") {
    try {
        const from = msg.from;
        const telegramUserId = from?.id ? String(from.id) : candidate;
        const { code, created } = await upsertTelegramPairingRequest({
            chatId: candidate,
            username: from?.username,
            firstName: from?.first_name,
            lastName: from?.last_name,
        });
        logger.info({
            chatId: candidate,
            username: from?.username,
            firstName: from?.first_name,
            lastName: from?.last_name,
            matchKey: allowMatch.matchKey ?? "none",
            matchSource: allowMatch.matchSource ?? "none",
        }, "telegram pairing request");
        await withTelegramApiErrorLogging({
            operation: "sendMessage",
            fn: () => bot.api.sendMessage(chatId, [
                "OpenClaw: access not configured.",
                "",
                `Your Telegram user id: ${telegramUserId}`,
                "",
                `Pairing code: ${code}`,
                "",
                "Ask the bot owner to approve with:",
                formatCliCommand("openclaw pairing approve telegram <code>"),
            ].join("\n")),
        });
    }
    catch (err) {
        logVerbose(`telegram pairing reply failed for chat ${chatId}: ${String(err)}`);
    }
}
```

### 重启服务
修改完成后需要重启 OpenClaw 服务以使更改生效：
```bash
openclaw gateway restart
```

## 注意事项
- 修改系统文件前建议备份原文件
- 修改后的文件在 OpenClaw 更新时可能会被覆盖，需要重新应用修改
- 需要适当的文件系统权限来修改 OpenClaw 的安装文件
- 修改后应测试以确保功能正常

## 故障排除
- 如果修改不生效，请确认是否正确重启了 OpenClaw 服务
- 如果找不到文件路径，请确认 OpenClaw 的实际安装路径
- 如果权限不足，请使用适当的权限提升方法（如 sudo）