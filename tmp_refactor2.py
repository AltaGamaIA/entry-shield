import os
import re

def refactor_file(filepath):
    # Only process target files that we KNOW have the EntryShield header logo
    with open(filepath, 'r') as f:
        content = f.read()

    # Skip files that don't have the shield icon followed by EntryShield
    if 'data-icon="shield">shield</span>' not in content:
        return

    # Check if already a Link
    if '<Link href="/dashboard" className="flex items-center gap-3' in content:
        return

    # Find the block starting with <div className="flex items-center gap-3">
    # that contains the shield and EntryShield text.
    
    # We can match:
    # <div className="flex items-center gap-3">
    # (anything in between, like optional back arrow)
    # <span ...>shield</span>
    # <...EntryShield...</...>
    # </div>
    
    pattern = re.compile(
        r'<div className="flex items-center gap-3">\s*'
        r'(?:<Link[^>]*>.*?</Link>\s*)?' # optional back link
        r'<span[^>]*data-icon="shield"[^>]*>shield</span>\s*'
        r'<[a-zA-Z0-9]+[^>]*>EntryShield</[a-zA-Z0-9]+>\s*'
        r'</div>',
        re.DOTALL
    )

    def replacer(match):
        original = match.group(0)
        # convert <div ...> to <Link href="/dashboard" ...>
        # and </div> to </Link>
        new_str = original.replace('<div className="flex items-center gap-3">', '<Link href="/dashboard" className="flex items-center gap-3 hover:opacity-80 transition-opacity cursor-pointer">', 1)
        # replace the last </div> with </Link>
        new_str = new_str.rsplit('</div>', 1)
        new_str = '</Link>'.join(new_str)
        return new_str

    new_content = pattern.sub(replacer, content)
    
    if new_content != content:
        # Add import next/link if missing
        if '<Link' in new_content and 'from \'next/link\'' not in new_content and 'from "next/link"' not in new_content:
            new_content = "import Link from 'next/link';\n" + new_content
            
        with open(filepath, 'w') as f:
            f.write(new_content)
        print("Updated:", filepath)

for root, dirs, files in os.walk('src/app'):
    for file in files:
        if file.endswith('.tsx'):
            refactor_file(os.path.join(root, file))

refactor_file('src/components/ReservationSearchClient.tsx')
