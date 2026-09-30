/**
 * 从最新 assistant 楼层解析 <maintext> 正文与 <option> 选项
 */

/** 移除 <thinking> / <think> 标签及其内容，避免误匹配其中的 <maintext> / <option> */
function stripThinking(content: string): string {
  let out = content.replace(/<thinking>[\s\S]*?<\/thinking>/gi, '');
  out = out.replace(/<think>[\s\S]*?<\/think>/gi, '');
  const unclosed = out.search(/<thinking>|<think>/i);
  if (unclosed !== -1) out = out.slice(0, unclosed);
  return out;
}

/** 提取最后一个 <maintext> 标签的内容 */
export function parseMaintext(content: string): string {
  if (!content) return '';
  const cleaned = stripThinking(content);
  const matches = cleaned.match(/<maintext>([\s\S]*?)<\/maintext>/gi);
  if (!matches || matches.length === 0) return '';
  const last = matches[matches.length - 1];
  const inner = last.match(/<maintext>([\s\S]*?)<\/maintext>/i);
  return inner ? inner[1].trim() : '';
}

/** 从流式文本中提取 <maintext> 内容（支持 <maintext> 尚未闭合的中间态） */
export function extractStreamingMaintext(content: string): string {
  if (!content) return '';
  const start = content.search(/<maintext>/i);
  if (start === -1) return '';
  const rest = content.slice(start + '<maintext>'.length);
  const end = rest.search(/<\/maintext>/i);
  return (end !== -1 ? rest.slice(0, end) : rest).trim();
}

/** 解析 <option>，以换行分割选项，最多 4 个；顺带剥离 "A."、"1、" 之类的前缀 */
export function parseOptions(content: string): string[] {
  if (!content) return [];
  const cleaned = stripThinking(content);
  const match = cleaned.match(/<option>([\s\S]*?)<\/option>/i);
  if (!match) return [];
  return match[1]
    .split('\n')
    .map(s => s.trim())
    .filter(s => s.length > 0)
    .map(s => s.replace(/^[A-Za-z0-9]+[.、．)）:：]\s*/, ''))
    .filter(s => s.length > 0)
    .slice(0, 4);
}

export interface ParsedMessage {
  maintext: string;
  options: string[];
  messageId?: number;
  userMessageId?: number;
  fullMessage?: string;
}

/** 获取最新 assistant 楼层的正文、选项与消息信息（在最近 3 条消息里找最新的 assistant） */
export function loadLatestMessage(): ParsedMessage {
  try {
    for (let depth = 1; depth <= 3; depth++) {
      const messages = getChatMessages(-depth, { role: 'assistant' });
      if (messages.length > 0) {
        const msg = messages[0];
        const content = msg.message || '';
        let userMessageId: number | undefined;
        if (msg.message_id > 0) {
          const userMessages = getChatMessages(msg.message_id - 1, { role: 'user' });
          if (userMessages.length > 0) userMessageId = userMessages[0].message_id;
        }
        return {
          maintext: parseMaintext(content),
          options: parseOptions(content),
          messageId: msg.message_id,
          userMessageId,
          fullMessage: content,
        };
      }
    }
    return { maintext: '', options: [] };
  } catch (error) {
    console.error('[messageParser] 解析失败:', error);
    return { maintext: '', options: [] };
  }
}

export interface FloorMaintext {
  message_id: number;
  maintext: string;
}

/** 获取当前聊天所有 assistant 楼层的 <maintext> 正文，按楼层号升序 */
export function loadAllMaintexts(): FloorMaintext[] {
  try {
    const lastId = getLastMessageId();
    if (lastId < 0) return [];
    const messages = getChatMessages(`0-${lastId}`, { role: 'assistant' });
    return messages
      .map(m => ({ message_id: m.message_id, maintext: parseMaintext(m.message || '') }))
      .filter(f => f.maintext.length > 0);
  } catch (error) {
    console.error('[messageParser] 加载楼层正文失败:', error);
    return [];
  }
}

/** 提取最后一个 <sum> 标签的内容 */
export function parseSum(content: string): string {
  if (!content) return '';
  const cleaned = stripThinking(content);
  const matches = cleaned.match(/<sum>([\s\S]*?)<\/sum>/gi);
  if (!matches || matches.length === 0) return '';
  const last = matches[matches.length - 1];
  const inner = last.match(/<sum>([\s\S]*?)<\/sum>/i);
  return inner ? inner[1].trim() : '';
}

export interface FloorSum {
  message_id: number;
  sum: string;
}

/** 获取当前聊天所有 assistant 楼层的 <sum> 摘要，按楼层号升序 */
export function loadAllSums(): FloorSum[] {
  try {
    const lastId = getLastMessageId();
    if (lastId < 0) return [];
    const messages = getChatMessages(`0-${lastId}`, { role: 'assistant' });
    return messages
      .map(m => ({ message_id: m.message_id, sum: parseSum(m.message || '') }))
      .filter(f => f.sum.length > 0);
  } catch (error) {
    console.error('[messageParser] 加载楼层摘要失败:', error);
    return [];
  }
}
