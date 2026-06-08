#!/usr/bin/env python3
"""
양식 .docx -> 앱이 쓰는 베이스 에셋 2개를 추출한다.
  - public/template/base.docx       : 헤더 + sectPr 만 남긴 컨테이너(본문 이미지/섹션 제거, 로고 유지)
  - public/template/section-unit.xml: 섹션 표 1개를 파라미터화한 클론 단위

완벽한 양식을 받으면:
  python3 scripts/build-base.py "samples/새양식.docx"
사용. 섹션 표 식별 기준은 'Before'와 'After' 텍스트를 모두 포함하는 표.
번호 셀/이미지 위치가 다른 양식이면 LOGO_KEEP, 번호 마킹 로직만 조정하면 된다.
"""
import re, os, sys, zipfile, shutil, tempfile

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
SRC_DOCX = sys.argv[1] if len(sys.argv) > 1 else None
OUT_DIR = os.path.join(ROOT, "public/template")
IMAGE_REL = 'Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/image"'

if not SRC_DOCX or not os.path.exists(SRC_DOCX):
    sys.exit("사용법: python3 scripts/build-base.py <양식.docx>")

work = tempfile.mkdtemp()
with zipfile.ZipFile(SRC_DOCX) as z:
    z.extractall(work)

doc_path = os.path.join(work, "word/document.xml")
x = open(doc_path, encoding="utf-8").read()
tbls = list(re.finditer(r"<w:tbl>.*?</w:tbl>", x, re.S))
sec_idx = [i for i, m in enumerate(tbls) if "Before" in m.group(0) and "After" in m.group(0)]
if not sec_idx:
    sys.exit("섹션 표(Before/After 포함)를 찾지 못했습니다.")

# 클론 단위 선택: 이미지 1장 + 번호 셀이 '숫자'인 일반 섹션(라벨/범례 행 제외)
def parse_unit(s):
    embed = re.search(r'r:embed="(rId\d+)"', s)
    docpr = re.search(r'<wp:docPr id="(\d+)"', s)
    ext = re.search(r'<wp:extent cx="(\d+)" cy="(\d+)"', s)
    first_tr = re.search(r"<w:tr[ >].*?</w:tr>", s, re.S)
    first_tc = re.search(r"<w:tc>.*?</w:tc>", first_tr.group(0), re.S) if first_tr else None
    num = re.search(r"<w:t>(\d+)</w:t>", first_tc.group(0)) if first_tc else None
    return embed, docpr, ext, num

unit = None
for i in sec_idx:
    cand = tbls[i].group(0)
    if cand.count("<w:drawing>") != 1:
        continue
    embed, docpr, ext, num_run = parse_unit(cand)
    if embed and docpr and ext and num_run:
        unit = cand
        break
if unit is None:
    sys.exit("번호(숫자)+이미지 1장짜리 섹션 단위를 찾지 못했습니다.")

unit = unit.replace("<w:t>%s</w:t>" % num_run.group(1), "<w:t>{{NUMBER}}</w:t>", 1)
unit = unit.replace('r:embed="%s"' % embed.group(1), 'r:embed="{{RID}}"')
unit = unit.replace('cx="%s" cy="%s"' % (ext.group(1), ext.group(2)), 'cx="{{CX}}" cy="{{CY}}"')
unit = unit.replace('id="%s"' % docpr.group(1), 'id="{{DOCPR_ID}}"', 1)

# 관찰(번호 옆) 텍스트 칸 = 보통 가장 긴 런. 사용자 입력이 들어갈 자리 -> {{DESC}}
text_runs = list(re.finditer(r"<w:t(?:\s[^>]*)?>(.*?)</w:t>", unit))
candidates = [m for m in text_runs if "{{" not in m.group(1)]
if candidates:
    desc = max(candidates, key=lambda m: len(m.group(1)))
    if len(desc.group(1)) > 0:
        unit = unit[: desc.start(1)] + "{{DESC}}" + unit[desc.end(1):]

# 첨부 이미지(섹션1) 형식: 하단 행은 비어 있음 -> "Remark:" 라벨 제거
unit = re.sub(r"(<w:t(?:\s[^>]*)?>)Remark:(</w:t>)", r"\1\2", unit, count=1)

# 베이스: 첫 섹션 앞 + 마지막 표 뒤(sectPr 포함), 섹션은 마커로 대체
base_doc = x[: tbls[sec_idx[0]].start()] + "<!--GEN_SECTIONS-->" + x[tbls[-1].end():]

# 본문 이미지 rels 제거(헤더/푸터/스타일 등은 유지)
rels_path = os.path.join(work, "word/_rels/document.xml.rels")
rels = open(rels_path, encoding="utf-8").read()
kept = [r for r in re.findall(r"<Relationship [^>]*/>", rels) if IMAGE_REL not in r]
rels_new = ('<?xml version="1.0" encoding="UTF-8" standalone="yes"?>\r\n'
            '<Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships">'
            + "".join(kept) + "</Relationships>")

# 헤더/푸터가 참조하는 미디어(로고)는 유지, 본문 미디어 제거
referenced = set()
for sub in ("header", "footer"):
    for rf in os.listdir(os.path.join(work, "word/_rels")) if os.path.isdir(os.path.join(work, "word/_rels")) else []:
        if rf.startswith(sub):
            t = open(os.path.join(work, "word/_rels", rf), encoding="utf-8").read()
            referenced |= set(re.findall(r'Target="media/([^"]+)"', t))

open(doc_path, "w", encoding="utf-8").write(base_doc)
open(rels_path, "w", encoding="utf-8").write(rels_new)
media_dir = os.path.join(work, "word/media")
if os.path.isdir(media_dir):
    for f in os.listdir(media_dir):
        if f not in referenced:
            os.remove(os.path.join(media_dir, f))

os.makedirs(OUT_DIR, exist_ok=True)
open(os.path.join(OUT_DIR, "section-unit.xml"), "w", encoding="utf-8").write(unit)
base_out = os.path.join(OUT_DIR, "base.docx")
if os.path.exists(base_out):
    os.remove(base_out)
with zipfile.ZipFile(base_out, "w", zipfile.ZIP_DEFLATED) as z:
    for root, _, files in os.walk(work):
        for fn in files:
            full = os.path.join(root, fn)
            z.write(full, os.path.relpath(full, work))
shutil.rmtree(work)
print("OK -> %s, %s (kept media: %s)" % (base_out, os.path.join(OUT_DIR, "section-unit.xml"), referenced or "none"))
