import { useI18n } from "../lib/i18n";

interface Props {
  view: "app" | "manual";
  onView: (v: "app" | "manual") => void;
}

export function TopBar({ view, onView }: Props) {
  const { lang, setLang, t } = useI18n();
  return (
    <header className="topbar">
      <h1>{t.title}</h1>
      <nav className="tabs">
        <button
          className={view === "app" ? "tab active" : "tab"}
          onClick={() => onView("app")}
        >
          {t.navApp}
        </button>
        <button
          className={view === "manual" ? "tab active" : "tab"}
          onClick={() => onView("manual")}
        >
          {t.navManual}
        </button>
      </nav>
      <div className="lang">
        <button
          className={lang === "ko" ? "active" : ""}
          onClick={() => setLang("ko")}
        >
          KR
        </button>
        <button
          className={lang === "ja" ? "active" : ""}
          onClick={() => setLang("ja")}
        >
          JP
        </button>
      </div>
    </header>
  );
}
