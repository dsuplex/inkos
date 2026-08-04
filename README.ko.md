<p align="center">
  <img src="assets/logo.svg" width="120" height="120" alt="InkOS 로고">
  <img src="assets/inkos-text.svg" width="240" height="65" alt="InkOS">
</p>

<h1 align="center">Story Creation AI Agent<br><sub>장편/단편 소설, 대본/극본, 인터랙티브 필름, IP 콘텐츠 및 다국어 번역을 위한 창작 지능형 에이전트 시스템</sub></h1>

<p align="center">
  <a href="https://www.npmjs.com/package/@actalk/inkos"><img src="https://img.shields.io/npm/v/@actalk/inkos.svg?color=cb3837&logo=npm" alt="npm 버전"></a>
  <a href="LICENSE"><img src="https://img.shields.io/badge/License-AGPL%20v3-blue.svg" alt="라이선스: AGPL-3.0"></a>
  <a href="https://github.com/Narcooo/inkos/stargazers"><img src="https://img.shields.io/github/stars/Narcooo/inkos?style=flat&logo=github&color=yellow" alt="GitHub 스타"></a>
  <a href="https://www.npmjs.com/package/@actalk/inkos"><img src="https://img.shields.io/npm/dm/@actalk/inkos?color=cb3837&logo=npm&label=downloads" alt="npm 다운로드"></a>
  <a href="https://clawhub.ai/narcooo/inkos"><img src="https://img.shields.io/badge/🦞%20ClawHub-Skill-FF6B35?labelColor=1a1a1a" alt="ClawHub Skill"></a>
</p>

<p align="center">
  <a href="README.en.md">English</a> | <a href="README.zh.md">中文</a> | 한국어 | <a href="README.ja.md">日本語</a>
</p>

<p align="center">
  <strong>InkOS 웹 버전 출시!</strong>
  <a href="https://huohuaapi.com/apps">지금 체험하기</a>
</p>

---

InkOS는 이야기 창작과 다국어 번역을 위한 AI Agent 시스템입니다: 장편 연재, 독립 단편, 대본/극본, 동인 외전/번외, 모방/계승 집필, 인터랙티브 필름, 오픈 월드와 장문 번역을 모두 하나의 작업대에서 시작할 수 있습니다. Studio, TUI, CLI 세 가지 상호작용 방식을 지원하며, 창의, 설정, 캐릭터, 기억, 심사, 수정, 표지, 인터랙티브 상태와 다국어 납품을 지능체가 통합 관리합니다.

<p align="left">
  <picture>
    <source media="(prefers-color-scheme: dark)" srcset="https://kimi-file.moonshot.cn/prod-chat-kimi/kfs/4/1/2026-06-05/1d8h69mt3v89kkekg24gg">
    <img alt="Kimi 오픈 소스 파트너" width="420" src="https://kimi-file.moonshot.cn/prod-chat-kimi/kfs/4/1/2026-06-05/1d8h69fudcmosb3pipls0">
  </picture>
  <br>
  🎉🎉 InkOS, 제1기 KIMI 오픈 소스 파트너 선정 🎉🎉
</p>

<p align="center">
  <a href="https://www.kimi.com/code/?aff=inkos"><img src="https://gcdn.moonshot.cn/growth-cdn/sponsor/kimi-zh.png" width="900" alt="Kimi가 InkOS 후원"></a>
</p>

