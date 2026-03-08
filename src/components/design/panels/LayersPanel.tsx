"use client";

import {
  ArrowUp,
  ArrowDown,
  ChevronsUp,
  ChevronsDown,
  Lock,
  Unlock,
  Eye,
  EyeOff,
  Trash2,
} from "lucide-react";
import { useDesign } from "../DesignProvider";

export default function LayersPanel() {
  const {
    state,
    fabricRef,
    bringForward,
    sendBackward,
    bringToFront,
    sendToBack,
    toggleLock,
    toggleVisibility,
    deleteSelected,
    refreshObjects,
  } = useDesign();

  // Select object on click
  const selectObject = (objectId: string) => {
    const canvas = fabricRef.current;
    if (!canvas) return;

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const obj = canvas.getObjects().find((o: any) => o.id === objectId);
    if (obj && obj.selectable) {
      canvas.setActiveObject(obj);
      canvas.renderAll();
    }
  };

  // Delete specific object
  const deleteObject = (objectId: string) => {
    const canvas = fabricRef.current;
    if (!canvas) return;

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const obj = canvas.getObjects().find((o: any) => o.id === objectId);
    if (obj) {
      canvas.remove(obj);
      canvas.renderAll();
      refreshObjects();
    }
  };

  // Reverse to show top layers first
  const layers = [...state.objects].reverse();

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-semibold text-text-primary">Layers</h3>
        <span className="text-xs text-text-tertiary">{layers.length}</span>
      </div>

      {/* Layer ordering controls */}
      {state.selectedObjectIds.length > 0 && (
        <div className="flex items-center gap-1 pb-2 border-b border-border-primary">
          <button onClick={bringToFront} className="p-1 rounded hover:bg-bg-secondary text-text-secondary" title="Bring to Front">
            <ChevronsUp className="w-3.5 h-3.5" />
          </button>
          <button onClick={bringForward} className="p-1 rounded hover:bg-bg-secondary text-text-secondary" title="Bring Forward">
            <ArrowUp className="w-3.5 h-3.5" />
          </button>
          <button onClick={sendBackward} className="p-1 rounded hover:bg-bg-secondary text-text-secondary" title="Send Backward">
            <ArrowDown className="w-3.5 h-3.5" />
          </button>
          <button onClick={sendToBack} className="p-1 rounded hover:bg-bg-secondary text-text-secondary" title="Send to Back">
            <ChevronsDown className="w-3.5 h-3.5" />
          </button>
          <div className="flex-1" />
          <button onClick={deleteSelected} className="p-1 rounded hover:bg-bg-secondary text-red-500" title="Delete Selected">
            <Trash2 className="w-3.5 h-3.5" />
          </button>
        </div>
      )}

      {/* Object list */}
      {layers.length === 0 ? (
        <p className="text-xs text-text-tertiary text-center py-4">
          No objects on canvas
        </p>
      ) : (
        <div className="space-y-1 max-h-[400px] overflow-y-auto">
          {layers.map((obj) => {
            const isSelected = state.selectedObjectIds.includes(obj.id);
            return (
              <div
                key={obj.id}
                onClick={() => selectObject(obj.id)}
                className={`flex items-center gap-2 px-2 py-1.5 rounded text-xs cursor-pointer transition-colors ${
                  isSelected
                    ? "bg-bg-secondary border border-text-primary/20"
                    : "hover:bg-bg-secondary border border-transparent"
                }`}
              >
                <span
                  className={`flex-1 truncate ${
                    obj.visible ? "text-text-primary" : "text-text-tertiary line-through"
                  }`}
                >
                  {obj.name}
                </span>

                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    toggleVisibility(obj.id);
                  }}
                  className="p-0.5 rounded hover:bg-bg-primary text-text-tertiary"
                  title={obj.visible ? "Hide" : "Show"}
                >
                  {obj.visible ? (
                    <Eye className="w-3 h-3" />
                  ) : (
                    <EyeOff className="w-3 h-3" />
                  )}
                </button>

                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    toggleLock(obj.id);
                  }}
                  className="p-0.5 rounded hover:bg-bg-primary text-text-tertiary"
                  title={obj.locked ? "Unlock" : "Lock"}
                >
                  {obj.locked ? (
                    <Lock className="w-3 h-3" />
                  ) : (
                    <Unlock className="w-3 h-3" />
                  )}
                </button>

                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    deleteObject(obj.id);
                  }}
                  className="p-0.5 rounded hover:bg-bg-primary text-text-tertiary hover:text-red-500"
                  title="Delete"
                >
                  <Trash2 className="w-3 h-3" />
                </button>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
