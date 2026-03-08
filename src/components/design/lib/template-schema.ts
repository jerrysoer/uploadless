export interface TemplateMeta {
  id: string;
  name: string;
  description: string;
  category: string;
  presetId: string;
  width: number;
  height: number;
  fonts: string[];
  thumbnail: string;
}

export interface TemplateCatalog {
  templates: TemplateMeta[];
}

/** The Fabric.js JSON shape stored in each template file */
export interface TemplateJSON {
  version: string;
  objects: Record<string, unknown>[];
  background?: string;
  backgroundImage?: Record<string, unknown>;
}
