import re
import os

# Comprehensive Korean translations for inline tr() calls
KO_TRANSLATIONS = {
    # App.tsx
    "加载创作向导…": ("创作向导加载中…", "Loading creation wizard…"),
    "加载流程图…": ("플로우 뷰 로딩 중…", "Loading flow view…"),
    
    # Sidebar.tsx
    "改名": ("이름 변경", "Rename"),
    "删除": ("삭제", "Delete"),
    "新建会话": ("새 세션", "New session"),
    "还没有互动影游项目": ("아직 인터랙티브 영화 프로젝트가 없습니다", "No interactive film projects yet"),
    "重命名会话": ("세션 이름 변경", "Rename Session"),
    "输入新标题": ("새 제목 입력", "Enter a new title"),
    "取消": ("취소", "Cancel"),
    "保存": ("저장", "Save"),
    "删除会话": ("세션 삭제", "Delete Session"),
    "新会话": ("새 세션", "New session"),
    "刚刚": ("방금 전", "just now"),
    
    # truth-display.ts
    "主角": ("주인공", "Protagonist"),
    "题材": ("장르", "Genre"),
    "时代背景": ("시대 배경", "Era"),
    "红线": ("금기 사항", "Hard Lines"),
    "同人模式": ("팬픽 모드", "Fanfic Mode"),
    
    # ServiceConfigSourceCard.tsx
    "读取配置来源失败": ("설정 소스 읽기 실패", "Failed to load config source"),
    "切换配置来源失败": ("설정 소스 전환 실패", "Failed to switch config source"),
    "导入环境变量配置失败": ("환경 변수 설정 가져오기 실패", "Failed to import env config"),
    "正在读取配置来源…": ("설정 소스 읽는 중…", "Loading config source…"),
    "项目 .env": ("프로젝트 .env", "Project .env"),
    "全局 ~/.inkos/.env": ("전역 ~/.inkos/.env", "Global ~/.inkos/.env"),
    "LLM 配置来源": ("LLM 설정 소스", "LLM config source"),
    "Studio 运行时：": ("Studio 런타임:", "Studio runtime:"),
    "使用服务页配置和 Studio 密钥": ("서비스 페이지 설정과 Studio 키 사용", "uses service page config and Studio keys"),
    "切换中…": ("전환 중…", "Switching…"),
    "使用 Studio 配置": ("Studio 설정 사용", "Use Studio config"),
    "导入中…": ("가져오는 중…", "Importing…"),
    "导入检测到的配置": ("감지된 설정 가져오기", "Import detected config"),
    "检测到 LLM 环境变量覆盖：": ("LLM 환경 변수 오버라이드 감지:", "Detected LLM environment variable override:"),
    "已检测到但未定位来源": ("감지되었으나 소스를 찾을 수 없음", "detected but source not located"),
    "已设置": ("설정됨", "set"),
    "未设置": ("미설정", "not set"),
    
    # ServiceQuickLinks.tsx
    "配置入口": ("설정 바로가기", "Quick links"),
    
    # NarrativeForecastPreview.tsx
    "候选分支已保存": ("후보 분기 저장됨", "Candidate branch saved"),
    "该推演基于旧正史，请核验后再继续写作。": ("이 추론은 구 정사 기반입니다. 검증 후 집필을 계속하세요.", "This forecast is stale; verify it before writing."),
    
    # FoundationSection.tsx
    "核心文件": ("핵심 파일", "Core Files"),
    
    # AnalysisPanel.tsx
    "校验": ("검증", "Validation"),
    "（有阻断问题）": ("(차단 문제 있음)", " (blocking issues)"),
    "无问题": ("문제 없음", "No issues"),
    "情感曲线": ("감정 곡선", "Emotion arcs"),
    "暂无可分析路径": ("분석할 경로 없음", "No paths to analyze"),
    "情感曲线图": ("감정 곡선 차트", "Emotion arc chart"),
    "无结局": ("결말 없음", "No ending"),
    "（路径总数已超过枚举上限）": ("(총 경로 수가 열거 한도 초과)", " (total paths exceed the enumeration limit)"),
    "路径分布": ("경로 분포", "Path distribution"),
    "暂无路径数据": ("경로 데이터 없음", "No path data"),
    "路径长度分布": ("경로 길이 분포", "Path length distribution"),
    "正在加载分析结果…": ("분석 결과 로딩 중…", "Loading analysis…"),
    "加载失败：": ("로드 실패: ", "Load failed: "),
    "暂无分析数据": ("분석 데이터 없음", "No analysis data"),
    
    # CharacterSection.tsx
    "标签": ("태그", "Tags"),
    "当前": ("현재", "Current"),
    "角色": ("캐릭터", "Characters"),
    
    # PendingHooksView.tsx
    "还没有埋下伏笔。": ("아직 복선이 없습니다.", "No foreshadowing planted yet."),
    "种子": ("씨앗", "Seed"),
    "活跃": ("활성", "Active"),
    "核心": ("핵심", "Core"),
    "回收": ("회수", "Payoff"),
    
    # SummarySection.tsx
    "世界观": ("세계관", "World"),
    "故事基石": ("스토리 기초", "Story Foundation"),
    "查看完整设定 →": ("전체 설정 보기 →", "View full foundation →"),
    
    # ProjectArtifactDrawer.tsx
    "关闭生成物预览": ("생성물 미리보기 닫기", "Close artifact preview"),
    "生成物": ("생성물", "Artifact"),
    "编辑": ("편집", "Edit"),
    "关闭": ("닫기", "Close"),
    "正在读取生成物...": ("생성물 읽는 중...", "Loading artifact..."),
    "没有可预览内容。": ("미리볼 내용이 없습니다.", "Nothing to preview."),
    
    # ProgressSection.tsx
    "执行": ("실행", "Progress"),
    
    # ImportManager.tsx
    "原著向": ("원작 준수", "Canon-compliant"),
    "架空 AU": ("패러렐 AU", "Alternate Universe (AU)"),
    "性格偏离 OOC": ("캐릭터 붕괴 OOC", "Out of Character (OOC)"),
    "配对 CP": ("커플링 CP", "Pairing (CP)"),
    "其他": ("기타", "Other"),
    "玄幻": ("현판", "Xuanhuan Fantasy"),
    "都市": ("도시", "Urban"),
    "仙侠": ("선협", "Xianxia"),
    "中文": ("한국어", "Chinese"),
    
    # FlowView.tsx
    "新选项": ("새 선택지", "New choice"),
    "新节点": ("새 노드", "New node"),
    "完成编辑": ("편집 완료", "Done editing"),
    "编辑": ("편집", "Edit"),
    "加节点": ("노드 추가", "Add node"),
    "总节点": ("전체 노드", "Nodes"),
    "分支": ("분기", "Branches"),
    "结局": ("결말", "Endings"),
    "死路": ("막다른 길", "Dead ends"),
    "默认": ("기본", "Default"),
    
    # ServiceDetailPage.tsx
    "返回服务商管理": ("서비스 제공자 관리로 돌아가기", "Back to providers"),
    "已连接": ("연결됨", "Connected"),
    "服务名称": ("서비스 이름", "Service name"),
    "例如：本地 Ollama": ("예: 로컬 Ollama", "e.g. local Ollama"),
    
    # ToolExecutionSteps.tsx
    "执行中": ("실행 중", "Running"),
    "处理结果": ("결과 처리 중", "Processing result"),
    "已完成": ("완료됨", "Completed"),
    "失败": ("실패", "Failed"),
    "思考中": ("생각 중", "Thinking"),
    "规格": ("규격", "Spec"),
    "剧情图谱": ("스토리 그래프", "Story graph"),
    "剧情树": ("스토리 트리", "Story tree"),
    "变量旗标": ("변수 플래그", "Flags"),
    "剧本": ("대본", "Script"),
    "分镜": ("스토리보드", "Storyboard"),
    "图像提示词": ("이미지 프롬프트", "Image prompts"),
    "图片资产": ("이미지 에셋", "Image assets"),
    "剧本已生成": ("대본 생성됨", "Script generated"),
    "分镜已生成": ("스토리보드 생성됨", "Storyboard generated"),
    "互动影游已生成": ("인터랙티브 영화 생성됨", "Interactive film generated"),
    "打开创作向导 →": ("창작 위자드 열기 →", "Open creation wizard →"),
    "：": (": ", ": "),
    "查看": ("보기", "View"),
    "封面未生成：": ("커버 미생성: ", "Cover not generated: "),
    "短篇封面": ("단편 표지", "Short fiction cover"),
    "本幕配图": ("본 막 일러스트", "Scene illustration"),
    "世界契约": ("세계 계약", "World contract"),
    "视觉契约": ("비주얼 계약", "Visual contract"),
    "确认执行": ("실행 확인", "Confirm action"),
    "已打开": ("열림", "Opened"),
    "已执行": ("실행됨", "Executed"),
    "已取消": ("취소됨", "Cancelled"),
    "执行中…": ("실행 중…", "Running…"),
    "打开入口": ("입구 열기", "Open entry"),
    "继续执行": ("계속 실행", "Continue"),
    "互动世界已启动": ("인터랙티브 월드 시작됨", "Interactive world started"),
    "互动回合已重做": ("플레이 턴 재실행됨", "Play turn redone"),
    "已切换互动回合版本": ("인터랙티브 턴 버전 전환됨", "Switched play turn variant"),
    "互动世界已推进": ("인터랙티브 월드 진행됨", "Interactive world advanced"),
    "世界前提": ("세계 전제", "World premise"),
    "互动世界设定已更新": ("인터랙티브 월드 설정 업데이트됨", "Interactive world settings updated"),
    "已写入当前世界。": ("현재 월드에 기록됨.", "Written to the current world."),
    "查看操作结果": ("작업 결과 보기", "View result"),
    
    # parts-builder.ts
    "整理会话记忆": ("세션 메모리 정리", "Organize session memory"),
    "压缩故事上下文": ("스토리 컨텍스트 압축", "Compress story context"),
    
    # FilmCreationWizard.tsx (check if any)
    # BookCreate.tsx
    # ...
}

