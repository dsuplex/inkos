import re, os

for root, dirs, files in os.walk(r'D:\GAMEDEV\inkos\packages\studio\src'):
    for f in files:
        if f.endswith(('.tsx', '.ts')) and not f.endswith('.test.ts'):
            path = os.path.join(root, f)
            with open(path, 'r', encoding='utf-8') as fp:
                content = fp.read()
            # Find tr() calls with empty korean (",,")
            matches = re.findall(r'tr\([^)]*,\s*""\s*,', content)
            if matches:
                print(f'{path}: {len(matches)} empty korean')
                for m in matches:
                    print(f'  {m[:100]}')