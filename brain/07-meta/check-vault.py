#!/usr/bin/env python3
"""
Cortex vault linter.

Checks:
  1. Rule line schema:  - **ID-##**: text [conf:1-5, src:...]
  2. Duplicate rule IDs across the vault
  3. Numbering gaps within each prefix
  4. Relative markdown links resolve
  5. BN-00: all 8 core agents exist in agents/
  6. Mirror parity: public/agents and public/brain match their sources

Usage: python brain/07-meta/check-vault.py [repo_root]
Exit code 0 = clean, 1 = errors found.
"""
import re
import sys
from collections import defaultdict
from pathlib import Path

CORE_AGENTS = [
    "productmanageragent.md", "uiuxagent.md", "growthagent.md", "systemsdesignagent.md",
    "integrationagent.md", "dbaagent.md", "securityagent.md", "researchagent.md",
]

RULE_LINE = re.compile(r"^- \*\*([A-Z]{2,4})-(\d{2})\*\*:\s+(.+)$")
RULE_STRICT = re.compile(r"^- \*\*[A-Z]{2,4}-\d{2}\*\*:\s+.+\s\[conf:([1-5]),\s*src:([^\]]+)\]\s*$")
LINK = re.compile(r"\[[^\]]*\]\((?!https?://|mailto:|#)([^)#\s]+)(?:#[^)]*)?\)")

errors: list[str] = []
warnings: list[str] = []


def err(msg: str) -> None:
    errors.append(msg)


def check_rules(brain: Path, root: Path) -> None:
    seen: dict[str, str] = {}
    numbers: dict[str, list[int]] = defaultdict(list)

    for md in sorted(brain.rglob("*.md")):
        if md.name.startswith("_TEMPLATE"):
            continue
        rel = md.relative_to(root)
        for n, line in enumerate(md.read_text(encoding="utf-8").splitlines(), 1):
            m = RULE_LINE.match(line)
            if not m:
                continue
            prefix, num = m.group(1), int(m.group(2))
            rid = f"{prefix}-{m.group(2)}"
            if not RULE_STRICT.match(line):
                err(f"{rel}:{n}: {rid} missing '[conf:1-5, src:...]' suffix")
            if rid in seen:
                err(f"{rel}:{n}: duplicate rule id {rid} (first in {seen[rid]})")
            else:
                seen[rid] = f"{rel}:{n}"
                numbers[prefix].append(num)

    for prefix, nums in numbers.items():
        nums.sort()
        missing = [i for i in range(nums[0], nums[-1] + 1) if i not in nums]
        if missing:
            warnings.append(f"{prefix}: numbering gaps at {missing}")


def check_links(root: Path) -> None:
    for base in (root / "brain", root / "agents"):
        for md in base.rglob("*.md"):
            text = md.read_text(encoding="utf-8")
            for target in LINK.findall(text):
                if not (md.parent / target).resolve().exists():
                    err(f"{md.relative_to(root)}: broken link -> {target}")


def check_bn00(root: Path) -> None:
    agents = root / "agents"
    for name in CORE_AGENTS:
        if not (agents / name).is_file():
            err(f"GATE: FAIL BN-00 {name} - Restore all 8 Core Agents before proceeding.")


def check_mirrors(root: Path) -> None:
    pairs = [(root / "agents", root / "public" / "agents"),
             (root / "brain", root / "public" / "brain")]
    for src, mirror in pairs:
        if not mirror.is_dir():
            err(f"missing mirror directory: {mirror.relative_to(root)}")
            continue
        src_files = {p.relative_to(src): p for p in src.rglob("*.md")}
        mir_files = {p.relative_to(mirror): p for p in mirror.rglob("*.md")}
        for rel in sorted(src_files.keys() - mir_files.keys()):
            err(f"mirror missing: {mirror.relative_to(root) / rel}")
        for rel in sorted(mir_files.keys() - src_files.keys()):
            warnings.append(f"mirror has stray file: {mirror.relative_to(root) / rel}")
        for rel in sorted(src_files.keys() & mir_files.keys()):
            if src_files[rel].read_bytes() != mir_files[rel].read_bytes():
                err(f"mirror out of date: {mirror.relative_to(root) / rel}")


def main() -> int:
    root = Path(sys.argv[1]).resolve() if len(sys.argv) > 1 else Path.cwd()
    brain = root / "brain"
    if not brain.is_dir():
        print(f"error: {brain} not found", file=sys.stderr)
        return 1

    check_bn00(root)
    check_rules(brain, root)
    check_links(root)
    check_mirrors(root)

    for w in warnings:
        print(f"WARN  {w}")
    for e in errors:
        print(f"ERROR {e}")
    print(f"\n{len(errors)} error(s), {len(warnings)} warning(s)")
    return 1 if errors else 0


if __name__ == "__main__":
    sys.exit(main())
