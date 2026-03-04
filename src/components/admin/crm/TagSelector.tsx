"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Tag, Plus, X, Check } from "lucide-react";
import { createTag, deleteTag } from "@/app/actions/crm/tags";
import { toast } from "sonner";
import type { Tag as TagType } from "@prisma/client";

interface Props {
  selectedTagIds: string[];
  onChange: (tagIds: string[]) => void;
  disabled?: boolean;
}

const PRESET_COLORS = [
  "#6366f1", "#8b5cf6", "#ec4899", "#ef4444",
  "#f97316", "#eab308", "#22c55e", "#14b8a6",
  "#3b82f6", "#06b6d4", "#64748b", "#1d4ed8",
];

export function TagSelector({ selectedTagIds, onChange, disabled }: Props) {
  const [tags, setTags] = useState<(TagType & { _count: { leads: number; companies: number; persons: number } })[]>([]);
  const [open, setOpen] = useState(false);
  const [newTagName, setNewTagName] = useState("");
  const [newTagColor, setNewTagColor] = useState(PRESET_COLORS[0]);
  const [isCreating, setIsCreating] = useState(false);

  const loadTags = async () => {
    try {
      const res = await fetch("/api/admin/crm/tags");
      const data = await res.json();
      setTags(data.tags || []);
    } catch {}
  };

  useEffect(() => { loadTags(); }, []);

  const toggleTag = (tagId: string) => {
    if (selectedTagIds.includes(tagId)) {
      onChange(selectedTagIds.filter((id) => id !== tagId));
    } else {
      onChange([...selectedTagIds, tagId]);
    }
  };

  const handleCreateTag = async () => {
    if (!newTagName.trim()) return;
    setIsCreating(true);
    const result = await createTag({ name: newTagName.trim(), color: newTagColor });
    if (result.success) {
      await loadTags();
      onChange([...selectedTagIds, result.id]);
      setNewTagName("");
      toast.success("Tag opprettet");
    } else {
      toast.error(result.error);
    }
    setIsCreating(false);
  };

  const handleDeleteTag = async (tagId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    const result = await deleteTag(tagId);
    if (result.success) {
      await loadTags();
      onChange(selectedTagIds.filter((id) => id !== tagId));
    } else {
      toast.error(result.error);
    }
  };

  const selectedTags = tags.filter((t) => selectedTagIds.includes(t.id));

  return (
    <div className="space-y-2">
      <div className="flex items-center gap-2 flex-wrap">
        {selectedTags.map((tag) => (
          <span
            key={tag.id}
            className="inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-xs font-medium"
            style={{ backgroundColor: tag.color + "22", color: tag.color }}
          >
            {tag.name}
            {!disabled && (
              <button
                type="button"
                onClick={() => toggleTag(tag.id)}
                className="ml-0.5 rounded-full hover:opacity-70"
              >
                <X className="h-3 w-3" />
              </button>
            )}
          </span>
        ))}

        {!disabled && (
          <Popover open={open} onOpenChange={setOpen}>
            <PopoverTrigger asChild>
              <Button type="button" variant="outline" size="sm" className="h-6 text-xs">
                <Tag className="h-3 w-3 mr-1" />
                Tags
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-64 p-3" align="start">
              <div className="space-y-3">
                <div className="space-y-1">
                  {tags.map((tag) => (
                    <div
                      key={tag.id}
                      className="flex items-center justify-between p-1.5 rounded cursor-pointer hover:bg-muted"
                      onClick={() => toggleTag(tag.id)}
                    >
                      <div className="flex items-center gap-2">
                        <div
                          className="w-3 h-3 rounded-full flex-shrink-0"
                          style={{ backgroundColor: tag.color }}
                        />
                        <span className="text-sm">{tag.name}</span>
                      </div>
                      <div className="flex items-center gap-1">
                        {selectedTagIds.includes(tag.id) && (
                          <Check className="h-3.5 w-3.5 text-primary" />
                        )}
                        <button
                          type="button"
                          onClick={(e) => handleDeleteTag(tag.id, e)}
                          className="text-muted-foreground hover:text-destructive p-0.5 rounded"
                        >
                          <X className="h-3 w-3" />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>

                <div className="border-t pt-2 space-y-2">
                  <Label className="text-xs">Ny tag</Label>
                  <Input
                    value={newTagName}
                    onChange={(e) => setNewTagName(e.target.value)}
                    placeholder="Tagnavn..."
                    className="h-7 text-xs"
                    onKeyDown={(e) => { if (e.key === "Enter") { e.preventDefault(); handleCreateTag(); } }}
                  />
                  <div className="flex gap-1 flex-wrap">
                    {PRESET_COLORS.map((color) => (
                      <button
                        key={color}
                        type="button"
                        className={`w-5 h-5 rounded-full border-2 ${newTagColor === color ? "border-foreground scale-110" : "border-transparent"}`}
                        style={{ backgroundColor: color }}
                        onClick={() => setNewTagColor(color)}
                      />
                    ))}
                  </div>
                  <Button
                    type="button"
                    size="sm"
                    className="w-full h-7 text-xs"
                    onClick={handleCreateTag}
                    disabled={isCreating || !newTagName.trim()}
                  >
                    <Plus className="h-3 w-3 mr-1" />
                    Opprett tag
                  </Button>
                </div>
              </div>
            </PopoverContent>
          </Popover>
        )}
      </div>
    </div>
  );
}