def process_file(filepath):
    with open(filepath, 'r', encoding='utf-8') as f:
        content = f.read()
    
    original_content = content
    changes = 0
    
    # Pattern: tr("zh", "en") -> tr("zh", "ko", "en")
    # Need to handle various formats
    pattern = r'tr\((["\'])([^"\']+)\1\s*,\s*(["\'])([^"\']+)\3\)'
    
    def replace_match(m):
        nonlocal changes
        zh = m.group(2)
        en = m.group(4)
        
        # Skip if already 3 args
        # Check if there's a third arg after
        full_match = m.group(0)
        if full_match.count(',') >= 2:
            return full_match
        
        if zh in KO_TRANSLATIONS:
            ko, _ = KO_TRANSLATIONS[zh]
            changes += 1
            return f'tr("{zh}", "{ko}", "{en}")'
        
        # Default: use empty ko (will fallback to zh)
        changes += 1
        return f'tr("{zh}", "", "{en}")'
    
    content = re.sub(pattern, replace_match, content)
    
    if content != original_content:
        with open(filepath, 'w', encoding='utf-8') as f:
            f.write(content)
        return changes
    return 0

# Process all .tsx and .ts files in studio/src
total_changes = 0
for root, dirs, files in os.walk(r'D:\GAMEDEV\inkos\packages\studio\src'):
    for file in files:
        if file.endswith(('.tsx', '.ts')) and not file.endswith('.test.ts'):
            filepath = os.path.join(root, file)
            try:
                changes = process_file(filepath)
                if changes > 0:
                    print(f"{filepath}: {changes} changes")
                    total_changes += changes
            except Exception as e:
                print(f"Error processing {filepath}: {e}")

print(f"\nTotal changes: {total_changes}")