[Kimi](https://www.kimi.com/code/?aff=inkos)가 본 프로젝트를 후원해 주셨습니다! [Kimi K3](https://www.kimi.com/blog/kimi-k3)는 Moonshot AI가 지금까지 내놓은 가장 강력한 모델이자 세계 최초의 오픈 소스 3T급 모델로, 네이티브 비전 기능과 100만 토큰 컨텍스트를 갖췄습니다. InkOS와 결합하면 K3가 장편/단편 소설, 대본, 인터랙티브 필름, 다국어 콘텐츠의 기획, 집필, 심사, 수정에 참여할 수 있고, InkOS는 캐릭터, 설정, 복선, 이야기 상태를 지속적으로 관리해 장편 창작을 더 연속적이고 제어 가능하게 만듭니다.

**InkOS Studio가 Moonshot(Kimi)을 지원합니다.** Kimi 오픈 플랫폼([한국어](https://platform.kimi.com/?aff=inkos)｜[글로벌](https://platform.kimi.ai/?aff=inkos))에서 API Key를 발급받아 바로 창작을 시작하세요.

> 💡 **소설 쓰기, Agent에게 전문 데이터 한 겹 더 입혀주기** — 소설 쓰는 데는 모델만 부족한 게 아니라 소재가 더 부족합니다. [**불꽃 데이터 API(huohuaapi)**](https://huohuaapi.com/) 추천: 호출당 과금하는 소설/웹소설 창작 데이터로, Agent가 펜을 들기 전 소설 원문, 챕터 구조, 인물 설정, 문체, 창작 방법론 등 출처 있는 소재를 먼저 조회하게 하세요. 프롬프트로만 '줄거리 개요'를 억지로 꾸미지 마시고요.

## v1.7 - 다국어 창작, 플롯 추론, 중단 없는 협업

InkOS 1.7은 다국어 납품, 장편 추론, 지속 협업을 하나의 Agent 워크벤치에 통합했습니다. 작품 전체를 번역하고, 여러 비(非)정사 미래를 비교하고, 백그라운드 집필 중에도 채팅을 계속할 수 있습니다. Chat이 자료를 읽고, 옛 원고를 불러오고, 프롬프트를 조정하고, 챕터를 수정하고, 창작 현장을 안전하게 복원하게 할 수 있습니다.

- **모델 설정** — Studio에 다중 서비스 설정, 모델 라우팅, 표지 서비스 설정 내장; [kkaiapi](https://kkaiapi.com/) / OpenRouter 등 글로벌 주류 모델 애그리게이터와 커스텀 OpenAI-compatible 서비스도 지원.
- **플롯 다중 라인 추론**: Studio Chat과 CLI가 현재 정사(正史) 기반으로 2~5개의 격리된 후보 미래를 생성, 검증, 선택합니다. 챕터 비트, 인물 결정, 예상 변화, 위험, 작가 의도 매칭도를 가로로 비교하며, 분기를 채택해도 계획만 저장되고 정문·설정·스토리 상태는 미리 수정되지 않습니다.
- **완전한 번역 워크벤치**: EPUB, 텍스트형 PDF, TXT, Markdown 지원, 챕터·의미 단위 번역, 용어집 유지, 대조 교정 리포트 생성, TXT/Markdown/EPUB 내보내기; Studio, Chat, `inkos translate init / run / export`가 같은 능력을 공유.
- **다국어 네이티브 창작**: 단편, 대본, 콘티, 인터랙티브 필름에 영어 창작 파이프라인 보강; Studio 동적 UI와 CLI 언어 폴백 동시 완성, 단순 번역 메뉴 추가가 아님.
- **첨부, 자료 라이브러리, 편집 가능 프롬프트**: Chat이 텍스트, Markdown, 이미지 읽기 가능; 외부 자료 아카이브 후 증거 출처별 검색; 장편, Play, 인터랙티브 필름 등 프롬프트를 Studio에서 조회·수정.
- **기존 작품 시스템 직입**: Chat이 로컬 파일, 디렉토리, 첨부에서 실제 챕터를 임포트해 설정 자동 역생성·챕터 상태 재생; 원문을 단순 임시 컨텍스트로만 쓰지 않음.
- **집필 중에도 채팅 지속**: 챕터 등 생산 태스크가 백그라운드에서 진행되며, 계속 대화·태스크 중단·실패 메시지 재시도 가능; 새로고침·재시작 후 정확한 진행도·종료 상태·완전한 툴 카드 복구.
- **심사·수정·연속 집필 제어 가능**: strict/lenient/always 세 가지 수정 기준, 프로젝트·책 단위 오버라이드, 단일 책 자동/수동 심사 지원; CLI에 `inkos auto`와 완료/실패 알림 추가, 수정 미낙찰 시 전후 지표·남은 문제 표시.
- **창작 데이터·동시성 안전 강화**: 전체 책 백업/복구, 최신 챕터 삭제·상태 롤백, 부분 편집 시 인덱스 글자 수 동기화; 비정상 쓰기 락 복구, 충돌 쓰기 시 `BOOK_BUSY` 명시 반환, 완료 상태는 실제 툴 결과·파일에서만 유래.
- **모델·설치·크로스 플랫폼 경험 안정화**: MiniMax 내장 접입으로 사고 내용 기본 분리; OpenRouter, kkaiapi 등 동적 모델 서비스가 정적 모델 화이트리스트에 의해 오차단되지 않음; npm 배포 패키지 `workspace:*` 누출로 인한 업그레이드 실패 수정, 조작 상세·알림·크로스 플랫폼 프로젝트 경로 통일.

## v1.6.0 - 인터랙티브 필름과 Skill 시스템

InkOS 1.6.0이 오픈 월드를 인터랙티브 필름·대본·콘티 워크벤치까지 확장하면서 플러그인형 Skill 시스템을 도입했습니다: 전문 능력은 Chat Agent가 사용자 의도에 따라 호출하거나, 사용자가 강제 지정할 수 있습니다. 집필, 인터랙티브, 리서치, 내보내기는 같은 action surface를 공유하며, 중요 액션은 확인 후 실행, 산출물은 Studio에서 조회·내보내기 가능.

- **인터랙티브 필름**: 분기 플롯, 변수/플래그, 캐릭터 관계, 엔딩, 노드 이미지, 인터랙티브 아이템 내보내기 추가, 인터랙티브 드라마·필름·다중 엔딩 대본 제작에 적합.
- **Agent Skills**: 표준 `SKILL.md` 전문 능력 팩 직접 호환; Chat Agent가 사용자 의도에 따라 호출, 사용자가 `@skill-id`로 강제 지정 가능. Skill은 전문 가이드와 정적 참고 자료만 제공, InkOS 전용 필드·프롬프트 팩·컨텍스트 플래너와 바인딩하지 않음.
- **웹 리서치**: `research_web` 신규 추가, 세계관·직업·시대·시장·팩트 체크에 활용, 출처·쿼리 기록·신뢰도 포함 Markdown 참고 리포트 생성.
- **협업 편집 안정성**: 부분 챕터 편집, 챕터 인덱스 복구, 다채널 모델 전환 후 bookId 전달에 회귀 보호 추가.

<p align="center">
  <img src="assets/interactive-film-e2e.png" width="900" alt="InkOS 인터랙티브 필름 플롯 트리 실측 스크린샷">
</p>

## v1.5.0 - InkOS Play 출시, 오픈 월드, 상상력으로 플레이

InkOS Play 출시와 Studio UX 업그레이드: 자연어 한 문장으로 오픈 월드 생성, 캐릭터·아이템·증거·관계·시간이 함께 전개; 장편 집필·단편·표지 생성·설정 수정·상태 조회 계속 가능. 시스템이 월드에서 일어난 일을 기억하고, 필요할 때 마땅한 컨텍스트를 모델에 전달.

- **InkOS Play**: 오픈 월드·분기 인터랙티브 신규. 자유 액션·클릭 선택·월드 계약·비고정 시간 진행·캐릭터 에이전트·아이템/증거/관계 상태·HUD·자동 일러스트 지원.
- **Studio UX**: 시작하기·내 작품·세션 기록·월드 보기·일러스트/생성물 프리뷰 전면 재정비, Play를 텍스트 게임처럼 스크롤하며 플레이 가능, 더 이상 CLI에 숨어 있지 않음.
- **기억과 컨텍스트**: 장편·인터랙티브 월드 모두 '태스크 단위 컨텍스트 획득' 모드 진입. 스토리 상태·Markdown 투영·SQLite 메모리·세션 요약·protected/compressible 시맨틱 압축이 협업해 구(舊) 이력이 현재 지시문을 묻어버리는 문제 완화.
- **지시 준수**: Studio Chat·TUI·CLI 자연어 입구 action surface로 통합. 일반 대화·건북 확인·단편·표지·Play·장편 챕터·재작성·계승 집필이 흩어진 키워드 선점에 의존하지 않음; 중요 액션 선확인, 완료 상태는 실제 툴 결과에서 유래.
- **창작 진입**: 장편·단편·동인·외전·모방·계승·표지 제작·오픈 월드가 Studio의 일급 진입점이 됨.
- **모델·에러 바운더리**: 약한 모델 포맷 불안정 시 직접 크래시 감소; 모델 서비스 에러·InkOS 실행 에러·이미지 생성 에러가 설정·공급업체·시스템 문제인지 더 명확히 구분.

<p align="center">
  <img src="assets/studio-play-1-5.png" width="900" alt="InkOS Play Studio 오픈 월드 인터페이스">
</p>

**장편 소설** — 창작 브리프로 건북, 세계관·캐릭터·권(卷) 개요·챕터 의도 생성, '집필→심사→필요시 수정→상태 정산'으로 추진. 컨텍스트를 protected/compressible로 계층 조직해 장편 쓸수록 난잡해지는 문제 방지.

**플롯 다중 라인 추론** — 다음 챕터 쓰기 전 현재 정사(正史) 기반으로 2~5개 격리된 미래 분기 생성, Studio Chat에서 챕터 비트·인물 결정·예상 변화·위험·작가 의도 매칭도 가로 비교. 분기 채택 시 `selected-branch-plan.md` 후보 계획만 저장, 정문·개요·정사 상태 수정 안 함; 정사 변경 후 기존 추론은 만료 표시.

**InkOS Short** — Studio Chat과 CLI가 독립 단편 직접 산출: 완전 본문·개요 기록·심사 기록·소개/셀링 포인트·표지 프롬프트, 표지 서비스 설정 시 표지 이미지 생성.

**InkOS Play** — 오픈 월드·분기 인터랙티브 신규. 자연어로 월드 계약·시간 진행 방식·캐릭터 에이전트·아이템/증거/관계 규칙·비주얼 스타일 지정; 시스템이 월드 상태·클릭 선택·자유 액션·HUD·자동 일러스트 유지.

**Studio Chat** — 일반 채팅·건북·단편·표지·인터랙티브 월드가 같은 action surface를 공유. 중요 액션 선확인, 산출물 프리뷰 가능, 채팅으로 챕터·표지 프롬프트·월드 상태·지속성 텍스트 산출물 수정.

**Native English novel writing now supported！** `--lang en` 지정해 영문 집필. 자세한 건 [English README](README.en.md) 참고.

## 커뮤니티

> 현재 업데이트가 비교적 빈번합니다. 지속적으로 기능을 추가하고 집필 효과를 최적화할 예정입니다.
> 이슈 피드백·요청 제안 환영, 프로젝트 동향 구독도 환영 — 우리의 목표는 소설 기반 콘텐츠 생태계 최강의 창작 AI Agent를 만드는 것입니다.

<p align="center">
  <img src="assets/wechat-group-v23.jpg" width="300" alt="위챗 단체 대화방">
</p>

## 빠른 시작

### 설치

```bash
npm i -g @actalk/inkos
```

### OpenClaw로 사용 🦞

InkOS는 [OpenClaw](https://clawhub.ai/narcooo/inkos) Skill로 배포되어, 호환되는 모든 Agent(Claude Code, OpenClaw 등)가 직접 호출 가능:

```bash
clawhub install inkos          # ClawHub에서 InkOS Skill 설치
```

npm 설치나 프로젝트 클론 시 `skills/SKILL.md`가 포함되어 있어, 🦞가 바로 읽을 수 있음 — 별도 ClawHub 설치 불필요.

설치 후 Claw는 공유 상호작용 입구를 통해 InkOS 호출 권장:

```bash
inkos interact --json --message "현재 책 계속 쓰는데 리듬을 더 조여줘"
```

이 입구는 프로젝트 TUI와 같은 인터랙션 실행 커널을 공유하므로 OpenClaw·TUI·Studio가 같은 제어 브레인을 공유. 현재 JSON 출력엔 assistant 텍스트 응답과 interaction session 정보 포함; 실제 실행 결과는 툴 결과와 낙서(落盘) 파일 기준, 모델 구두 선언으로 완료 여부 추론하지 않음.

`plan chapter` / `compose chapter` / `draft` / `audit` / `revise` / `write next` 등 원자 명령어는 여전히 유지되나, OpenClaw의 주(主) 진입점보다는 하위 도구에 더 적합. [ClawHub](https://clawhub.ai)에서 `inkos` 검색해 온라인 열람 가능.

### Agent Skills

InkOS는 표준 `SKILL.md`를 전문 능력 확장으로 직접 사용, InkOS 전용 Skill 프로토콜 별도 유지 안 함. Skill은 Chat Agent에 전문 설명과 정적 참고 자료만 제공, 실행 권한 추가 안 함; 생성·쓰기·편집·이미지 생성은 여전히 InkOS 툴과 확인 게이트가 제어.

사용 방식:

- 표준 디렉토리에 배치: 프로젝트 `skills/`, `.agents/skills/`, 또는 유저 디렉토리 `~/.agents/skills/`, `~/.openclaw/skills/`. Studio도 `SKILL.md` 포함 완전한 폴더와 정적 참고 자료 임포트 가능; 프로젝트 임포트는 `.agents/skills/`에 통합 저장.
- 또는 `INKOS_SKILL_DIRS=/abs/path/to/skills` 설정, 단일 skill 디렉토리 또는 여러 skill 서브디렉토리를 포함한 디렉토리 지정 가능. 여러 디렉토리는 시스템 구분자로 분리.
- Chat에서 `@skill-id`로 당회 강제 사용, 예: `@detective-play 증거 사슬 주도 오픈 월드 만들기`.
- `@skill-id` 미작성 시 Chat Agent가 현재 사용자 의도에 따라 `use_skill` 호출 여부 결정; 세션 타입·키워드·문자열 포함 매칭으로 기계적 활성화 안 함.
- 외부 Skill은 지시문과 정적 참고 자료만 제공, InkOS가 그 안의 스크립트를 자동 실행하지 않음; 기존 툴 권한·확인 게이트도 우회하지 않음.

프롬프트 구성은 Skill이 아님. Studio의 **프로젝트 설정 → 프롬프트**가 prompt packs 별도 관리, 프로젝트 레벨 오버라이드 파일은 `prompt/<pack>/<prompt>.md`에 기록, 예: `prompt/play/renderer.md`, `prompt/longform/writer.md`.

최소 `SKILL.md` 예시:

```md
---
name: Detective Play
description: Detective evidence and suspect-board play.
---
Use evidence chains; do not turn clues into generic atmosphere.
```

### 설정

현재 InkOS는 LLM 설정을 두 가지 명확한 경로로 분리: **Studio는 시각화 서비스 설정**, **CLI/daemon/배포 환경은 env 오버라이드 지원**. 서로 오염되지 않음.

#### 방식 1: Studio 서비스 설정 (권장)

로컬 집필·웹 워크벤치·시각화 관리에 적합.

```bash
inkos init my-novel
cd my-novel
inkos
```

Studio 열고 '모델 설정' 진입:

1. 서비스 공급자 선택, 예: Google Gemini, Moonshot, MiniMax, 지푸(智谱), 바이리엔(百炼) 또는 커스텀 엔드포인트.
2. API Key 붙여넣기, '연결 테스트' 클릭.
3. 사용 가능 모델 선택, 설정 저장.
4. 책 페이지로 돌아가 집필 시작.

Studio 런타임은 오직 다음만 사용:

```text
provider bank 기본값
→ inkos.json 안의 services / 현재 service / defaultModel
→ .inkos/secrets.json 안의 service API Key
```

`~/.inkos/.env`나 프로젝트 `.env`가 감지돼도 Studio는 프롬프트만 표시, env로 service·model·baseUrl·API Key 덮어쓰지 않음. API Key는 프로젝트 내부 `.inkos/secrets.json`에 저장, `inkos.json`엔 기록 안 함.

#### 방식 2: CLI / daemon / 배포 환경 env 설정

터미널 배치·서버 배포·CI·Docker·데몬·일회성 모델 전환에 적합.

글로벌 env:

```bash
inkos config set-global \
  --provider <openai|anthropic|custom> \
  --base-url <API 주소> \
  --api-key <내 API Key> \
  --model <모델명>
```

직접 `~/.inkos/.env`나 프로젝트 `.env` 작성도 가능:

```bash
INKOS_LLM_PROVIDER=custom
INKOS_LLM_BASE_URL=https://api.moonshot.cn/v1
INKOS_LLM_API_KEY=sk-...
INKOS_LLM_MODEL=kimi-k2.5

# 선택 사항
INKOS_LLM_SERVICE=moonshot                         # 권장; 안 쓰면 baseUrl에서 자동 식별 시도
INKOS_LLM_TEMPERATURE=0.7
INKOS_LLM_THINKING_BUDGET=0
INKOS_DEFAULT_LANGUAGE=zh
INKOS_LLM_EXTRA_top_p=0.9
```

CLI 합성 순서:

```text
Studio/project service 설정
→ .inkos/secrets.json service key
→ global ~/.inkos/.env
→ project .env
→ 현재 프로세스 환경 변수
→ CLI 파라미터
```

즉, CLI는 기본적으로 Studio가 세팅한 서비스와 키를 재사용; env에 `INKOS_LLM_SERVICE`, `INKOS_LLM_MODEL`, `INKOS_LLM_BASE_URL`, `INKOS_LLM_API_KEY` 선언 시 오버라이드 레이어로 작동. 기존 env가 `baseUrl + model + apiKey`만 써도 계속 사용 가능, InkOS가 baseUrl에서 service 역추적 시도.

일회성 서비스·모델 지정:

```bash
inkos write next --service google --model gemini-2.5-flash
inkos write next --service moonshot --model kimi-k2.5 --no-stream
inkos agent "다음 장 계속 써줘" --api-key-env MOONSHOT_API_KEY
inkos doctor --service minimaxCodingPlan --model MiniMax-M2.7
```

`--service`는 provider bank에서 baseUrl·프로토콜·호환 전략 자동 추론; `--model`은 최종 service 소속이어야 함, 아니면 바로 에러 — Kimi 모델을 Gemini로 보내는 오배치 방지.

#### 방식 3: 다중 모델 라우팅 (선택)

각 Agent에 다른 모델·Provider 할당, 품질·비용 필요에 따라 균형:

```bash
# 각 agent에 다른 모델/공급자 구성
inkos config set-model writer <model> --provider <provider> --base-url <url> --api-key-env <ENV_VAR>
inkos config set-model auditor <model> --provider <provider>
inkos config show-models        # 현재 라우팅 조회
```

개별 구성되지 않은 Agent는 자동으로 글로벌 모델 폴백.

#### 설정 트러블슈팅

```bash
inkos doctor
```

`doctor`가 현재 effective config mode, service/model/API Key 출처 표시, API 연결성 테스트. 일반적인 모드:


| 모드               | 의미                                        |
| ---------------- | ----------------------------------------- |
| `studio-project` | Studio 런타임: Studio/project 설정과 secrets만 사용 |
| `cli-project`    | CLI 런타임: Studio 설정을 베이스로 env와 CLI 파라미터 중첩   |
| `legacy-env`     | 구 env 모드: 과거 프로젝트 순수 `.env` 설정 호환                |


서비스 테스트 실패 시 우선 서비스 공급자·모델·프로토콜 매칭 여부 확인. Google Gemini의 AI Studio API Key는 Gemini OpenAI-compatible 엔드포인트에 직접 사용 가능; InkOS가 Google 미지원 OpenAI `store` 파라미터 자동 비활성화. MiniMax는 공식 OpenAI-compatible `/v1/chat/completions` 기본 사용, 가급적 작동하는 논스트리밍 transport 우선 사용해 스트리밍이 usage만 반환하고 본문 없는 문제 회피; `MiniMax-M3*`는 thinking 반환 기본 끔, M2.x thinking은 업스트림 제한으로 끌 수 없음.

### LLM 설정 업데이트

- **Studio / CLI 설정 격리**: Studio는 서비스 페이지 설정과 `.inkos/secrets.json` 고정 사용; CLI, daemon, 배포 환경은 env 오버라이드와 일회성 명령 파라미터 지원.
- **Provider bank 능력표**: Google Gemini, Moonshot, MiniMax, 지푸(智谱), 바이리엔(百炼), DeepSeek, 실리콘플로우(硅基流动), 화산(火山), 텐센트 혼위안(腾讯混元), 원신(文心), 순페이 싱후어(讯飞星火), OpenRouter, kkaiapi, Ollama, CodingPlan 등 서비스의 baseUrl·프로토콜·모델·호환 전략 내장.
- **모델 귀속 검증**: `--service google --model kimi-k2.5` 같은 오배치 즉시 에러, 요청이 잘못된 서비스 공급자로 가는 것 방지.
- **Google Gemini 호환 수정**: AI Studio API Key를 Gemini OpenAI-compatible 엔드포인트에 직접 사용 가능, InkOS가 Google 미지원 OpenAI `store` 파라미터 자동 비활성화.
- **MiniMax transport 탐지**: MiniMax / MiniMax CodingPlan이 공식 OpenAI-compatible `/v1` 입구 사용, 자동으로 작동하는 논스트리밍 transport 사용해 스트리밍이 usage 정상이지만 본문 비는 문제 회피.
- **구 env 호환**: 예전 `INKOS_LLM_BASE_URL + INKOS_LLM_MODEL + INKOS_LLM_API_KEY` 여전히 CLI 사용 가능; `INKOS_LLM_SERVICE` 없을 때 baseUrl에서 서비스 공급자 역추적 시도.

### 현재 상호작용 진입점

**Studio Chat + CLI + TUI가 같은 실행면 공유**

- **Studio Chat**: 토론·건북·단편·표지·Play·지속성 파일 편집이 같은 대화 입구에서 발동; 중요 액션 전 확인 카드 표시.
- **시작하기 진입점**: 장편 소설·단편 소설·동인 창작·외전 창작·모방 창작·계승 창작·분기 인터랙티브·오픈 월드가 Studio 상단 입구에서 진입 가능.
- **TUI 대시보드**: `inkos tui`로 터미널 풀스크린 인터랙션 진입, 키보드 흐름 유저에 적합.
- **외부 Agent 입구**: `inkos interact --json --message "..."`는 OpenClaw/타 Agent의 구조화된 입구.
- **원자 명령어 보존**: `plan` / `compose` / `draft` / `audit` / `revise` / `write next`는 여전히 스크립트·고급 유저에 적합.

### 첫 책 쓰기

```bash
inkos book create --title "삼천마제" --genre xuanhuan  # 새 책 만들기
inkos write next 삼천마제      # 다음 장 쓰기 (초안 → 심사 → 설정에 따라 수정)
inkos status                   # 상태 보기
inkos review list 삼천마제     # 초안 검토
inkos review approve-all 삼천마제  # 일괄 승인
inkos export 삼천마제          # 전체 책 내보내기
inkos export 삼천마제 --format epub  # EPUB 내보내기 (휴대폰/Kindle 읽기)
```

### 완전한 단편 쓰기

바로 완전한 단편 생성하고 싶으면 Studio 대화에서:

```text
12챕터 단편 써줘, 방향: 도시 결혼 반전, 여주가 장부 증거 얻은 뒤 역습.
```

CLI로도 가능:

```bash
inkos short run \
  --direction "도시 단편 결혼 반전 여주 증거 역습" \
  --chapters 12 \
  --chars 1000
```

생성물은 `shorts/<이야기명>/final/`에 떨어지며 `full.md`, `sales-package.md`, `cover-prompt.md` 포함, 표지 서비스 설정 시 `cover.png`도 생성.

### 표지만 따로 만들기

이미 있는 제목이나 시놉시스에 표지만 만들고 싶으면, 단편 본문 다시 돌릴 필요 없이 Studio 대화에서:

```text
'이혼 합의서 서명하던 날, 그가 후회에 미쳤다' 단편 표지 생성해줘, 현대 도시·강한 반전 느낌.
```

표지 툴이 독립적으로 `covers/<제목>/cover-prompt.md`와 `covers/<제목>/cover.png` 생성. 표지 서비스 아직 설정 안 했다면 Studio 모델 설정에서 표지 서비스와 API Key 먼저 설정.

생성 후 채팅으로 표지 프롬프트 계속 수정 가능, 예: '인물 더 당겨줘, 제목 글자 더 크게, 표정 더 냉소적으로'. 시스템이 새 `coverPrompt`로 `cover-prompt.md` 다시 쓰고 표지 재생성, 단편 본문 다시 쓸 필요 없음.


### 오픈 월드 / 분기 인터랙티브 시작

Studio Chat에서 '오픈 월드' 또는 '분기 인터랙티브' 선택, 자연어로 원하는 월드 묘사:

```text
와우 스타일 변경 초소 오픈 월드 만들어줘. 시간 고정 턴 아냐, 순찰 1시간, 수련 며칠 건너뛰기 가능. 장비 희귀도 있지만 수치 패널 없음, 재질과 광택으로 표현.
```

시스템이 월드·캐릭터·아이템·증거·관계·현재 씬·가능 액션 생성. 오픈 월드는 자유 입력 액션 지원; 분기 인터랙티브는 클릭 선택지 제공. 표지/이미지 서비스 설정 시 캐릭터·아이템·증거·씬 모두 이미지 생성 가능, 대화 흐름에서 스크롤 표시.

---

## 핵심 특징

### Studio Chat + Action Surface

Studio Chat이 더 이상 단순 질의응답창 아님. 장편 생성·단편 실행·표지 생성·Play 시작·지속성 텍스트 파일 편집 가능, 중요 액션 실행 전 확인 요청. 일반 대화는 바로 답변, 명확한 창작 액션만 툴 실행 진입.

### InkOS Play: 오픈 월드와 분기 인터랙티브

Play가 지속 추진 가능한 월드 상태 유지: 캐릭터·장소·아이템·증거·관계·시간·씬·HUD. 고정 RPG 템플릿이 아니라, 자연어로 월드 계약 정의: 무협 장비에 희귀감 부여, 연애물에 설렘 레벨, 탐정물에 증거 생명주기. 시스템이 이 규칙을 월드 상태에 기록해 후속 서사와 일러스트에 활용.

### 다차원 심사 + 탈 AI 맛

연속성 심사관이 매 챕터 초안을 37개 차원에서 검사: 캐릭터 기억·물자 연속성·복선 회수·개요 이탈·서사 리듬·감정 아크 등. 내장 AI 흔적 탐지 차원으로 'LLM 맛' 표현 자동 식별(고빈도 어휘, 단조로운 문장, 과도한 요약). 기본 장편 집필 파이프라인 최대 자동 수정 1회; 자동 폐환(클로저) 더 원하면 `writing.reviewRetries`로 수정 횟수 조절.

탈 AI 맛 규칙은 작가 에이전트의 프롬프트 레이어에 내장 — 어휘 피로도 사전, 금지 문장, 문체 지문 주입, 소스에서 AI 생성 흔적 감소. `revise --mode anti-detect`로 기존 챕터 대상 전문 안티-탐지 리라이팅 가능.

### 문체 모방

`inkos style analyze`가 참고 텍스트 분석해 통계 지문(문장 길이 분포, 단어 빈도 특징, 리듬 패턴)과 LLM 스타일 가이드 추출. `inkos style import`로 지문을 지정 책에 주입, 이후 모든 챕터가 자동으로 해당 문체 채택, 수정자도 문체 표준으로 심사.

### 창작 브리프

`inkos book create --brief my-ideas.md`로 뇌구멍·세계관 설정·인물 설정 문서 전달. 건축가 에이전트가 브리프 기반으로 스토리 설정(`story_bible.md`)과 창작 규칙(`book_rules.md`) 생성, 함부로 창작 안 함; 동시에 브리프를 `story/author_intent.md`에 낙서해 이 책의 장기 창작 의도가 건북 때만 일회성으로 효력 나는 것 아님.

### 입력 거버넌스 컨트롤 패널

각 책에 두 가지 장기 편집 가능 Markdown 컨트롤 문서:

- `story/author_intent.md`: 이 책이 장기적으로 무엇이 되고 싶은가
- `story/current_focus.md`: 최근 1~3챕터 어디에 주의를 끌 것인가

집필 전 먼저 실행:

```bash
inkos plan chapter 삼천마제 --context "이번 챕터엔 주의를 사제 갈등으로 돌려"
inkos compose chapter 삼천마제
```

이렇게 `story/runtime/chapter-XXXX.intent.md`, `context.json`, `rule-stack.yaml`, `trace.json` 생성. `intent.md`는 사람이 보고, 나머지 파일은 시스템 실행·디버깅용. `plan`이 LLM 호출해 챕터 의도 생성; `compose`는 로컬 문서·상태만 컴파일, API Key 설정 전에도 입력 거버넌스 결과 미리 검증 가능.

### 글자 수 거버넌스

`draft`, `write next`, `revise`가 같은 보수적 글자 수 거버넌스 공유:

- `--words`가 목표 글자 수 지정, 시스템이 허용 구간 자동 추론, 글자 단위 정밀 타격 보장 안 함
- 중문 기본 `zh_chars` 계산, 영문 기본 `en_words` 계산
- 본문이 허용 구간 초과 시 InkOS 최대 1회 보정 정규화(압축 또는 보충)만 수행, 본문 직접 하드 컷 안 함
- 1회 보정 후 여전히 하드 레인지 초과 시 챕터 정상 저장, 하지만 결과와 챕터 인덱스에 길이 warning/telemetry 기록

### 기존 작품 이어쓰기

`inkos import chapters`로 기존 소설 텍스트에서 챕터 임포트, 구조화 상태·챕터 요약·복선·캐릭터 관계·가독성 Markdown 투영 자동 재구축, `제X장`과 커스텀 분할 모드·브레이크포인트 연속 임포트 지원. 임포트 후 `inkos write next`로 이어쓰기 가능.

### 동인 창작

`inkos fanfic init --from source.txt --mode canon`으로 원작 소재에서 동인 책 생성. 네 가지 모드 지원: canon(정전 연장), au(평행 세계), ooc(성격 재구성), cp(커플링 지향). 정전 임포터·동인 전용 심사 차원·정보 경계 관리 내장 — 설정 모순 방지.

### 다중 모델 라우팅

각 Agent가 다른 모델·Provider 사용 가능. 작가는 Claude(창의적), 심사는 GPT-4o(저렴·빠름), 레이더는 로컬 모델(제로 코스트). `inkos config set-model`로 에이전트 단위 구성, 미구성 시 글로벌 모델 폴백.

### 데몬 + 알림 푸시

`inkos up`으로 백그라운드 루프 자동 집필 시작. 파이프라인이 처리 가능한 비핵심 이슈 자동 추진; 사람 판단 필요한 이슈는 정지 후 심사 결과 남김. 알림 푸시: Telegram, Feishu(飞书), WeCom(企业微信), Webhook(HMAC-SHA256 서명 + 이벤트 필터). 로그 `inkos.log`(JSON Lines) 기록, `-q` 무음 모드.

### 로컬 모델 호환

임의 OpenAI 호환 인터페이스 지원 (Studio에서 커스텀 서비스 추가, 또는 CLI `--provider custom` / `INKOS_LLM_PROVIDER=custom`). 서비스 테스트가 다양한 프로토콜·스트리밍 스위치 조합 시도, 사용 가능 transport 저장 또는 프롬프트. Fallback 파서가 소형 모델 비규격 출력 처리, 스트림 중단 시 부분 내용 자동 복구.

### 신뢰성 보장

매 챕터 자동 상태 스냅샷 생성, `inkos write rewrite`로 임의 챕터 롤백 가능. 작가 펜 들기 전 자검표(컨텍스트·자원·복선·리스크) 출력, 쓰기 완료 후 정산표 출력, 심사관이 교차 검증. 파일 락으로 동시 쓰기 방지. 쓰기 후 검증기에 챕터 간 중복 탐지와 십여 가지 하드 룰 자동 spot-fix 포함.

복선 시스템 Zod 스키마로 검증 — `lastAdvancedChapter`는 정수여야 함, `status`는 open/progressing/deferred/resolved만 허용. LLM 출력 JSON delta가 `applyRuntimeStateDelta`로 immutable 업데이트 + `validateRuntimeState` 구조 검증 후 기록. 불량 데이터 바로 거부, 눈덩이처럼 불어나지 않음.

모델 출력 상한은 provider bank의 모델 카드가 관리; `llm.extra` / `INKOS_LLM_EXTRA_*`의 예약 키(max_tokens, temperature, model, messages, stream 등) 자동 필터링해 핵심 요청 파라미터 의외 덮어쓰기 방지.

---

## 작동 원리

InkOS에 두 가지 주요 실행 라인: 장편/단편 생산 라인은 납품 가능한 텍스트 생성 담당; Play 실행 라인은 지속 인터랙티브 월드 담당. 모델 설정·Studio Chat·확인 액션·산출물 프리뷰 공유, 상태 구조는 다름.

<p align="center">
  <img src="assets/arch-system.svg" width="900" alt="InkOS 전체 시스템 아키텍처">
</p>

장편 매 챕터 기본 '기획 → 편곡 → 집필 → 심사 → 필요시 수정 → 상태 동기화'로 실행:

<p align="center">
  <img src="assets/arch-pipeline.svg" width="900" alt="InkOS 챕터 생산 파이프라인">
</p>


| 에이전트               | 역할                                                                |
| ------------------- | ----------------------------------------------------------------- |
| **레이더 Radar**        | 플랫폼 트렌드·독자 선호도 스캔, 스토리 방향 가이드 (플러그인 가능, 생략 가능)                                       |
| **플래너 Planner**     | 작가 의도 + 현재 포커스 + 기억 검색 결과 읽고 본 챕터 의도 산출 (must-keep / must-avoid)             |
| **컴포저 Composer**    | 구조화 상태·컨트롤 문서·Markdown 투영에서 태스크 단위 컨텍스트 선별, 룰 스택·런타임 산출물 컴파일                     |
| **아키텍트 Architect**   | 건북·임포트·외전 초기화 때 기초 설정 생성: 스토리 프레임·규칙·캐릭터·장기 컨트롤 파일                              |
| **라이터 Writer**       | 편곡 후 압축 컨텍스트 기반 본문 생성 (글자 수 거버넌스 + 대화 가이드)                                      |
| **옵서버 Observer**    | 본문에서 9가지 사실 과잉 추출 (캐릭터·위치·자원·관계·감정·정보·복선·시간·물리 상태)                      |
| **리플렉터 Reflector**   | JSON delta 출력 (전량 markdown 아님), 코드 레이어에서 Zod 스키마 검증 후 immutable 기록    |
| **노멀라이저 Normalizer** | 본문이 하드 레인지 명백히 이탈할 때만 단일 pass 압축/확장                                 |
| **연속성 오디터 Auditor**  | 구조화 상태·컨트롤 문서·챕터 컨텍스트 대조 초안 검증, 연속성·품질 검사 실행                                 |
| **리바이저 Reviser**     | 심사 발견 중요 문제 수정; 기본 최대 자동 수정 1회, `writing.reviewRetries`로 조절 가능, 그 외 문제는 사람 심사 표기 |


심사 불통과 시 기본 파이프라인 '수정 → 재심사' 1회만 수행; 여전히 해결 안 된 문제는 결과와 상태에 남겨 사람이나 후속 명령이 이어 처리. 더 강한 자동 폐환 필요 시 `inkos config set writing.reviewRetries 3`로 수정 라운드 늘리기.

### 장기 기억

각 책의 권위 기억은 세 레이어로 구성:


| 레이어                    | 용도                                                                                          |
| -------------------- | ------------------------------------------------------------------------------------------- |
| `story/state/*.json` | 권위 구조화 상태: 현재 상태·복선·챕터 요약 등, Zod 스키마 검증 통과                                                      |
| `story/*.md`         | 인간 가독 투영: `current_state.md`, `pending_hooks.md`, `chapter_summaries.md`, `character_matrix.md` 등 |
| `story/memory.db`    | Node 22+ 자동 활성화 SQLite 시계열 기억 DB, 관련 사실·복선·요약 검색용                                                  |


연속성 오디터가 이 상태들 대조해 매 챕터 초안 검사. 캐릭터가 '직접 본 적 없는 일을 기억해내거나', 두 챕터 전 이미 잃어버린 무기를 '다시 꺼내드는' 상황 포착.

Settler가 모델에게 전체 markdown 파일 출력 요구 안 함, 대신 JSON delta 출력 → 코드 레이어에서 immutable apply + 구조 검증 후 기록. Markdown 파일은 인간 가독 투영으로 보존. 구(舊) 책 최초 실행 시 legacy Markdown에서 구조화 JSON으로 자동 마이그레이션.

Node 22+ 환경에서 SQLite 시계열 기억 DB(`story/memory.db`) 자동 활성화, 연관성 기반 과거 사실·복선·챕터 요약 검색 지원, 전량 주입으로 인한 컨텍스트 팽창 방지.

<p align="center">
  <img src="assets/arch-memory.svg" width="900" alt="InkOS 장기 기억과 상태">
</p>

### 컨트롤 패널과 런타임 산출물

런타임 상태 외에 InkOS는 '가드레일'과 '커스터마이징'을 검토 가능한 컨트롤 레이어로 분리:

- `story/author_intent.md`: 장기 작가 의도
- `story/current_focus.md`: 현재 단계 포커스
- `story/runtime/chapter-XXXX.intent.md`: 본 챕터 목표·보존 항목·회피 항목·충돌 처리
- `story/runtime/chapter-XXXX.context.json`: 본 챕터 실제 채택된 컨텍스트
- `story/runtime/chapter-XXXX.rule-stack.yaml`: 본 챕터 우선순위 레이어·오버라이드 관계
- `story/runtime/chapter-XXXX.trace.json`: 본 챕터 입력 컴파일 궤적

이렇게 `brief`·권 개요·책 레벨 규칙·현재 태스크가 한 덩어리 프롬프트로 뭉치지 않고, 먼저 컴파일 → 집필.

### 창작 규칙 시스템

작가 에이전트 내장 ~25조 통용 창작 규칙 (인물 조형·서사 기법·논리 자화·언어 제약·탈 AI 맛), 전 장르 적용.

이 기반 위에 각 장르 전용 규칙 (금기·언어 제약·리듬·심사 차원), 각 책 독립 `book_rules.md` (주인공 인설·수치 상한·커스텀 금지), `story_bible.md` (세계관 설정), `author_intent.md` (장기 방향), `current_focus.md` (근래 포커스). `volume_outline.md`는 여전히 기본 플래닝이나, v2 입력 거버넌스 모드에서 현재 태스크 의도를 천연스럽게 압도하지 않음.

## 사용 모드

InkOS가 네 가지 상호작용 방식 제공, 하부는 같은 원자 연산 공유:

### 1. 완전 파이프라인 (원클릭)

```bash
inkos write next 삼천마제          # 초안 → 심사 → 설정에 따라 자동 수정
inkos write next 삼천마제 --count 5 # 연속 5챕터 쓰기
```

`write next` 이제 기본적으로 `plan -> compose -> write` 입력 거버넌스 체인 수행, 심사 후 자동 수정 라운드 기본 1회. 구(舊) 프롬프트 조립 경로로 롤백 필요 시 `inkos.json`에 명시적 설정:

```json
{
  "inputGovernanceMode": "legacy"
}
```

기본값 `v2`. `legacy`는 명시적 폴백으로만 보존.

### 2. 원자 명령어 (조합 가능, 외부 Agent 호출에 적합)

```bash
inkos plan chapter 삼천마제 --context "이번 챕터 포인트는 사제 갈등" --json
inkos compose chapter 삼천마제 --json
inkos draft 삼천마제 --context "이번 챕터 포인트는 사제 갈등" --json
inkos audit 삼천마제 31 --json
inkos revise 삼천마제 31 --json
```

각 명령어 독립 단일 연산 수행, `--json` 구조화 데이터 출력. `plan` / `compose`가 컨트롤 입력 담당, `draft` / `audit` / `revise`가 본문·품질 체인 담당. 외부 AI Agent가 `exec`로 호출 가능, 스크립트 오케스트레이션에도 적합.

### 3. 자연어 Agent 모드

```bash
inkos agent "도시 수정仙(수선) 소설 써줘, 주인공은 프로그래머"
inkos agent "다음 장 써줘, 사제 갈등에 포커스"
inkos agent "먼저 시장 트렌드 스캔하고, 결과 바탕으로 새 책 만들어"
```

Agent 모드는 현재 세션 타입에 따라 도구 세트 노출: 건북·컨트롤 패널 읽기/쓰기·기획·편곡·집필·심사·수정·단편·표지·Play 등 능력 세션 타입별 오픈. 권장 Agent 워크플로: 컨트롤 패널 조정 → `plan` / `compose` → 초안 쓸지 완전 파이프라인 돌릴지 결정.

### 4. Studio Play 모드

Studio의 '오픈 월드'와 '분기 인터랙티브'는 인터랙티브 창작 입구. 먼저 책 만들 필요 없음, RPG 수치 하드코딩 불필요. "월드 어떻게 굴러가는가, 시간 어떻게 진행되는가, 캐릭터 자율 행동 여부, 아이템·증거가 스토리에 어떻게 영향 주는가" 묘사하면 시스템이 계속 플레이 가능한 월드 생성, 매 턴 상태 로컬에 기록.

## Studio 실측 스크린샷 & 생성 결과

<p align="center">
  <img src="assets/studio-dashboard.png" width="760" alt="InkOS Studio 시작하기 입구">
</p>

<p align="center">
  <strong>InkOS Short 휴대폰 표지</strong><br>
  <img src="assets/inkos-short-demo-cover.png" width="260" alt="단편 표지">
</p>

<p align="center">
  <strong>InkOS Play 연애 인터랙티브</strong><br>
  <img src="assets/play-openworld-romance.png" width="560" alt="연애 인터랙티브">
</p>

<p align="center">
  <strong>InkOS Play 탐정 인터랙티브</strong><br>
  <img src="assets/play-openworld-detective.png" width="560" alt="탐정 인터랙티브">
</p>

<p align="center">
  <strong>InkOS Play 아이템 일러스트</strong><br>
  <img src="assets/play-item-warcraft.png" width="560" alt="아이템 일러스트">
</p>

첫 번째는 현재 Studio 로컬 실측 스크린샷. 뒤 네 장은 InkOS Short와 InkOS Play의 실제 로컬 생성 결과: 단편 표지는 모바일 썸네일 클릭용, Play 이미지는 오픈 월드·탐정 증거·인터랙티브 씬·아이템 비주얼 능력 시연용.

## 명령어 레퍼런스


| 명령어                                          | 설명                                                                                         |
| ------------------------------------------- | ------------------------------------------------------------------------------------------ |
| `inkos init [name]`                         | 프로젝트 초기화 (name 생략 시 현재 디렉토리 초기화)                                                                    |
| `inkos book create`                         | 새 책 생성 (`--genre`, `--platform`, `--chapter-words`, `--target-chapters`, `--brief <file>`로 창작 브리프 전달) |
| `inkos book update [id]`                    | 책 설정 수정 (`--chapter-words`, `--target-chapters`, `--status`)                                    |
| `inkos book list`                           | 모든 책 나열                                                                                     |
| `inkos book delete <id>`                    | 책 및 전체 데이터 삭제 (`--force` 확인 건너뛰기)                                                                  |
| `inkos genre list/show/copy/create`         | 장르 조회·복사·생성                                                                                 |
| `inkos plan chapter [id]`                   | 다음 챕터 `intent.md` 생성 (`--context` / `--context-file`로 현재 지시 전달)                                  |
| `inkos compose chapter [id]`                | 다음 챕터 `context.json`, `rule-stack.yaml`, `trace.json` 생성                                       |
| `inkos write next [id]`                     | 완전 파이프라인 다음 챕터 집필 (`--words` 글자 수 오버라이드, `--count` 연속 집필, `-q` 무음 모드)                                            |
| `inkos write rewrite [id] <n>`              | N챕터 재작성 (상태 스냅샷 복구, `--force` 확인 건너뛰기, `--words` 글자 수 오버라이드)                                              |
| `inkos draft [id]`                          | 초안만 집필 (`--words` 글자 수 오버라이드, `-q` 무음 모드)                                                             |
| `inkos audit [id] [n]`                      | 지정 챕터 심사                                                                                     |
| `inkos revise [id] [n]`                     | 지정 챕터 수정                                                                                     |
| `inkos agent <instruction>`                 | 자연어 Agent 모드                                                                              |
| `inkos review list [id]`                    | 초안 검토                                                                                       |
| `inkos review approve-all [id]`             | 일괄 승인                                                                                       |
| `inkos status [id]`                         | 프로젝트 상태                                                                                       |
| `inkos export [id]`                         | 책 내보내기 (`--format txt/md/epub`, `--output <path>`, `--approved-only`)                           |
| `inkos radar scan`                          | 플랫폼 트렌드 스캔                                                                                     |
| `inkos fanfic init`                         | 원작 소재로 동인 책 생성 (`--from`, `--mode canon/au/ooc/cp`)                                              |
| `inkos short run`                           | 독립 단편 패키지 생성 (본문·소개/셀링 포인트·표지 프롬프트·선택적 표지 이미지)                                                               |
| `inkos eval [id]`                           | 품질 평가 리포트 생성 (`--json`, 챕터 범위 지원)                                                                 |
| `inkos consolidate [id]`                    | 장편 챕터 요약 통합, 긴 책 컨텍스트 압력 완화                                                                         |
| `inkos forecast create/show/select`          | 장편 비정사 플롯 분기 생성·검증·선택; 선택 시 후보 계획만 저장, 정사 수정 안 함                                                        |
| `inkos interact`                            | 외부 agent / CLI 자연어 입구 (`--json`, `--message`, `--book`)                                       |
| `inkos config set-global`                   | CLI / daemon / 배포 환경 글로벌 LLM env 설정 (`~/.inkos/.env`)                                         |
| `inkos config show-global`                  | 글로벌 설정 조회                                                                                     |
| `inkos config set/show`                     | 프로젝트 설정 조회/갱신                                                                                  |
| `inkos config set-model <agent> <model>`    | 지정 agent 모델 오버라이드 (`--base-url`, `--provider`, `--api-key-env` 다중 Provider 라우팅 지원)                |
| `inkos config remove-model <agent>`         | agent 모델 오버라이드 제거 (기본값 폴백)                                                                       |
| `inkos config show-models`                  | 현재 모델 라우팅 조회                                                                                   |
| `inkos doctor`                              | 설정 문제 진단 (effective config mode·출처·API 연결성·공급업체 호환성 힌트 표시)                                       |
| `inkos detect [id] [n]`                     | AIGC 탐지 (`--all` 전 챕터, `--stats` 통계)                                                         |
| `inkos style analyze <file>`                | 참고 텍스트 분석해 문체 지문 추출                                                                               |
| `inkos style import <file> [id]`            | 문체 지문 지정 책에 임포트                                                                                 |
| `inkos import canon [id] --from <parent>`   | 정전 정사(正史)를 외전 책에 임포트                                                                                 |
| `inkos import chapters [id] --from <path>`  | 기존 챕터 임포트해 이어쓰기 (`--split`, `--resume-from`)                                                        |
| `inkos analytics [id]` / `inkos stats [id]` | 책 데이터 분석 (심사 통과율·고빈도 문제·챕터 랭킹·토큰 사용량)                                                           |
| `inkos update`                              | 최신 버전으로 업데이트                                                                                    |
| `inkos studio` / `inkos`                    | 웹 워크벤치 시작 (`-p` 포트 지정, 기본 4567; Studio는 서비스 페이지 설정 사용, env 오버라이드 안 함)                                    |
| `inkos tui`                                 | 터미널 풀스크린 TUI 시작                                                                                 |
| `inkos up / down`                           | 데몬 시작/정지 (`-q` 무음 모드, 자동 `inkos.log` 기록)                                                      |


`[id]` 파라미터는 프로젝트에 책이 한 권뿐일 때 생략 가능, 자동 감지. 모든 명령어 `--json` 구조화 데이터 출력 지원. `draft` / `write next` / `plan chapter` / `compose chapter`는 `--context`로 창작 가이드 전달, `--words`로 챕터당 목표 글자 수 오버라이드. `book create`는 `--brief <file>`로 창작 브리프 전달(뇌구멍/설정 문서), Architect가 이 기반으로 설정 생성, 함부로 창작 안 함. `plan chapter`는 LLM 호출해 챕터 의도 생성; `compose chapter`는 온라인 LLM 불필요, API Key 설정 전에도 입력 거버넌스 결과 선검증 가능.

CLI 런타임은 일회성 LLM 오버라이드 파라미터도 지원: `--service`, `--model`, `--api-key-env`, `--base-url`, `--api-format <chat|responses>`, `--stream`, `--no-stream`. 예:

```bash
inkos write next --service google --model gemini-2.5-flash
inkos up --service moonshot --model kimi-k2.5 --api-key-env MOONSHOT_API_KEY
```

## 로드맵

- ~~`packages/studio` 웹 UI 워크벤치 (Vite + React + Hono)~~ — 이미 릴리스, `inkos` 또는 `inkos studio`로 시작
- ~~인터랙티브 노벨 / 오픈 월드 (분기 서사 + 자유 액션 + 자동 일러스트)~~ — Studio Play 이미 구현
- 국소 개입 (반 챕터 재작성 + 후속 truth 파일 연쇄 업데이트)
- 커스텀 Agent 플러그인 시스템
- 플랫폼 포맷 내보내기 (기점(起点), 번개(番茄) 등)

## 기여 참여

코드 기여 환영. 이슈나 PR 올려주세요.

```bash
pnpm install
pnpm dev          # 감시 모드
pnpm test         # 테스트 실행
pnpm typecheck    # 타입 체크
```

## Star History

<a href="https://www.star-history.com/#Narcooo/inkos&type=date&legend=top-left">
  <picture>
    <source media="(prefers-color-scheme: dark)" srcset="https://api.star-history.com/svg?repos=Narcooo/inkos&type=date&theme=dark&legend=top-left" />
    <source media="(prefers-color-scheme: light)" srcset="https://api.star-history.com/svg?repos=Narcooo/inkos&type=date&theme=light&legend=top-left" />
    <img alt="Star History Chart" src="https://api.star-history.com/svg?repos=Narcooo/inkos&type=date&legend=top-left" />
  </picture>
</a>


## Skills Download History

<div align="center">

<a href="https://skill-history.com/narcooo/inkos">
  <img alt="Skills Download History" src="https://skill-history.com/chart/narcooo/inkos.svg" />
</a>

</div>

## Repobeats

![Repobeats analytics image](https://repobeats.axiom.co/api/embed/024114415c1505a8c27fb121e3b392524e48f583.svg)

## Contributors

<a href="https://github.com/Narcooo/inkos/graphs/contributors">
  <img src="https://contrib.rocks/image?repo=Narcooo/inkos" alt="Contributors" />
</a>

## 감사의 말

InkOS의 Agent 런타임은 [pi](https://github.com/badlogic/pi-mono)(`@mariozechner/pi-ai` 와 `@mariozechner/pi-agent-core`, 작성자 Mario Zechner) 위에 구축되었습니다. pi가 제공한 든든한 기반에 감사드립니다.

본 오픈소스 프로젝트는 [LINUX DO](https://linux.do/) 커뮤니티와 연계·인정되었습니다. 커뮤니티 멤버들의 피드백·테스트·토론에 감사드립니다.

## 라이선스

[AGPL-3.0](LICENSE)