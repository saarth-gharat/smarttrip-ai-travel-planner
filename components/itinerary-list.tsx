"use client";

import {
  closestCenter,
  DndContext,
  DragEndEvent,
  PointerSensor,
  useSensor,
  useSensors,
} from "@dnd-kit/core";
import {
  arrayMove,
  SortableContext,
  useSortable,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { GripVertical, Loader2, MapPin, Pencil, Trash2 } from "lucide-react";
import { useState } from "react";
import { createClient } from "@/lib/supabase/client";
import EditItineraryItem from "./edit-itinerary-item";

type ItineraryItem = {
  id: string;
  trip_id: string;
  day_number: number;
  title: string;
  description: string | null;
  location: string | null;
  start_time: string | null;
  end_time: string | null;
  estimated_cost: number;
  notes: string | null;
  sort_order: number;
};

type ItineraryListProps = {
  items: ItineraryItem[];
  onItemsChange: (items: ItineraryItem[]) => void;
};

function formatTime(time: string | null) {
  if (!time) return "";

  const [hours, minutes] = time.split(":");
  const hour = Number(hours);

  if (Number.isNaN(hour)) return time;

  const suffix = hour >= 12 ? "PM" : "AM";
  const displayHour = hour % 12 || 12;

  return `${displayHour}:${minutes} ${suffix}`;
}

function SortableActivity({
  item,
  onEdit,
  onDelete,
  deleting,
}: {
  item: ItineraryItem;
  onEdit: () => void;
  onDelete: () => void;
  deleting: boolean;
}) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({
    id: item.id,
  });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={`rounded-2xl border bg-white p-5 shadow-sm transition ${
        isDragging
          ? "relative z-10 scale-[1.02] shadow-xl"
          : "hover:shadow-md"
      }`}
    >
      <div className="flex gap-4">
        <button
          type="button"
          aria-label={`Drag ${item.title}`}
          className="mt-1 flex h-9 w-9 shrink-0 cursor-grab items-center justify-center rounded-xl bg-slate-100 text-slate-400 hover:bg-slate-200 hover:text-slate-700 active:cursor-grabbing"
          {...attributes}
          {...listeners}
        >
          <GripVertical className="h-5 w-5" />
        </button>

        <div className="min-w-0 flex-1">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
            <div>
              <h3 className="text-lg font-bold text-slate-900">
                {item.title}
              </h3>

              {(item.start_time || item.end_time) && (
                <p className="mt-1 text-sm font-medium text-slate-500">
                  {formatTime(item.start_time)}
                  {item.start_time && item.end_time ? " – " : ""}
                  {formatTime(item.end_time)}
                </p>
              )}
            </div>

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={onEdit}
                className="inline-flex items-center gap-2 rounded-xl border border-slate-200 px-3 py-2 text-sm font-semibold text-slate-700 transition hover:bg-slate-50"
              >
                <Pencil className="h-4 w-4" />
                Edit
              </button>

              <button
                type="button"
                onClick={onDelete}
                disabled={deleting}
                className="inline-flex items-center gap-2 rounded-xl border border-red-100 px-3 py-2 text-sm font-semibold text-red-600 transition hover:bg-red-50 disabled:cursor-not-allowed disabled:opacity-50"
              >
                {deleting ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <Trash2 className="h-4 w-4" />
                )}
                Delete
              </button>
            </div>
          </div>

          {item.description && (
            <p className="mt-3 leading-6 text-slate-600">
              {item.description}
            </p>
          )}

          {item.location && (
            <div className="mt-4 flex items-center gap-2 text-sm text-slate-500">
              <MapPin className="h-4 w-4" />
              <span>{item.location}</span>
            </div>
          )}

          {item.estimated_cost > 0 && (
            <p className="mt-3 text-sm font-semibold text-emerald-600">
              Estimated cost: ${Number(item.estimated_cost).toLocaleString()}
            </p>
          )}

          {item.notes && (
            <div className="mt-4 rounded-xl bg-slate-50 p-3 text-sm text-slate-600">
              <span className="font-semibold text-slate-800">Notes:</span>{" "}
              {item.notes}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default function ItineraryList({
  items,
  onItemsChange,
}: ItineraryListProps) {
  const [editingItem, setEditingItem] = useState<ItineraryItem | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 8,
      },
    })
  );

  async function handleDragEnd(event: DragEndEvent) {
    const { active, over } = event;

    if (!over || active.id === over.id) {
      return;
    }

    const oldIndex = items.findIndex((item) => item.id === active.id);
    const newIndex = items.findIndex((item) => item.id === over.id);

    if (oldIndex === -1 || newIndex === -1) {
      return;
    }

    const reorderedItems = arrayMove(items, oldIndex, newIndex).map(
      (item, index) => ({
        ...item,
        sort_order: index,
      })
    );

    onItemsChange(reorderedItems);

    const supabase = createClient();

    const updates = reorderedItems.map((item) =>
      supabase
        .from("itinerary_items")
        .update({
          sort_order: item.sort_order,
        })
        .eq("id", item.id)
    );

    const results = await Promise.all(updates);

    const failedUpdate = results.find((result) => result.error);

    if (failedUpdate?.error) {
      console.error(
        "Failed to save itinerary order:",
        failedUpdate.error
      );

      alert(
        "The new order could not be saved. Please refresh the page and try again."
      );

      window.location.reload();
    }
  }

  async function handleDelete(item: ItineraryItem) {
    const confirmed = window.confirm(
      `Delete "${item.title}" from your itinerary?`
    );

    if (!confirmed) {
      return;
    }

    setDeletingId(item.id);

    const supabase = createClient();

    const { error } = await supabase
      .from("itinerary_items")
      .delete()
      .eq("id", item.id);

    if (error) {
      console.error("Delete itinerary item error:", error);

      alert(
        error.message || "Something went wrong while deleting the activity."
      );

      setDeletingId(null);
      return;
    }

    onItemsChange(items.filter((currentItem) => currentItem.id !== item.id));

    setDeletingId(null);
  }

  if (editingItem) {
    return (
      <EditItineraryItem
        item={editingItem}
        onClose={() => setEditingItem(null)}
      />
    );
  }

  if (items.length === 0) {
    return (
      <div className="rounded-2xl border border-dashed border-slate-300 bg-slate-50 p-10 text-center">
        <h3 className="text-lg font-bold text-slate-900">
          No activities yet
        </h3>

        <p className="mt-2 text-sm text-slate-500">
          Add your first activity to this day.
        </p>
      </div>
    );
  }

  const sortedItems = [...items].sort(
    (a, b) => a.sort_order - b.sort_order
  );

  return (
    <DndContext
      sensors={sensors}
      collisionDetection={closestCenter}
      onDragEnd={handleDragEnd}
    >
      <SortableContext
        items={sortedItems.map((item) => item.id)}
        strategy={verticalListSortingStrategy}
      >
        <div className="space-y-4">
          {sortedItems.map((item) => (
            <SortableActivity
              key={item.id}
              item={item}
              onEdit={() => setEditingItem(item)}
              onDelete={() => handleDelete(item)}
              deleting={deletingId === item.id}
            />
          ))}
        </div>
      </SortableContext>
    </DndContext>
  );
}