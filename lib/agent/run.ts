import { ToolLoopAgent, isStepCount } from "ai";
import { q } from "@/lib/db";
import { agentConfig } from "@/data/agent";
import { getSession } from "@/lib/session";
import { buildInstructions } from "@/lib/agent/prompt";
import { buildTools } from "@/lib/agent/tools";
import { sendText } from "@/lib/whatsapp/client";
import { track } from "@/lib/analytics";

/** AI Gateway "provider/model" string. Override with AGENT_MODEL. */
const MODEL = process.env.AGENT_MODEL || "anthropic/claude-haiku-5.5";

type Row = { role: "user" | "assistant"; content: string };

async function loadHistory(waId: string) {
  const rows = await q<Row>`
    select role, content from (
      select id, role, content from messages where wa_id = ${waId} order by id desc limit ${agentConfig.limits.historyMessages}
    ) t order by id asc`;
  // Merge consecutive same-role rows (e.g. several bot messages in a row).
  const merged: Row[] = [];
  for (const r of rows) {
    const last = merged[merged.length - 1];
    if (last && last.role === r.role) last.content += "\n" + r.content;
    else merged.push({ ...r });
  }
  while (merged.length && merged[0].role !== "user") merged.shift();
  return merged;
}

/** Runs one agent turn for the customer's latest message(s) and sends the reply. */
export async function runAgent(
  waId: string,
  customerName?: string,
  model: ConstructorParameters<typeof ToolLoopAgent>[0]["model"] = MODEL
) {
  const session = await getSession(waId);
  const agent = new ToolLoopAgent({
    model,
    instructions: buildInstructions(session, customerName),
    tools: buildTools({ waId, customerName }),
    stopWhen: isStepCount(10),
    temperature: 0.3,
  });

  const messages = await loadHistory(waId);
  if (!messages.length) return;

  const t0 = Date.now();
  const result = await agent.generate({ messages });
  const text = result.text?.trim();
  if (text) await sendText(waId, text);

  await track("agent_turn", {
    waId,
    props: {
      model: typeof model === "string" ? model : "custom",
      steps: result.steps?.length ?? 1,
      tools: (result.steps ?? []).flatMap((s) => (s.toolCalls ?? []).map((c) => c.toolName)),
      input_tokens: result.totalUsage?.inputTokens ?? null,
      output_tokens: result.totalUsage?.outputTokens ?? null,
      latency_ms: Date.now() - t0,
      replied_with_text: !!text,
    },
  });
}
