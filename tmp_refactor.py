import os
import re

def refactor_file(filepath):
    with open(filepath, 'r') as f:
        content = f.read()

    # The exact pattern we're looking for might differ in spaces. Let's use a simpler replacement logic.
    # Basically we want to replace `<div className="flex items-center gap-3">`
    # and its inner text up to `</div>` if it contains `EntryShield` and `shield` icon.
    
    # We will search for this explicitly piece by piece.
    
    # Match the block
    pattern = re.compile(
        r'<div className="flex items-center gap-3">\s*'
        r'(<Link[^>]*>.*?</Link>\s*)?' # Optional Back Button Link
        r'<span className="material-symbols-outlined text-\[#adc6ff\]" data-icon="shield">shield</span>\s*'
        r'<[^>]+>EntryShield</[^>]+>\s*'
        r'</div>',
        re.DOTALL
    )
    
    def replacer(match):
        inner_back = match.group(1) or ""
        return (
            '<Link href="/dashboard" className="flex items-center gap-3 hover:opacity-80 transition-opacity cursor-pointer">\n          '
            + inner_back +
            '<span className="material-symbols-outlined text-[#adc6ff]" data-icon="shield">shield</span>\n          '
            '<h1 className="text-xl font-extrabold text-[#e7e5e5] tracking-tighter font-headline">EntryShield</h1>\n        '
            '</Link>'
        )

    new_content = pattern.sub(replacer, content)
    
    if new_content != content:
        if '<Link href="/dashboard"' in new_content and 'from \'next/link\'' not in new_content and 'from "next/link"' not in new_content:
            new_content = "import Link from 'next/link';\n" + new_content
            
        with open(filepath, 'w') as f:
            f.write(new_content)
        print("Updated:", filepath)

for root, dirs, files in os.walk('src/app'):
    for file in files:
        if file.endswith('.tsx') or file.endswith('.ts'):
            refactor_file(os.path.join(root, file))
            
refactor_file('src/components/ReservationSearchClient.tsx')
