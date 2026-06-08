import { useEffect, useRef } from "react";
import { LoadedImage } from "../lib/images";
import { useI18n } from "../lib/i18n";

export const GRID_COLS = 4;

interface Props {
  images: LoadedImage[];
  selected: Set<string>;
  focus: number;
  active: boolean; // 모달이 닫혀 키보드가 그리드로 가야 하는 상태
  onFocus: (index: number) => void;
  onOpen: (index: number) => void;
}

// 방향키로 커서 이동, Space로 해당 이미지 모달 열기(확대 + Remark 입력). 좌측은 포커스 미리보기.
export function Gallery({ images, selected, focus, active, onFocus, onOpen }: Props) {
  const { t } = useI18n();
  const gridRef = useRef<HTMLDivElement>(null);

  // 최초 + 모달 닫힌 직후 그리드로 포커스 복귀(키보드 조작 연속성)
  useEffect(() => {
    if (active) gridRef.current?.focus();
  }, [active]);

  function onKeyDown(e: React.KeyboardEvent) {
    const last = images.length - 1;
    let next = focus;
    switch (e.key) {
      case "ArrowRight":
        next = Math.min(last, focus + 1);
        break;
      case "ArrowLeft":
        next = Math.max(0, focus - 1);
        break;
      case "ArrowDown":
        next = Math.min(last, focus + GRID_COLS);
        break;
      case "ArrowUp":
        next = Math.max(0, focus - GRID_COLS);
        break;
      case " ":
        e.preventDefault();
        if (images[focus]) onOpen(focus);
        return;
      default:
        return;
    }
    e.preventDefault();
    if (next !== focus) onFocus(next);
  }

  // 선택된 이미지의 삽입 순서(배열 순서 기준) 번호
  const orderOf = new Map<string, number>();
  let order = 0;
  images.forEach((img) => {
    if (selected.has(img.id)) orderOf.set(img.id, ++order);
  });

  const current = images[focus];

  return (
    <div className="gallery">
      <div className="preview">
        {current ? (
          <>
            <img src={current.thumbUrl} alt={current.name} />
            <div className="preview-meta">
              <span>
                {focus + 1} / {images.length}
              </span>
              <span className="name">{current.name}</span>
              <span>
                {selected.has(current.id) ? t.previewSelected : t.previewOpen}
              </span>
            </div>
          </>
        ) : (
          <p>{t.previewNoImage}</p>
        )}
      </div>

      <div
        className="grid"
        ref={gridRef}
        tabIndex={0}
        onKeyDown={onKeyDown}
        style={{ gridTemplateColumns: `repeat(${GRID_COLS}, 1fr)` }}
      >
        {images.map((img, i) => (
          <div
            key={img.id}
            className={[
              "cell",
              i === focus ? "focused" : "",
              selected.has(img.id) ? "selected" : "",
            ].join(" ")}
            onClick={() => onFocus(i)}
            onDoubleClick={() => onOpen(i)}
          >
            <img src={img.thumbUrl} alt={img.name} loading="lazy" />
            {selected.has(img.id) && (
              <span className="badge">{orderOf.get(img.id)}</span>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
