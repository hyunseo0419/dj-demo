# 이미지 → 워드 리포트 (POC)

선박 검사 사진을 골라 워드 보고서(Observation & Rectified Report) 양식의 셀에 자동 삽입하는 **브라우저 전용** 도구. 서버 없음 · Vite + React + TS.

## 기능
- 사진 업로드/미리보기 (JPEG·PNG, 다량)
- 키보드 선택 (방향키 이동, Space 선택)
- 사진별 설명 입력 → 섹션 셀에 기재
- 워드 생성 & 다운로드 (선택 수만큼 섹션 생성, 레터헤드 포함)
- 작업 자동 저장/복원 (IndexedDB)
- KR / JP UI 전환 + 사용설명서 탭
- (예정) 한·일 → 영문 자동 번역

## 개발
```bash
npm install
npm run dev      # http://localhost:5173
npm run build    # 타입체크 + 프로덕션 빌드
```

## 양식(워드) 에셋
- 런타임 에셋: `public/template/base.docx`(레터헤드+헤더+sectPr), `public/template/section-unit.xml`(섹션 단위 템플릿)
- 재생성: `python3 scripts/build-base-from-ex.py ex.docx` — 실제 양식(`ex.docx`)에서 base/unit을 추출
- 생성 로직: `src/lib/docx.ts` — base에 섹션을 N개 복제 + 이미지 주입(PizZip)

## 구조
- `src/lib/images.ts` 썸네일/삽입 최적화 · `src/lib/storage.ts` IndexedDB 영속화 · `src/lib/i18n.tsx` 한/일
- `src/components/` Uploader · Gallery · RemarkModal · TopBar · Manual

참고 문서: `SPEC.md`(기능명세) · `CLAUDE.md`(개발 규칙) · `PROPOSAL.md`(번역/편의 제안)
