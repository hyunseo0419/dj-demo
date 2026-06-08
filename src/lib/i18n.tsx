import { createContext, useContext, useState, ReactNode } from "react";

export type Lang = "ko" | "ja";

export interface Dict {
  title: string;
  navApp: string;
  navManual: string;
  hint: string;
  uploaderIdle: string;
  uploaderLoading: string;
  previewSelected: string;
  previewOpen: string;
  previewNoImage: string;
  footerSelected: string;
  footerTotal: string;
  reset: string;
  generate: string;
  generating: string;
  modalDescLabel: string;
  modalDescPlaceholder: string;
  cancel: string;
  remove: string;
  save: string;
  saveSelect: string;
  shortcutSave: string;
  shortcutClose: string;
  manual: {
    intro: string;
    featuresTitle: string;
    features: string[];
    stepsTitle: string;
    steps: string[];
    resultTitle: string;
    result: string;
    upcomingTitle: string;
    upcoming: string;
    noteTitle: string;
    note: string;
  };
}

const STRINGS: Record<Lang, Dict> = {
  ko: {
    title: "이미지 → 워드 리포트",
    navApp: "작업",
    navManual: "사용설명서",
    hint: "방향키로 이동 · Space 확대 + 설명 입력 · 선택 수만큼 섹션이 생성됩니다",
    uploaderIdle: "이미지를 드래그하거나 클릭해서 업로드 (JPEG/PNG)",
    uploaderLoading: "이미지 불러오는 중…",
    previewSelected: "✔ 선택됨 · 스페이스로 설명 편집",
    previewOpen: "스페이스로 열기 (확대 + 설명 입력)",
    previewNoImage: "이미지 없음",
    footerSelected: "선택",
    footerTotal: "전체",
    reset: "초기화",
    generate: "워드 생성 & 다운로드",
    generating: "생성 중…",
    modalDescLabel: "설명 (셀에 기재됩니다)",
    modalDescPlaceholder: "사진에 대한 설명을 입력하세요…",
    cancel: "취소",
    remove: "선택 해제",
    save: "저장",
    saveSelect: "선택 + 저장",
    shortcutSave: "저장",
    shortcutClose: "닫기",
    manual: {
      intro:
        "이 프로그램은 다량의 사진 중에서 필요한 것을 선택하여, 워드 보고서의 정해진 셀에 자동으로 삽입해 드리는 도구입니다.",
      featuresTitle: "주요 기능",
      features: [
        "사진 업로드 및 미리보기 — JPEG / PNG, 다량 업로드 지원",
        "키보드 선택 — 방향키로 이동, 스페이스로 선택 및 해제",
        "설명 입력 — 선택하신 사진마다 내용을 입력하여 셀에 기재",
        "워드 생성 — 선택하신 수만큼 섹션을 만들어 다운로드",
        "자동 저장 / 복원 — 작업 내용이 자동으로 보관되어 재시작 시 복원",
      ],
      stepsTitle: "사용 프로세스",
      steps: [
        "사진 업로드 — 화면 상단 영역에 사진을 드래그하시거나 클릭하여 업로드해 주십시오.",
        "사진 선택 — 방향키로 이동하시고, 스페이스 키를 누르시면 해당 사진의 입력 창이 열립니다.",
        "설명 입력 — 사진에 대한 내용을 입력하고 저장하시면 선택됩니다.",
        "워드 생성 — 하단의 ‘워드 생성’ 버튼을 누르시면 파일이 다운로드됩니다.",
      ],
      resultTitle: "기대 결과",
      result:
        "선택하신 각 사진이 번호와 함께 ‘Before’ 칸에 삽입되고, 입력하신 설명이 번호 옆 칸에 기재된 워드 문서를 받으실 수 있습니다.",
      upcomingTitle: "업데이트 예정 기능",
      upcoming:
        "한국어 · 일본어로 입력하신 설명을 영문으로 자동 번역해 드리는 기능을 준비 중입니다. (현재 버전에서는 입력하신 내용이 그대로 기재됩니다.)",
      noteTitle: "참고 사항",
      note: "작업 내용(사진 · 설명 · 선택)은 자동으로 저장되어, 실수로 창을 닫거나 새로고침하셔도 복원됩니다. ‘초기화’ 버튼을 누르시면 저장된 내용이 모두 삭제됩니다.",
    },
  },
  ja: {
    title: "画像 → Word レポート",
    navApp: "作業",
    navManual: "使用説明書",
    hint: "矢印キーで移動 · Space で拡大 + 説明入力 · 選択した数だけセクションが生成されます",
    uploaderIdle: "画像をドラッグ、またはクリックしてアップロード (JPEG/PNG)",
    uploaderLoading: "画像を読み込み中…",
    previewSelected: "✔ 選択済み · スペースで説明を編集",
    previewOpen: "スペースで開く(拡大 + 説明入力)",
    previewNoImage: "画像なし",
    footerSelected: "選択",
    footerTotal: "全体",
    reset: "リセット",
    generate: "Word 作成 & ダウンロード",
    generating: "作成中…",
    modalDescLabel: "説明(セルに記載されます)",
    modalDescPlaceholder: "写真の説明をご入力ください…",
    cancel: "キャンセル",
    remove: "選択を解除",
    save: "保存",
    saveSelect: "選択 + 保存",
    shortcutSave: "保存",
    shortcutClose: "閉じる",
    manual: {
      intro:
        "本プログラムは、多数の写真の中から必要なものを選択し、Word 報告書の所定のセルへ自動で挿入するツールでございます。",
      featuresTitle: "主な機能",
      features: [
        "写真のアップロードとプレビュー — JPEG / PNG、多数アップロード対応",
        "キーボード選択 — 矢印キーで移動、スペースで選択および解除",
        "説明の入力 — 選択した写真ごとに内容を入力し、セルに記載",
        "Word の作成 — 選択した数だけセクションを生成しダウンロード",
        "自動保存 / 復元 — 作業内容が自動的に保存され、再起動時に復元",
      ],
      stepsTitle: "ご利用の流れ",
      steps: [
        "写真のアップロード — 画面上部の領域に写真をドラッグ、またはクリックしてアップロードしてください。",
        "写真の選択 — 矢印キーで移動し、スペースキーを押すと、その写真の入力ウィンドウが開きます。",
        "説明の入力 — 写真に関する内容を入力して保存すると、選択されます。",
        "Word の作成 — 下部の「Word 作成」ボタンを押すと、ファイルがダウンロードされます。",
      ],
      resultTitle: "期待される結果",
      result:
        "選択された各写真が番号とともに「Before」欄に挿入され、ご入力いただいた説明が番号の横の欄に記載された Word 文書をお受け取りいただけます。",
      upcomingTitle: "今後のアップデート予定機能",
      upcoming:
        "韓国語・日本語でご入力いただいた説明を英語へ自動翻訳する機能を準備しております。(現在のバージョンでは、ご入力の内容がそのまま記載されます。)",
      noteTitle: "ご注意",
      note: "作業内容(写真・説明・選択)は自動的に保存され、誤ってウィンドウを閉じたり再読み込みしても復元されます。「リセット」ボタンを押すと、保存された内容はすべて削除されます。",
    },
  },
};

interface I18nValue {
  lang: Lang;
  setLang: (l: Lang) => void;
  t: Dict;
}

const I18nContext = createContext<I18nValue | null>(null);

function initialLang(): Lang {
  const saved =
    typeof localStorage !== "undefined" ? localStorage.getItem("lang") : null;
  return saved === "ja" ? "ja" : "ko";
}

export function I18nProvider({ children }: { children: ReactNode }) {
  const [lang, setLangState] = useState<Lang>(initialLang);
  const setLang = (l: Lang) => {
    setLangState(l);
    try {
      localStorage.setItem("lang", l);
    } catch {
      /* ignore */
    }
  };
  return (
    <I18nContext.Provider value={{ lang, setLang, t: STRINGS[lang] }}>
      {children}
    </I18nContext.Provider>
  );
}

export function useI18n(): I18nValue {
  const ctx = useContext(I18nContext);
  if (!ctx) throw new Error("useI18n must be used within I18nProvider");
  return ctx;
}
