import { useI18n } from "../lib/i18n";

// 워드 상단 헤더 표의 입력 항목(키 = docx 플레이스홀더). 라벨은 양식 그대로 영문.
const FIELDS: { key: string; label: string }[] = [
  { key: "DATE", label: "Date" },
  { key: "SHIP_NAME", label: "Ship's Name" },
  { key: "IMO", label: "IMO Number" },
  { key: "FLAG", label: "Flag" },
  { key: "KEEL_LAY", label: "Keel Lay" },
  { key: "DELIVERY", label: "Delivery" },
  { key: "GROSS_TONNAGE", label: "Gross Tonnage" },
  { key: "DEADWEIGHT", label: "Deadweight" },
  { key: "OWNER", label: "Owner" },
  { key: "MANNING_COMPANY", label: "Manning Company" },
  { key: "CREW_NATIONALITY", label: "Crew nationality" },
  { key: "NUMBER_OF_CREW", label: "Number of Crew" },
  { key: "DATE_OF_INSPECTION", label: "Date of Inspection" },
  { key: "PORT_OF_INSPECTION", label: "Port of Inspection" },
  { key: "INSPECTOR", label: "Inspector" },
  { key: "DUE_DATE", label: "Due date to rectify" },
  { key: "DATE_OF_RECTIFIED", label: "Date of Rectified" },
  { key: "MASTER", label: "Master" },
  { key: "CHIEF_OFFICER", label: "Chief officer" },
  { key: "CHIEF_ENGINEER", label: "Chief engineer" },
];

interface Props {
  values: Record<string, string>;
  onChange: (key: string, value: string) => void;
}

export function HeaderForm({ values, onChange }: Props) {
  const { t } = useI18n();
  return (
    <section className="header-form">
      <h2>{t.headerTitle}</h2>
      <p className="hint">{t.headerHint}</p>
      <div className="hf-grid">
        {FIELDS.map((f) => (
          <label key={f.key} className="hf-field">
            <span>{f.label}</span>
            <input
              type="text"
              value={values[f.key] ?? ""}
              onChange={(e) => onChange(f.key, e.target.value)}
            />
          </label>
        ))}
      </div>
    </section>
  );
}
