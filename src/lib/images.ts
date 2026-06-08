// 이미지 처리: 갤러리용 썸네일 + 워드 삽입용 최적화.
// 표준 웹 API(createImageBitmap + Canvas)만 사용. EXIF 회전은 imageOrientation으로 반영.

// 삽입 이미지가 워드 Before 셀에 표시될 고정 너비(EMU). 양식 분석값 ≈ 8.01cm.
export const CELL_WIDTH_EMU = 2882900;
const THUMB_MAX_EDGE = 256; // 갤러리 썸네일 긴 변
const INSERT_MAX_EDGE = 1600; // 삽입 전 다운스케일 긴 변
const JPEG_QUALITY = 0.8;

export interface LoadedImage {
  id: string;
  file: File;
  name: string;
  thumbUrl: string; // 갤러리용 (object URL)
  thumbBlob: Blob; // 영구 저장용 썸네일 Blob
  aspect: number; // width / height (원본 비율)
}

let _seq = 0;

/** 복원 시 id 시퀀스를 기존 최대값 너머로 끌어올린다(충돌 방지). */
export function bumpSeq(toAtLeast: number) {
  if (toAtLeast > _seq) _seq = toAtLeast;
}

/** 파일 한 장 → 썸네일 + 원본 비율. 원본 픽셀은 들고 있지 않는다(File 참조만 유지). */
export async function loadImage(file: File): Promise<LoadedImage> {
  const bmp = await createImageBitmap(file, { imageOrientation: "from-image" });
  const aspect = bmp.width / bmp.height;
  const scale = Math.min(1, THUMB_MAX_EDGE / Math.max(bmp.width, bmp.height));
  const w = Math.max(1, Math.round(bmp.width * scale));
  const h = Math.max(1, Math.round(bmp.height * scale));
  const canvas = document.createElement("canvas");
  canvas.width = w;
  canvas.height = h;
  canvas.getContext("2d")!.drawImage(bmp, 0, 0, w, h);
  bmp.close();
  const blob: Blob = await new Promise((res) =>
    canvas.toBlob((b) => res(b!), "image/jpeg", 0.7),
  );
  return {
    id: `img-${_seq++}`,
    file,
    name: file.name,
    thumbUrl: URL.createObjectURL(blob),
    thumbBlob: blob,
    aspect,
  };
}

export interface OptimizedImage {
  bytes: Uint8Array;
  cx: number; // 표시 너비 EMU (셀 폭 고정)
  cy: number; // 표시 높이 EMU (비율 유지)
}

/** 삽입 직전에만 호출: 다운스케일 + JPEG 압축. 선택된 이미지에만 적용. */
export async function optimizeForDocx(img: LoadedImage): Promise<OptimizedImage> {
  const bmp = await createImageBitmap(img.file, { imageOrientation: "from-image" });
  const scale = Math.min(1, INSERT_MAX_EDGE / Math.max(bmp.width, bmp.height));
  const w = Math.max(1, Math.round(bmp.width * scale));
  const h = Math.max(1, Math.round(bmp.height * scale));
  const canvas = document.createElement("canvas");
  canvas.width = w;
  canvas.height = h;
  canvas.getContext("2d")!.drawImage(bmp, 0, 0, w, h);
  bmp.close();
  const blob: Blob = await new Promise((res) =>
    canvas.toBlob((b) => res(b!), "image/jpeg", JPEG_QUALITY),
  );
  const bytes = new Uint8Array(await blob.arrayBuffer());
  const cx = CELL_WIDTH_EMU;
  const cy = Math.round(CELL_WIDTH_EMU / img.aspect);
  return { bytes, cx, cy };
}

export function revokeImage(img: LoadedImage) {
  URL.revokeObjectURL(img.thumbUrl);
}
