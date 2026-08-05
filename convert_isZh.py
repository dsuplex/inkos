import re
import os

# Korean translations map (keyed by English text)
KO_TRANSLATIONS = {
    "Select Agent Skills": "Agent Skill 선택",
    "选择 Agent Skill": "Agent Skill 선택",
    "选择 Agent Skill": "Agent Skill 선택",
    "导入": "가져오기",
    "部分外部 Skill 未加载": "일부 외부 Skill을 불러오지 못했습니다",
    "Some external skills were not loaded": "일부 외부 Skill을 불러오지 못했습니다",
    "格式无效": "형식이 잘못되었습니다",
    "Invalid format": "형식이 잘못되었습니다",
    "加载 Skill...": "Skill 로딩 중...",
    "Loading skills...": "Skill 로딩 중...",
    "还没有可用 Skill。": "사용 가능한 Skill이 없습니다",
    "No skills available yet.": "사용 가능한 Skill이 없습니다",
    "选择模型": "모델 선택",
    "Select model": "모델 선택",
    "以下文件过大，未添加：": "다음 파일이 너무 커서 추가되지 않았습니다: ",
    "Some files were too large: ": "다음 파일이 너무 커서 추가되지 않았습니다: ",
    "选个玩法，进去再聊你想玩的世界。": "플레이 스타일을 선택하고, 채팅에서 원하는 세계를 설명하세요",
    "Pick a playstyle, then describe the world you want in chat.": "플레이 스타일을 선택하고, 채팅에서 원하는 세계를 설명하세요",
    "点着玩": "선택형",
    "Choices": "선택형",
    "GM 给选项，点着推进": "GM이 선택지를 주고 클릭으로 진행",
    "Pick from offered actions": "GM이 선택지를 주고 클릭으로 진행",
    "自由玩": "자유형",
    "Free": "자유형",
    "自己打字，想干嘛干嘛": "직접 입력하여 자유롭게 플레이",
    "Type anything you want": "직접 입력하여 자유롭게 플레이",
    "思考中...": "생각 중...",
    "Thinking...": "생각 중...",
    "重试上一条消息": "마지막 메시지 재시도",
    "Retry last message": "마지막 메시지 재시도",
    "添加 Skill": "Skill 추가",
    "Add skill": "Skill 추가",
    "上传图片或资料": "파일 첨부",
    "Attach files": "파일 첨부",
    "输入指令...": "명령 입력...",
    "Enter command...": "명령 입력...",
    "停止当前回复": "현재 응답 중지",
    "Stop": "중지",
    "加载模型...": "모델 로딩 중...",
    "Loading models...": "모델 로딩 중...",
    "配置模型 →": "모델 설정 →",
    "Set up models →": "모델 설정 →",
    "查看世界：持有 / 状态 / 关系": "세계 보기: 보유 / 상태 / 관계",
    "View world: holdings / state / relations": "세계 보기: 보유 / 상태 / 관계",
    "查看世界": "세계 보기",
    "View World": "세계 보기",
    "自动配图": "자동 일러스트",
    "Auto illustration": "자동 일러스트",
    "先在「模型配置」里配好生图 API 才能开启": "모델 설정에서 이미지 API를 먼저 구성해야 합니다",
    "Configure an image API in Model Settings first": "모델 설정에서 이미지 API를 먼저 구성해야 합니다",
    "为角色配图": "캐릭터",
    "Characters": "캐릭터",
    "为时刻配图": "순간",
    "Moments": "순간",
    "为背包配图": "인벤토리",
    "Inventory": "인벤토리",
    "未检测到生图 API。": "이미지 API가 감지되지 않았습니다",
    "No image API configured.": "이미지 API가 감지되지 않았습니다",
    "Skill 文件夹已导入": "Skill 폴더를 가져왔습니다",
    "Skill folder imported": "Skill 폴더를 가져왔습니다",
    "Agent Skills": "Agent Skill",
    "导入标准 SKILL.md 专业能力包。Chat 可以按意图自主使用，也可以在输入框用 + 号强制启用。": "표준 SKILL.md 전문가 패키지를 가져옵니다. 채팅이 의도에 따라 자동으로 사용하거나, 입력창에서 + 버튼으로 강제 활성화할 수 있습니다.",
    "Import standard SKILL.md expertise packages. Chat can choose a skill from intent, or you can force one from the + menu.": "표준 SKILL.md 전문가 패키지를 가져옵니다. 채팅이 의도에 따라 자동으로 사용하거나, 입력창에서 + 버튼으로 강제 활성화할 수 있습니다.",
    "导入外部 Skill": "외부 Skill 가져오기",
    "Import external skill": "외부 Skill 가져오기",
    "导入中...": "가져오는 중...",
    "Importing...": "가져오는 중...",
    "选择 Skill 文件夹": "Skill 폴더 선택",
    "Choose skill folder": "Skill 폴더 선택",
    "还没有 Skill。": "Skill이 없습니다",
    "No skills yet.": "Skill이 없습니다",
    "无说明": "설명 없음",
    "No description": "설명 없음",
    "Skill 已删除": "Skill이 삭제되었습니다",
    "Skill deleted": "Skill이 삭제되었습니다",
    "提示词": "프롬프트",
    "Prompt packs": "프롬프트",
    "集中查看和调整内置提示词。修改会保存为项目级覆盖文件，不会改动内置默认值。": "내장 프롬프트를 확인하고 조정합니다. 수정사항은 프로젝트 오버라이드 파일로 저장되며 기본값은 변경되지 않습니다.",
    "Review and tune built-in prompt packs. Edits are saved as project overrides without changing the defaults.": "내장 프롬프트를 확인하고 조정합니다. 수정사항은 프로젝트 오버라이드 파일로 저장되며 기본값은 변경되지 않습니다.",
    "没有可编辑提示词。": "편집 가능한 프롬프트가 없습니다",
    "No prompt packs available.": "편집 가능한 프롬프트가 없습니다",
    "已改": "수정됨",
    "custom": "수정됨",
    "当前来源": "현재 출처",
    "Source": "현재 출처",
    "提示词已恢复默认": "프롬프트가 기본값으로 복원되었습니다",
    "Prompt reset to default": "프롬프트가 기본값으로 복원되었습니다",
    "恢复默认": "기본값 복원",
    "Reset": "기본값 복원",
    "提示词已保存": "프롬프트가 저장되었습니다",
    "Prompt saved": "프롬프트가 저장되었습니다",
    "查看内置默认": "내장 기본값 보기",
    "View built-in default": "내장 기본값 보기",
    "选择左侧提示词后编辑。": "왼쪽에서 프롬프트를 선택한 후 편집하세요",
    "Select a prompt on the left to edit it.": "왼쪽에서 프롬프트를 선택한 후 편집하세요",
    "联网研究搜索服务": "연구 검색 제공자",
    "Research Search Provider": "연구 검색 제공자",
    "给 research_web 配置外部搜索 API。未配置时仍可用服务器环境变量 TAVILY_API_KEY 作为兜底。": "research_web에 외부 검색 API를 구성합니다. 구성하지 않으면 서버 환경 변수 TAVILY_API_KEY가 대체로 사용됩니다.",
    "Configure the external search API used by research_web. If unset, the server may still use TAVILY_API_KEY as a fallback.": "research_web에 외부 검색 API를 구성합니다. 구성하지 않으면 서버 환경 변수 TAVILY_API_KEY가 대체로 사용됩니다.",
    "启用项目级搜索配置": "프로젝트 수준 검색 구성 활성화",
    "Enable project-level search config": "프로젝트 수준 검색 구성 활성화",
    "搜索服务": "검색 서비스",
    "Provider": "검색 서비스",
    "API Key 环境变量名": "API 키 환경 변수명",
    "API key env var": "API 키 환경 변수명",
    "Base URL（可选，自定义兼容端点）": "Base URL (선택사항, 사용자 정의 호환 엔드포인트)",
    "Base URL (optional custom compatible endpoint)": "Base URL (선택사항, 사용자 정의 호환 엔드포인트)",
    "API Key（可选；留空则读环境变量）": "API 키 (선택사항, 비워두면 환경 변수 사용)",
    "API key (optional; leave blank to use env var)": "API 키 (선택사항, 비워두면 환경 변수 사용)",
    "可直接填 key，或只填环境变量名": "키를 직접 입력하거나 환경 변수명만 입력",
    "Paste key, or use env var only": "키를 직접 입력하거나 환경 변수명만 입력",
    "上传": "업로드",
    "Upload": "업로드",
    "已上传：": "업로드됨: ",
    "Uploaded: ": "업로드됨: ",
    "已创建翻译项目：": "번역 프로젝트 생성됨: ",
    "Created translation project: ": "번역 프로젝트 생성됨: ",
    "已导出 ": "내보냄 ",
    "Exported ": "내보냄 ",
    "用机翻填充缺失翻译": "누락된 번역을 기계 번역으로 채우기",
    "Fill missing translations via machine translation": "누락된 번역을 기계 번역으로 채우기",
    "翻译": "번역",
    "Translate": "번역",
    "翻译记忆": "번역 메모리",
    "Translation memory": "번역 메모리",
    "翻译管理": "번역 관리",
    "Translation manager": "번역 관리",
    "Agent 会按当前意图自主调用；点选 Skill 可强制它随下一条消息启用。": "에이전트가 현재 의도에 따라 Skill을 자동으로 호출합니다. Skill을 선택하면 다음 메시지에서 강제로 활성화됩니다.",
    "The agent can choose a skill from your intent; selecting one forces it for the next message.": "에이전트가 현재 의도에 따라 Skill을 자동으로 호출합니다. Skill을 선택하면 다음 메시지에서 강제로 활성화됩니다.",
}

