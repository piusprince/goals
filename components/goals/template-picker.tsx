"use client";

import { useState } from "react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import {
  GOAL_TEMPLATES,
  getPopularTemplates,
  type GoalTemplate,
  type TemplateCategory,
} from "@/lib/data/goal-templates";
import { HugeiconsIcon } from "@hugeicons/react";
import { ArrowLeft01Icon, SparklesIcon } from "@hugeicons/core-free-icons";

interface TemplatePickerProps {
  readonly onSelect: (template: GoalTemplate) => void;
  readonly onClose: () => void;
}

export function TemplatePicker({ onSelect, onClose }: TemplatePickerProps) {
  const [selectedCategory, setSelectedCategory] =
    useState<TemplateCategory | null>(null);
  const popularTemplates = getPopularTemplates();

  const handleTemplateSelect = (template: GoalTemplate) => {
    onSelect(template);
  };

  const handleBack = () => {
    if (selectedCategory) {
      setSelectedCategory(null);
    } else {
      onClose();
    }
  };

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center gap-3">
        <Button
          variant="ghost"
          size="icon"
          onClick={handleBack}
          className="shrink-0"
        >
          <HugeiconsIcon icon={ArrowLeft01Icon} className="h-5 w-5" />
        </Button>
        <div>
          <h2 className="text-lg font-semibold">
            {selectedCategory ? selectedCategory.name : "Choose a Template"}
          </h2>
          <p className="text-sm text-muted-foreground">
            {selectedCategory
              ? selectedCategory.description
              : "Start with a proven goal template"}
          </p>
        </div>
      </div>

      {!selectedCategory ? (
        <>
          {/* Popular Templates */}
          <div className="space-y-3">
            <div className="flex items-center gap-2 text-sm font-medium text-muted-foreground">
              <HugeiconsIcon icon={SparklesIcon} className="h-4 w-4" />
              Popular Templates
            </div>
            <div className="grid gap-2">
              {popularTemplates.slice(0, 4).map((template) => (
                <TemplateCard
                  key={template.id}
                  template={template}
                  onClick={() => handleTemplateSelect(template)}
                />
              ))}
            </div>
          </div>

          {/* Categories */}
          <div className="space-y-3">
            <div className="text-sm font-medium text-muted-foreground">
              Browse by Category
            </div>
            <div className="grid grid-cols-2 gap-2">
              {GOAL_TEMPLATES.map((category) => (
                <CategoryCard
                  key={category.id}
                  category={category}
                  onClick={() => setSelectedCategory(category)}
                />
              ))}
            </div>
          </div>
        </>
      ) : (
        /* Category Templates */
        <div className="grid gap-2">
          {selectedCategory.templates.map((template) => (
            <TemplateCard
              key={template.id}
              template={template}
              onClick={() => handleTemplateSelect(template)}
            />
          ))}
        </div>
      )}
    </div>
  );
}

interface TemplateCardProps {
  readonly template: GoalTemplate;
  readonly onClick: () => void;
}

function TemplateCard({ template, onClick }: TemplateCardProps) {
  return (
    <button
      onClick={onClick}
      className={cn(
        "flex items-start gap-3 rounded-lg border p-3 text-left",
        "transition-colors hover:bg-accent/50",
        "focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2"
      )}
    >
      <span className="text-2xl">{template.icon}</span>
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2">
          <span className="font-medium truncate">{template.name}</span>
          {template.popular && (
            <span className="shrink-0 rounded-full bg-primary/10 px-2 py-0.5 text-xs font-medium text-primary">
              Popular
            </span>
          )}
        </div>
        <p className="text-sm text-muted-foreground line-clamp-1">
          {template.description}
        </p>
        <div className="mt-1 flex items-center gap-2 text-xs text-muted-foreground">
          <span className="capitalize">{template.frequency}</span>
          <span>•</span>
          <span className="capitalize">{template.goalType}</span>
          {template.targetValue && (
            <>
              <span>•</span>
              <span>
                {template.targetValue} {template.targetUnit}
              </span>
            </>
          )}
        </div>
      </div>
    </button>
  );
}

interface CategoryCardProps {
  readonly category: TemplateCategory;
  readonly onClick: () => void;
}

function CategoryCard({ category, onClick }: CategoryCardProps) {
  return (
    <button
      onClick={onClick}
      className={cn(
        "flex items-center gap-3 rounded-lg border p-3 text-left",
        "transition-colors hover:bg-accent/50",
        "focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2"
      )}
    >
      <span className="text-2xl">{category.icon}</span>
      <div className="flex-1 min-w-0">
        <span className="font-medium truncate">{category.name}</span>
        <p className="text-xs text-muted-foreground">
          {category.templates.length} templates
        </p>
      </div>
    </button>
  );
}
