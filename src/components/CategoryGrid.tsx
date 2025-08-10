import { FC } from "react";
import { Card } from "@/components/ui/card";
import { Bone, Baby, HeartPulse, Brain } from "lucide-react";
import type { Category } from "@/types";

type Props = {
  categories: Category[];
  selectedId: string | null;
  onSelect: (id: string) => void;
};

const icons = {
  ortho: Bone,
  gyne: Baby,
  cardio: HeartPulse,
  neuro: Brain,
} as const;

const CategoryGrid: FC<Props> = ({ categories, selectedId, onSelect }) => {
  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
      {categories.map((c) => {
        const Icon = icons[c.id as keyof typeof icons] ?? HeartPulse;
        const active = selectedId === c.id;
        return (
          <button
            key={c.id}
            onClick={() => onSelect(c.id)}
            className={`group rounded-lg border p-4 text-left hover-scale focus:outline-none focus:ring-2 focus:ring-ring ${active ? "bg-secondary" : "bg-card"}`}
            aria-pressed={active}
          >
            <div className="flex items-center gap-3">
              <span className="inline-flex p-2 rounded-md bg-accent text-accent-foreground">
                <Icon className="h-5 w-5" />
              </span>
              <div>
                <p className="font-medium">{c.name}</p>
                <p className="text-xs text-muted-foreground">{active ? "Selected" : "Tap to view"}</p>
              </div>
            </div>
          </button>
        );
      })}
    </div>
  );
};

export default CategoryGrid;
