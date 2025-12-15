"use client";

interface ConfidenceSliderProps {
  value: number;
  onChange: (value: number) => void;
  color: string;
}

const LEVELS = [
  { label: "Assumption", value: 20 },
  { label: "Testing", value: 50 },
  { label: "Proven", value: 90 },
] as const;

export function ConfidenceSlider({ value, onChange }: ConfidenceSliderProps) {
  const getIndex = () => {
    if (value < 35) return 0;
    if (value < 70) return 1;
    return 2;
  };

  const activeIndex = getIndex();

  return (
    <div className="inline-flex rounded-lg bg-stone-100 p-0.5">
      {LEVELS.map((level, i) => (
        <button
          key={level.label}
          type="button"
          onClick={() => onChange(level.value)}
          className={`
            px-3 py-1 text-xs font-medium rounded-md transition-all duration-200
            ${activeIndex === i
              ? "bg-white text-stone-900 shadow-sm"
              : "text-stone-500 hover:text-stone-700"
            }
          `}
        >
          {level.label}
        </button>
      ))}
    </div>
  );
}
