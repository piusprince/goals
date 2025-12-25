"use client";

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

interface CategorySelectorProps {
  name: string;
  defaultValue?: string;
}

const categories = [
  { value: "health", label: "Health & Fitness" },
  { value: "finance", label: "Finance" },
  { value: "learning", label: "Learning & Education" },
  { value: "personal", label: "Personal Development" },
  { value: "career", label: "Career" },
  { value: "other", label: "Other" },
];

export function CategorySelector({
  name,
  defaultValue,
}: Readonly<CategorySelectorProps>) {
  return (
    <Select name={name} defaultValue={defaultValue}>
      <SelectTrigger>
        <SelectValue />
      </SelectTrigger>
      <SelectContent>
        {categories.map((category) => (
          <SelectItem key={category.value} value={category.value}>
            {category.label}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
}
