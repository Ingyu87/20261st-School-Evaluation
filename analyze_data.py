# -*- coding: utf-8 -*-
import json
from pathlib import Path
from collections import Counter

base = Path(__file__).parent / "json_output"
out = Path(__file__).parent / "data_analysis.txt"

lines = []

with open(base / "2026학년도_1학기_학교교육과정_운영_평가_설문_(교원용)_서울가동초등학교(응답)_-_설문지_응답_시트1.json", encoding="utf-8") as f:
    teacher = json.load(f)

with open(base / "2026학년도_1학기_학교교육과정_운영_평가_설문_(교직원용)_서울가동초등학교_(Responses)_-_Form_Responses_1.json", encoding="utf-8") as f:
    staff = json.load(f)

lines.append("=== TEACHER ===")
headers = teacher["headers"]
for i, h in enumerate(headers):
    if i == 0:
        lines.append(f"[{i}] TIMESTAMP")
        continue
    vals = [r.get(h, "") for r in teacher["records"]]
    non_empty = [v for v in vals if v.strip()]
    dist = Counter(non_empty)
    lines.append(f"[{i}] {h[:100]}")
    lines.append(f"  responses: {len(non_empty)}/{len(vals)}")
    lines.append(f"  dist: {dict(dist)}")
    if i == len(headers) - 1:
        for v in non_empty:
            lines.append(f"  SUBJECTIVE: {repr(v[:200])}")

lines.append("")
lines.append("=== STAFF ===")
for i, h in enumerate(staff["headers"]):
    vals = [r.get(h, "") for r in staff["records"]]
    non_empty = [v for v in vals if v.strip()]
    dist = Counter(non_empty)
    lines.append(f"[{i}] {h}")
    lines.append(f"  dist: {dict(dist)}")

# All unique response options across teacher likert questions
all_opts = set()
for i, h in enumerate(headers):
    if i == 0 or i == len(headers) - 1:
        continue
    for v in [r.get(h, "") for r in teacher["records"]]:
        if v.strip():
            all_opts.add(v.strip())
lines.append("")
lines.append(f"Teacher likert options: {sorted(all_opts)}")

with open(out, "w", encoding="utf-8") as f:
    f.write("\n".join(lines))

print("done", out)
