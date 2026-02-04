import type { TimeView } from "../types";

interface TimeViewToggleProps {
  value: TimeView;
  onChange: (view: TimeView) => void;
}

const TimeViewToggle: React.FC<TimeViewToggleProps> = ({ value, onChange }) => {
  const views: { label: string; value: TimeView }[] = [
    { label: "Daily", value: "daily" },
    { label: "Weekly", value: "weekly" },
    { label: "Monthly", value: "monthly" },
  ];

  return (
    <div className="flex gap-1 bg-bg-main p-1 rounded-md w-max">
      {views.map((view) => (
        <button
          key={view.value}
          onClick={() => onChange(view.value)}
          className={`px-3 py-1 text-xs font-medium rounded ${
            value === view.value
              ? "bg-bg-surface text-accent-primary shadow-sm  text-xs"
              : "text-text-secondary hover:text-text-primary  text-xs"
          }`}
        >
          {view.label}
        </button>
      ))}
    </div>
  );
};

export default TimeViewToggle;
