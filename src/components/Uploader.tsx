import { useRef, useState } from "react";
import { useI18n } from "../lib/i18n";

interface Props {
  onFiles: (files: File[]) => void;
  loading: boolean;
}

const ACCEPT = ["image/jpeg", "image/png"];

export function Uploader({ onFiles, loading }: Props) {
  const { t } = useI18n();
  const inputRef = useRef<HTMLInputElement>(null);
  const [drag, setDrag] = useState(false);

  function pick(list: FileList | null) {
    if (!list) return;
    const files = Array.from(list).filter((f) => ACCEPT.includes(f.type));
    if (files.length) onFiles(files);
  }

  return (
    <div
      className={`uploader${drag ? " drag" : ""}`}
      onDragOver={(e) => {
        e.preventDefault();
        setDrag(true);
      }}
      onDragLeave={() => setDrag(false)}
      onDrop={(e) => {
        e.preventDefault();
        setDrag(false);
        pick(e.dataTransfer.files);
      }}
      onClick={() => inputRef.current?.click()}
    >
      <input
        ref={inputRef}
        type="file"
        accept="image/jpeg,image/png"
        multiple
        hidden
        onChange={(e) => pick(e.target.files)}
      />
      <p>{loading ? t.uploaderLoading : t.uploaderIdle}</p>
    </div>
  );
}
