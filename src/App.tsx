import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { Uploader } from "./components/Uploader";
import { Gallery } from "./components/Gallery";
import { RemarkModal } from "./components/RemarkModal";
import { TopBar, View } from "./components/TopBar";
import { Manual } from "./components/Manual";
import { HeaderForm } from "./components/HeaderForm";
import { useI18n } from "./lib/i18n";
import { LoadedImage, loadImage, revokeImage, bumpSeq } from "./lib/images";
import {
  downloadBlob,
  generateDocx,
  GenerateProgress,
  HEADER_KEYS,
} from "./lib/docx";

function todayStr(): string {
  const d = new Date();
  const mm = String(d.getMonth() + 1).padStart(2, "0");
  const dd = String(d.getDate()).padStart(2, "0");
  return `${d.getFullYear()}/${mm}/${dd}`;
}
import {
  putImage,
  putMeta,
  getMeta,
  getAllImages,
  clearAll,
} from "./lib/storage";

export default function App() {
  const { t } = useI18n();
  const [view, setView] = useState<View>("app");
  const [header, setHeader] = useState<Record<string, string>>(() => ({
    DATE: todayStr(),
  }));
  const [images, setImages] = useState<LoadedImage[]>([]);
  const [selected, setSelected] = useState<Set<string>>(new Set());
  // id -> 설명 텍스트(셀에 기재)
  const [notes, setNotes] = useState<Map<string, string>>(new Map());
  const [focus, setFocus] = useState(0);
  const [modalIndex, setModalIndex] = useState<number | null>(null);
  const [loading, setLoading] = useState(false);
  const [progress, setProgress] = useState<GenerateProgress | null>(null);
  const restored = useRef(false); // 복원 완료 전엔 메타 저장 금지

  // 시작 시 IndexedDB에서 작업 복원(이미지 + 선택 + 텍스트)
  useEffect(() => {
    let alive = true;
    (async () => {
      try {
        const [recs, meta] = await Promise.all([getAllImages(), getMeta()]);
        if (!alive) return;
        if (meta?.header && Object.keys(meta.header).length) setHeader(meta.header);
        if (recs.length) {
          const byId = new Map(recs.map((r) => [r.id, r]));
          const order = meta?.order ?? recs.map((r) => r.id);
          const imgs: LoadedImage[] = order
            .map((id) => byId.get(id))
            .filter((r): r is NonNullable<typeof r> => !!r)
            .map((r) => ({
              id: r.id,
              file: r.file,
              name: r.name,
              thumbUrl: URL.createObjectURL(r.thumb),
              thumbBlob: r.thumb,
              aspect: r.aspect,
            }));
          setImages(imgs);
          if (meta) {
            setSelected(new Set(meta.selected));
            setNotes(new Map(meta.notes));
            bumpSeq(meta.seq);
          }
        }
      } catch {
        /* 복원 실패 시 빈 상태로 시작 */
      } finally {
        restored.current = true;
      }
    })();
    return () => {
      alive = false;
    };
  }, []);

  const addFiles = useCallback(async (files: File[]) => {
    setLoading(true);
    const loaded: LoadedImage[] = [];
    for (const f of files) {
      try {
        const img = await loadImage(f);
        loaded.push(img);
        // 원본+썸네일을 IndexedDB에 즉시 보관
        await putImage({
          id: img.id,
          name: img.name,
          aspect: img.aspect,
          file: img.file,
          thumb: img.thumbBlob,
        });
      } catch {
        // 디코딩/저장 실패 파일은 건너뜀
      }
    }
    setImages((prev) => [...prev, ...loaded]);
    setLoading(false);
  }, []);

  // 선택/텍스트/순서 메타 자동 저장(복원 완료 후에만)
  useEffect(() => {
    if (!restored.current) return;
    const order = images.map((i) => i.id);
    const seq = images.reduce((m, i) => {
      const n = parseInt(i.id.split("-")[1] ?? "0", 10);
      return Math.max(m, Number.isNaN(n) ? 0 : n + 1);
    }, 0);
    putMeta({
      order,
      selected: [...selected],
      notes: [...notes.entries()],
      header,
      seq,
    }).catch(() => {});
  }, [images, selected, notes, header]);

  // 모달 저장: 선택에 추가 + 설명 저장
  const saveFromModal = useCallback((id: string, text: string) => {
    setSelected((prev) => new Set(prev).add(id));
    setNotes((prev) => new Map(prev).set(id, text));
    setModalIndex(null);
  }, []);

  const removeFromModal = useCallback((id: string) => {
    setSelected((prev) => {
      const next = new Set(prev);
      next.delete(id);
      return next;
    });
    setModalIndex(null);
  }, []);

  // 선택된 이미지 → 섹션 입력(그리드 순서 유지). 셀에는 영문(없으면 원문) 삽입.
  const sectionsInput = useMemo(
    () =>
      images
        .filter((img) => selected.has(img.id))
        .map((img) => ({ image: img, text: (notes.get(img.id) ?? "").trim() })),
    [images, selected, notes],
  );

  async function onGenerate() {
    if (sectionsInput.length === 0) return;
    // 헤더 항목이 절반 미만 입력이면 확인(절반 이상이면 그냥 진행)
    const filled = HEADER_KEYS.filter(
      (k) => (header[k] ?? "").trim().length > 0,
    ).length;
    if (filled < HEADER_KEYS.length / 2 && !window.confirm(t.confirmInsufficient)) {
      return;
    }
    setProgress({ done: 0, total: sectionsInput.length });
    try {
      const blob = await generateDocx(sectionsInput, header, setProgress);
      const d = new Date();
      const yy = String(d.getFullYear()).slice(2);
      const mm = String(d.getMonth() + 1).padStart(2, "0");
      const dd = String(d.getDate()).padStart(2, "0");
      downloadBlob(blob, `${yy}_${mm}${dd}.docx`);
    } catch (e) {
      alert((e as Error).message);
    } finally {
      setProgress(null);
    }
  }

  function reset() {
    images.forEach(revokeImage);
    setImages([]);
    setSelected(new Set());
    setNotes(new Map());
    setHeader({ DATE: todayStr() });
    setFocus(0);
    setModalIndex(null);
    clearAll().catch(() => {});
  }

  const modalImage = modalIndex !== null ? images[modalIndex] : null;

  return (
    <div className="app">
      <TopBar view={view} onView={setView} />

      {view === "manual" ? (
        <Manual />
      ) : view === "header" ? (
        <HeaderForm
          values={header}
          onChange={(key, value) =>
            setHeader((prev) => ({ ...prev, [key]: value }))
          }
        />
      ) : (
        <>
          <p className="hint">{t.hint}</p>

          <Uploader onFiles={addFiles} loading={loading} />

          {images.length > 0 && (
            <Gallery
              images={images}
              selected={selected}
              focus={focus}
              active={modalIndex === null}
              onFocus={setFocus}
              onOpen={setModalIndex}
            />
          )}

          {modalImage && (
            <RemarkModal
              image={modalImage}
              initialText={notes.get(modalImage.id) ?? ""}
              selected={selected.has(modalImage.id)}
              onSave={(text) => saveFromModal(modalImage.id, text)}
              onRemove={() => removeFromModal(modalImage.id)}
              onClose={() => setModalIndex(null)}
            />
          )}

          <footer>
            <span>
              {t.footerSelected} {selected.size} / {t.footerTotal}{" "}
              {images.length}
            </span>
            <div className="actions">
              {images.length > 0 && (
                <button onClick={reset} disabled={!!progress}>
                  {t.reset}
                </button>
              )}
              <button
                className="primary"
                onClick={onGenerate}
                disabled={selected.size === 0 || !!progress}
              >
                {progress
                  ? `${t.generating} ${progress.done}/${progress.total}`
                  : t.generate}
              </button>
            </div>
          </footer>
        </>
      )}
    </div>
  );
}
