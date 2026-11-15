#!/usr/bin/env python3
"""Vault consistency check. Run from anywhere: python 07-meta/check-vault.py [vault_root]
Read-only. Exit code 1 if any ERROR. Checks CV-01..CV-08 mechanics, not meaning."""
import re, sys, glob, os
try: sys.stdout.reconfigure(encoding='utf-8', errors='replace')
except Exception: pass
root = sys.argv[1] if len(sys.argv) > 1 else os.path.join(os.path.dirname(os.path.abspath(__file__)), '..')
os.chdir(root)
norm = lambda p: p.replace(os.sep, '/').replace('\\', '/')
files = sorted(norm(f) for f in glob.glob('**/*.md', recursive=True))
text = {f: open(f, encoding='utf-8-sig').read() for f in files}
errors, warns = [], []
E = lambda f, m: errors.append(f"ERROR {f}: {m}")
W = lambda f, m: warns.append(f"WARN  {f}: {m}")

# 1. frontmatter (CV-04)
for f, t in text.items():
    m = re.match(r'---\n(.*?)\n---\n', t, re.S)
    if not m: E(f, "missing frontmatter"); continue
    keys = set(re.findall(r'^(\w+):', m.group(1), re.M))
    if f.endswith('_TEMPLATE.md'): continue
    if not {'version', 'status'} <= keys or not ({'type'} <= keys or 'domain' in keys):
        E(f, "frontmatter needs type (or domain), version, status")

# 2. rule lines: grammar, uniqueness, block id, conf vs status (CV-02, CV-03, CV-08)
seen = {}
for f, t in text.items():
    if f.endswith('_TEMPLATE.md'): continue
    for n, line in enumerate(t.split('\n'), 1):
        m = re.match(r'- \*\*([A-Z]{1,4})-(\d{2,3})\*\*', line)
        if not m or ' | ' not in line: continue
        rid = f"{m.group(1)}-{m.group(2)}"
        if rid in seen: E(f"{f}:{n}", f"duplicate ID {rid} (also {seen[rid]})")
        seen[rid] = f"{f}:{n}"
        if 'status:' in line:
            if not line.rstrip().endswith(f"^{rid.lower()}"): E(f"{f}:{n}", f"{rid} must end with block ID ^{rid.lower()}")
            st = re.search(r'status: (\w+)', line).group(1)
            if st not in ('candidate', 'active', 'superseded', 'retired'): E(f"{f}:{n}", f"{rid} bad status '{st}'")
            c = re.search(r'conf: (\d)', line)
            if st == 'active' and m.group(1) not in ('OP', 'TA') and (not c or int(c.group(1)) < 3):
                E(f"{f}:{n}", f"{rid} is active with conf < 3 (CV-03)")
            if st == 'active' and 'ev:' not in line: E(f"{f}:{n}", f"{rid} active without ev")

# 3. defined IDs
defined = set(seen)
for f, t in text.items():
    for m in re.finditer(r'\*\*([A-Z]{1,4}-\d{2,3})\*\*', t): defined.add(m.group(1))
    for m in re.finditer(r'^\|\s*((?:TS|FL-[A-Z]{2}|CW-[A-Z]{2}|RS|RK|PRE|A)-\d+)\s*\|', t, re.M): defined.add(m.group(1))
    for m in re.finditer(r'^#+\s*((?:FH-[A-Z]{2}|PRE|RS)-\d+)', t, re.M): defined.add(m.group(1))
    for m in re.finditer(r'^- \*\*((?:RK|PRE|RS)-\d+)\*\*', t, re.M): defined.add(m.group(1))
    for m in re.finditer(r'^## (L-\d\d)', t, re.M): defined.add(m.group(1))
    for m in re.finditer(r'^## (T\d+) ', t, re.M): defined.add(m.group(1))
    for m in re.finditer(r'^\|\s*(T\d+)\s*\|', t, re.M): defined.add(m.group(1))

# 4. references (single IDs, ranges, scenario ranges)
CHECK = r'(?:CV|EP|TE|BN|SP|AA|TS|Q|L)'
for f, t in text.items():
    if f.endswith('_TEMPLATE.md'): continue
    body = re.sub(r'`[^`\n]*`', '', t)
    for m in re.finditer(rf'\b({CHECK})-(\d{{2}})(?:\s*(?:…|–|to)\s*(?:{CHECK}-)?(\d{{2}}))?\b', body):
        p, a = m.group(1), int(m.group(2)); b = int(m.group(3) or a)
        for i in range(a, b + 1):
            if f"{p}-{i:02d}" not in defined: E(f, f"references undefined {p}-{i:02d}")
    for m in re.finditer(r'\b((?:FL|FH|CW)-[A-Z]{2}|RS)-(\d)(?:…(\d))?', body):
        p, a = m.group(1), int(m.group(2)); b = int(m.group(3) or a)
        for i in range(a, b + 1):
            if f"{p}-{i}" not in defined and f"{p}-{i}".replace('RS-', 'RS-') not in defined: E(f, f"references undefined {p}-{i}")

# 5. wikilinks incl. block ids
names = {os.path.splitext(os.path.basename(f))[0]: f for f in files}
blocks = {f: set(re.findall(r'\^([a-z0-9-]+)\s*$', t, re.M)) for f, t in text.items()}
for f, t in text.items():
    if f.endswith('_TEMPLATE.md'): continue
    for m in re.finditer(r'\[\[([^\]|#]+)(?:#\^([a-z0-9-]+))?', re.sub(r'`[^`\n]*`', '', t)):
        n, blk = m.group(1), m.group(2)
        if re.fullmatch(r'S-\d+', n): continue
        if n not in names: E(f, f"broken wikilink [[{n}]]")
        elif blk and blk not in blocks[names[n]]: E(f, f"broken block link [[{n}#^{blk}]]")

# 6. prefixes: domains must not use agent-suite prefixes (CV-07)
conv = text.get('07-meta/CONVENTIONS.md', '')
r = re.search(r'Reserved by the agent suite[^|]*\|\s*([A-Z ]+)\|', conv)
reserved = set(r.group(1).split()) if r else set()
used = re.search(r'Domains in use \| (.*)', conv); used = used.group(1) if used else ''
for f in sorted(norm(x) for x in glob.glob('02-domains/*.md')):
    m = re.search(r'^prefix: (\w+)', text[f], re.M)
    if not m or '⟨' in m.group(0): continue
    p = m.group(1)
    if p in reserved: E(f, f"domain prefix {p} is reserved by the agent suite")
    if p not in used: E(f, f"domain prefix {p} not listed under 'Domains in use' in CONVENTIONS")

# 7. size caps (agent/protocol files <= 80 lines; others warn > 150)
for f, t in text.items():
    n = t.count('\n') + 1
    if f.endswith('brainagent.md') and n > 80: E(f, f"{n} lines (cap 80)")
    elif n > 150: W(f, f"{n} lines (split per EXTENDING.md)")

print('\n'.join(errors + warns))
print(f"\n{len(files)} files | {len(errors)} errors | {len(warns)} warnings")
sys.exit(1 if errors else 0)
