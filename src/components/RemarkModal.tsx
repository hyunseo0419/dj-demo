import { useEffect, useRef, useState } from "react";
import { LoadedImage } from "../lib/images";
import { useI18n } from "../lib/i18n";

interface Props {
  image: LoadedImage;
  initialText: string;
  selected: boolean;
  onSave: (text: string) => void;
  onRemove: () => void;
  onClose: () => void;
}

// 스페이스로 연 모달: 확대 이미지 + 설명 입력. 저장 시 선택되고, 설명이 섹션 셀(번호 옆)에 들어간다.
export function RemarkModal({
  image,
  initialText,
  selected,
  onSave,
  onRemove,
  onClose,
}: Props) {
  const { t } = useI18n();
  const [text, setText] = useState(initialText);
  const [fullUrl, setFullUrl] = useState("");
  const taRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    const url = URL.createObjectURL(image.file);
    setFullUrl(url);
    return () => URL.revokeObjectURL(url);
  }, [image.file]);

  useEffect(() => {
    taRef.current?.focus();
  }, []);

  function onKeyDown(e: React.KeyboardEvent) {
    if (e.key === "Escape") {
      e.preventDefault();
      onClose();
    } else if ((e.metaKey || e.ctrlKey) && e.key === "Enter") {
      e.preventDefault();
      onSave(text);
    }
  }

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal" onClick={(e) => e.stopPropagation()} onKeyDown={onKeyDown}>
        <div className="modal-img">{fullUrl && <img src={fullUrl} alt={image.name} />}</div>
        <div className="modal-body">
          <div className="modal-name">{image.name}</div>

          <label className="modal-label">{t.modalDescLabel}</label>
          <textarea
            ref={taRef}
            className="ta-en"
            value={text}
            onChange={(e) => setText(e.target.value)}
            placeholder={t.modalDescPlaceholder}
          />

          <div className="modal-actions">
            <button onClick={onClose}>{t.cancel}</button>
            {selected && (
              <button className="danger" onClick={onRemove}>
                {t.remove}
              </button>
            )}
            <button className="primary" onClick={() => onSave(text)}>
              {selected ? t.save : t.saveSelect}
            </button>
          </div>
          <div className="modal-hint">
            <kbd>⌘/Ctrl</kbd>+<kbd>Enter</kbd> {t.shortcutSave} · <kbd>Esc</kbd>{" "}
            {t.shortcutClose}
          </div>
        </div>
      </div>
    </div>
  );
}
