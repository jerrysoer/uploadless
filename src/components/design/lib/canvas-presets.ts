export interface CanvasPreset {
  id: string;
  label: string;
  width: number;
  height: number;
  category: string;
}

export const CANVAS_PRESETS: CanvasPreset[] = [
  { id: "ig-post", label: "Instagram Post", width: 1080, height: 1080, category: "Social" },
  { id: "ig-story", label: "Instagram Story", width: 1080, height: 1920, category: "Social" },
  { id: "fb-post", label: "Facebook Post", width: 1200, height: 630, category: "Social" },
  { id: "x-post", label: "X / Twitter Post", width: 1200, height: 675, category: "Social" },
  { id: "linkedin-post", label: "LinkedIn Post", width: 1200, height: 627, category: "Social" },
  { id: "yt-thumbnail", label: "YouTube Thumbnail", width: 1280, height: 720, category: "Video" },
];

export const DEFAULT_PRESET = CANVAS_PRESETS[0];
