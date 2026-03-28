import os
import re

def process_file(path):
    with open(path, 'r') as f:
        content = f.read()
    
    if 'data-icon="shield">shield</span>' not in content: return
    if '<Link href="/dashboard" className="flex items-center gap-3' in content: return

    pattern = re.compile(
        r'<div className="flex items-center gap-3">\s*'
        r'(.*?)\s*'
        r'(<span[^>]*data-icon="shield"[^>]*>shield</span>)\s*'
        r'(<[a-zA-Z0-9]+[^>]*>EntryShield</[a-zA-Z0-9]+>)\s*'
        r'</div>',
        re.DOTALL
    )
    
    def replacer(m):
        back_button = m.group(1)
        shield = m.group(2)
        text = m.group(3)
        
        inner = ""
        if back_button.strip():
            inner += f"          {back_button}\n"
        inner += f"          {shield}\n"
        inner += f"          {text}\n"
        
        return (f'<Link href="/dashboard" className="flex items-center gap-3 hover:opacity-80 transition-opacity cursor-pointer">\n'
                f'{inner}'
                f'        </Link>')
    
    new_c = pattern.sub(replacer, content)
    if new_c != content:
        # Check if Link is imported
        if '<Link ' in new_c and 'import Link ' not in new_c:
            new_c = "import Link from 'next/link';\n" + new_c
        with open(path, 'w') as f:
            f.write(new_c)
        print("Updated:", path)

for root, _, files in os.walk('src/app'):
    for file in files:
        if file.endswith('.tsx'):
            process_file(os.path.join(root, file))
