import { chatCompletion, type LLMClient } from "../llm/provider.js";
import { StoryGraphSchema, type StoryGraph } from "./graph-schema.js";

const GRAPH_JSON_SHAPE = `{"schemaVersion":1,"projectId":"","title":"","variables":[{"name":"","type":"flag|counter|relationship|item","default":0,"desc":""}],"nodes":[{"id":"","title":"","type":"start|normal|branch|ending","sceneDesc":"","dialogue":[{"speaker":"","text":"","emotion":""}],"choices":[{"id":"","text":"","targetNodeId":"","condition":{"var":"","op":">=","value":0},"effects":[{"var":"","op":"add","value":1}]}]}],"endings":[{"id":"","nodeId":"","title":"","type":"good|bad|neutral|secret","description":""}]}`;

const SYSTEM_PROMPT_ZH = `你是互动影游编剧。根据用户的故事前提，生成一个小而完整的可玩分支图。
严格只输出 JSON，结构如下：
${GRAPH_JSON_SHAPE}
要求：恰好 1 个 type=start 节点；至少 2 个 branch 节点；至少 2 个差异化 ending；每条路径都能到达某个 ending；condition/effects 可省略；不要输出 JSON 以外的任何文字。`;

const SYSTEM_PROMPT_EN = `You are an interactive film scriptwriter. From the user's story premise, generate a small but complete playable branching graph.
Output strictly JSON, with this structure:
${GRAPH_JSON_SHAPE}
Requirements: exactly 1 node with type=start; at least 2 branch nodes; at least 2 clearly differentiated endings; every path must reach some ending; condition/effects may be omitted; output nothing besides the JSON.`;

const SYSTEM_PROMPT_KO = `당신은 인터랙티브 필름 각본가입니다. 사용자의 스토리 전제를 바탕으로 작지만 완결된 플레이 가능한 분기 그래프를 생성하세요.
구조는 다음과 같은 JSON만 엄격하게 출력하세요:
${GRAPH_JSON_SHAPE}
요구사항: type=start 노드가 정확히 1개; branch 노드가 최소 2개; 서로 뚜렷이 구분되는 ending이 최소 2개; 모든 경로가 어떤 ending에 도달해야 함; condition/effects는 생략 가능; JSON 외의 어떤 텍스트도 출력하지 마세요.`;

export function extractJson(text: string): unknown {
  const fenced = text.match(/```(?:json)?\s*([\s\S]*?)```/);
  const body = fenced ? fenced[1] : text;
  const start = body.indexOf("{");
  const end = body.lastIndexOf("}");
  if (start === -1 || end === -1 || end <= start) {
    throw new Error("LLM did not return a parseable JSON object / LLM 未返回可解析的 JSON 对象");
  }
  return JSON.parse(body.slice(start, end + 1));
}

export function buildStoryGraphFromLLMText(text: string, projectId: string): StoryGraph {
  const parsed = extractJson(text) as Record<string, unknown>;
  const graph = StoryGraphSchema.parse({ ...parsed, projectId });
  if (graph.nodes.length === 0) {
    throw new Error("Invalid story graph: nodes array must not be empty");
  }
  return graph;
}

export interface GenerateStoryGraphInput {
  readonly projectId: string;
  readonly title: string;
  readonly premise: string;
}

export async function generateStoryGraph(
  client: LLMClient,
  model: string,
  input: GenerateStoryGraphInput,
  options?: { readonly maxTokens?: number; readonly language?: "zh" | "ko" | "en" },
): Promise<StoryGraph> {
  const language = options?.language ?? "zh";
  const systemPrompt = language === "en" ? SYSTEM_PROMPT_EN : language === "ko" ? SYSTEM_PROMPT_KO : SYSTEM_PROMPT_ZH;
  const userPrompt = language === "en"
    ? `Title: ${input.title}\nPremise: ${input.premise}`
    : language === "ko"
      ? `제목: ${input.title}\n전제: ${input.premise}`
      : `标题：${input.title}\n前提：${input.premise}`;
  const res = await chatCompletion(client, model, [
    { role: "system", content: systemPrompt },
    { role: "user", content: userPrompt },
  ], { temperature: 0.5, maxTokens: options?.maxTokens ?? 8000 });
  return buildStoryGraphFromLLMText(res.content, input.projectId);
}
