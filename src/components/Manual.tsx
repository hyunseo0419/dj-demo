import { useI18n } from "../lib/i18n";

export function Manual() {
  const { t } = useI18n();
  const m = t.manual;
  return (
    <article className="manual">
      <h2>{t.navManual}</h2>
      <p className="manual-intro">{m.intro}</p>

      <h3>{m.featuresTitle}</h3>
      <ul className="manual-steps">
        {m.features.map((f, i) => (
          <li key={i}>{f}</li>
        ))}
      </ul>

      <h3>{m.stepsTitle}</h3>
      <ol className="manual-steps">
        {m.steps.map((s, i) => (
          <li key={i}>{s}</li>
        ))}
      </ol>

      <h3>{m.resultTitle}</h3>
      <p>{m.result}</p>

      <h3>{m.upcomingTitle}</h3>
      <p className="manual-upcoming">🛠 {m.upcoming}</p>

      <h3>{m.noteTitle}</h3>
      <p className="manual-note">{m.note}</p>
    </article>
  );
}
