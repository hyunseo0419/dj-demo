// 작업 내용 영구 보관(갑작스런 종료/새로고침 대응).
// 이미지(원본+썸네일 Blob)는 IndexedDB에, 선택/텍스트/순서 메타도 함께 저장한다.
// localStorage는 ~5MB라 이미지를 못 담으므로 IndexedDB를 쓴다.

const DB_NAME = "img2docx";
const DB_VER = 1;
const STORE_IMG = "images";
const STORE_META = "meta";
const META_KEY = "state";

export interface StoredImage {
  id: string;
  name: string;
  aspect: number;
  file: File; // 원본(IndexedDB는 File/Blob 구조화 복제 지원)
  thumb: Blob; // 갤러리 썸네일
}

export interface StoredMeta {
  order: string[]; // 표시 순서(이미지 id)
  selected: string[];
  notes: [string, string][]; // id -> 설명 텍스트
  header?: Record<string, string>; // 상단 헤더 폼 값
  seq: number; // 다음 id 시퀀스
}

function openDB(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    const req = indexedDB.open(DB_NAME, DB_VER);
    req.onupgradeneeded = () => {
      const db = req.result;
      if (!db.objectStoreNames.contains(STORE_IMG))
        db.createObjectStore(STORE_IMG, { keyPath: "id" });
      if (!db.objectStoreNames.contains(STORE_META)) db.createObjectStore(STORE_META);
    };
    req.onsuccess = () => resolve(req.result);
    req.onerror = () => reject(req.error);
  });
}

function tx<T>(
  store: string,
  mode: IDBTransactionMode,
  fn: (s: IDBObjectStore) => IDBRequest<T>,
): Promise<T> {
  return openDB().then(
    (db) =>
      new Promise<T>((resolve, reject) => {
        const t = db.transaction(store, mode);
        const req = fn(t.objectStore(store));
        req.onsuccess = () => resolve(req.result);
        req.onerror = () => reject(req.error);
        t.oncomplete = () => db.close();
      }),
  );
}

export async function putImage(rec: StoredImage): Promise<void> {
  await tx(STORE_IMG, "readwrite", (s) => s.put(rec));
}

export async function getAllImages(): Promise<StoredImage[]> {
  return tx(STORE_IMG, "readonly", (s) => s.getAll() as IDBRequest<StoredImage[]>);
}

export async function putMeta(meta: StoredMeta): Promise<void> {
  await tx(STORE_META, "readwrite", (s) => s.put(meta, META_KEY));
}

export async function getMeta(): Promise<StoredMeta | null> {
  const m = await tx<StoredMeta | undefined>(
    STORE_META,
    "readonly",
    (s) => s.get(META_KEY) as IDBRequest<StoredMeta | undefined>,
  );
  return m ?? null;
}

export async function clearAll(): Promise<void> {
  await tx(STORE_IMG, "readwrite", (s) => s.clear());
  await tx(STORE_META, "readwrite", (s) => s.clear());
}