def find_key_for_value(value, mapping):
    """Find a key in mapping that equals value (case-insensitive)."""
    for k, v in mapping.items():
        if v == value:
            return k
    return None

def convert_file(filepath):
    with open(filepath, 'r', encoding='utf-8') as f:
        content = f.read()

    # Count occurrences
    count_before = content.count('isZh')
    
    # Pattern 1: isZh ? "..." : "..."
    # Match isZh followed by optional whitespace/newlines, then ? then text1 then : then text2
    # This handles multi-line too
    pattern = r'isZh\s*\?\s*("[^"]*")\s*:\s*("[^"]*")'
    
    def replacer(m):
        zh_text = m.group(1)  # "选择 Agent Skill"
        en_text = m.group(2)  # "Select Agent Skills"
        
        # Get Korean translation
        # First try matching zh_text
        zh_clean = zh_text.strip('"')
        en_clean = en_text.strip('"')
        
        # Try to find a Korean translation by zh or en text
        ko_text = None
        if zh_clean in KO_TRANSLATIONS:
            ko_text = KO_TRANSLATIONS[zh_clean]
        elif en_clean in KO_TRANSLATIONS:
            ko_text = KO_TRANSLATIONS[en_clean]
        else:
            # Default to empty string if not found
            ko_text = ""
        
        return f'lang === "zh" ? {zh_text} : lang === "ko" ? "{ko_text}" : {en_text}'
    
    new_content = re.sub(pattern, replacer, content)
    
    # Pattern 2: Multiline isZh\n  ? "...\n  : "..."
    pattern_ml = r'isZh\s*\n\s*\?\s*("[^"]*")\s*\n\s*:\s*("[^"]*")'
    new_content = re.sub(pattern_ml, replacer, new_content)
    
    # Remove standalone `const isZh = lang === "zh";` declarations
    new_content = re.sub(r'\s*const isZh = lang === "zh";?\n?', '\n', new_content)
    
    count_after = new_content.count('isZh')
    
    # Write back
    with open(filepath, 'w', encoding='utf-8') as f:
        f.write(new_content)
    
    return count_before, count_after

# Process files
files = [
    r'D:\GAMEDEV\inkos\packages\studio\src\pages\ChatPage.tsx',
    r'D:\GAMEDEV\inkos\packages\studio\src\pages\ProjectSettings.tsx',
    r'D:\GAMEDEV\inkos\packages\studio\src\pages\TranslationManager.tsx',
]

total_before = 0
total_after = 0
for f in files:
    if os.path.exists(f):
        b, a = convert_file(f)
        total_before += b
        total_after += a
        print(f"{os.path.basename(f)}: {b} -> {a} occurrences of 'isZh'")

print(f"\nTotal: {total_before} -> {total_after} occurrences of 'isZh'")
print("\nDone!")