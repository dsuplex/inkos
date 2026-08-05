import type { EndpointGroup } from "../store/service/types";
import { tr } from "../lib/app-language";

export const GROUP_ORDER: ReadonlyArray<EndpointGroup> = [
  "aggregator",
  "overseas",
  "china",
  "local",
  "codingPlan",
] as const;

// 标签在渲染时通过 tr() 取值，不能在模块加载时固化成单一语言字符串，
// 所以这里存 zh/en 对，由下方 getGroupLabel 等函数在调用时解析。
const GROUP_LABELS: Record<EndpointGroup, { zh: string; ko: string; en: string }> = {
  overseas: { zh: "海外原厂", ko: "해외 제공자", en: "International providers" },
  china: { zh: "国产原厂", ko: "국내 제공자", en: "China providers" },
  aggregator: { zh: "聚合 API", ko: "통합 API", en: "Aggregator APIs" },
  local: { zh: "本地 / 订阅", ko: "로컬 / 구독", en: "Local / Subscription" },
  codingPlan: { zh: "CodingPlan", ko: "CodingPlan", en: "CodingPlan" },
};

const GROUP_DESCRIPTIONS: Partial<Record<EndpointGroup, { zh: string; ko: string; en: string }>> = {
  aggregator: {
    zh: "聚合国内外主流模型，适合用一个 API Key 接入多模型的场景。",
    ko: "국내외 주요 모델을 통합하여, 하나의 API 키로 다중 모델에 접속하는 상황에 적합합니다.",
    en: "Aggregates mainstream models from multiple vendors — access many models with one API key.",
  },
};

const GROUP_SHORT_LABELS: Record<EndpointGroup, { zh: string; ko: string; en: string }> = {
  overseas: { zh: "海外", ko: "해외", en: "Intl" },
  china: { zh: "国产", ko: "국내", en: "China" },
  aggregator: { zh: "聚合", ko: "통합", en: "Aggregator" },
  local: { zh: "本地", ko: "로컬", en: "Local" },
  codingPlan: { zh: "CodingPlan", ko: "CodingPlan", en: "CodingPlan" },
};

export function getGroupLabel(group: EndpointGroup): string {
  const label = GROUP_LABELS[group];
  return tr(label.zh, label.ko, label.en);
}

export function getGroupDescription(group: EndpointGroup): string | null {
  const desc = GROUP_DESCRIPTIONS[group];
  return desc ? tr(desc.zh, desc.ko, desc.en) : null;
}

export function getGroupShortLabel(group: EndpointGroup): string {
  const label = GROUP_SHORT_LABELS[group];
  return tr(label.zh, label.ko, label.en);
}
