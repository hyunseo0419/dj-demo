import { useI18n } from "../lib/i18n";

export type View = "app" | "header" | "manual";

interface Props {
  view: View;
  onView: (v: View) => void;
}

export function TopBar({ view, onView }: Props) {
  const { lang, setLang, t } = useI18n();
  const tabs: { id: View; label: string }[] = [
    { id: "app", label: t.navApp },
    { id: "header", label: t.navHeader },
    { id: "manual", label: t.navManual },
  ];
  return (
    <header className="topbar">
      <h1>{t.title}</h1>
      <nav className="tabs">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            className={view === tab.id ? "tab active" : "tab"}
            onClick={() => onView(tab.id)}
          >
            {tab.label}
          </button>
        ))}
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
