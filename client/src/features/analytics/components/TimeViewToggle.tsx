import type { TimeView } from "../types";
import { Button } from "@/components/ui/button";

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
    <div className="flex gap-2 bg-bg-surface p-1 rounded-lg">
      {views.map((view) => (
        <Button
          key={view.value}
          onClick={() => onChange(view.value)}
          variant={value === view.value ? "default" : "ghost"}
          size="sm"
          className={
            value === view.value
              ? "bg-accent-primary text-white hover:bg-accent-primary/90"
              : "text-text-secondary hover:text-text-primary"
          }
        >
          {view.label}
        </Button>
      ))}
    </div>
  );
};

export default TimeViewToggle;
