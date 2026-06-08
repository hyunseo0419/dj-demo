// 워드 생성: base.docx(헤더+sectPr 컨테이너)에 선택 이미지 수만큼 섹션 표를 복제 삽입.
// 클론 방식 — 템플릿에 태그를 넣지 않고 코드에서 OOXML을 직접 조립한다.

import PizZip from "pizzip";
import { LoadedImage, optimizeForDocx } from "./images";

const IMAGE_REL_TYPE =
  "http://schemas.openxmlformats.org/officeDocument/2006/relationships/image";
const SECTION_SEPARATOR = "<w:p/>"; // 섹션 표 사이 구분 문단(표 병합 방지)
const MARKER = "<!--GEN_SECTIONS-->"; // base.docx 안의 삽입 위치

async function loadAssets(): Promise<{ base: ArrayBuffer; unit: string }> {
  const [base, unit] = await Promise.all([
    fetch("/template/base.docx").then((r) => r.arrayBuffer()),
    fetch("/template/section-unit.xml").then((r) => r.text()),
  ]);
  return { base, unit };
}

function escapeXml(s: string): string {
  return s
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;");
}

function fillUnit(
  tpl: string,
  num: number,
  rid: string,
  cx: number,
  cy: number,
  docPrId: number,
  text: string,
): string {
  return tpl
    .replaceAll("{{NUMBER}}", String(num))
    .replaceAll("{{RID}}", rid)
    .replaceAll("{{CX}}", String(cx))
    .replaceAll("{{CY}}", String(cy))
    .replaceAll("{{DOCPR_ID}}", String(docPrId))
    .replaceAll("{{DESC}}", escapeXml(text)); // 번호 옆 관찰칸 = 사용자 입력 텍스트
}

export interface GenerateProgress {
  done: number;
  total: number;
}

export interface SectionInput {
  image: LoadedImage;
  text: string; // 번호 옆 관찰칸에 들어갈 텍스트
}

/** 선택 이미지로 .docx Blob 생성. 이미지는 삽입 직전 최적화. */
export async function generateDocx(
  sectionsInput: SectionInput[],
  onProgress?: (p: GenerateProgress) => void,
): Promise<Blob> {
  if (sectionsInput.length === 0) throw new Error("선택된 이미지가 없습니다.");
  const { base, unit } = await loadAssets();
  const zip = new PizZip(base);

  const sections: string[] = [];
  const relEntries: string[] = [];

  for (let i = 0; i < sectionsInput.length; i++) {
    const n = i + 1;
    const { image, text } = sectionsInput[i];
    const opt = await optimizeForDocx(image);
    const rid = `rIdGen${n}`;
    const fname = `genimage${n}.jpeg`;
    zip.file(`word/media/${fname}`, opt.bytes);
    relEntries.push(
      `<Relationship Id="${rid}" Type="${IMAGE_REL_TYPE}" Target="media/${fname}"/>`,
    );
    sections.push(fillUnit(unit, n, rid, opt.cx, opt.cy, 90000000 + n, text));
    onProgress?.({ done: n, total: sectionsInput.length });
  }

  const docFile = zip.file("word/document.xml");
  const relsFile = zip.file("word/_rels/document.xml.rels");
  if (!docFile || !relsFile) throw new Error("base.docx 구조가 올바르지 않습니다.");

  const doc = docFile
    .asText()
    .replace(MARKER, sections.join(SECTION_SEPARATOR));
  const rels = relsFile
    .asText()
    .replace("</Relationships>", relEntries.join("") + "</Relationships>");

  zip.file("word/document.xml", doc);
  zip.file("word/_rels/document.xml.rels", rels);

  return zip.generate({
    type: "blob",
    mimeType:
      "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
  });
}

export function downloadBlob(blob: Blob, filename: string) {
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  a.click();
  setTimeout(() => URL.revokeObjectURL(url), 1000);
}
