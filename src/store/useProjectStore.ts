import { create } from "zustand";
import type {
  Project,
  DesignGroup,
  Version,
  TimelineEvent,
  DeliveryItem,
  Annotation,
  Comment,
  ChangeItem,
} from "../types";
import {
  project as initialProject,
  designGroups as initialDesignGroups,
  versions as initialVersions,
  timelineEvents as initialTimelineEvents,
  deliveryItems as initialDeliveryItems,
  currentUser,
} from "../data/mockData";

interface ProjectState {
  project: Project;
  designGroups: DesignGroup[];
  versions: Version[];
  timelineEvents: TimelineEvent[];
  deliveryItems: DeliveryItem[];
  activeGroupId: string | null;
  activeDesignId: string | null;
  selectedAnnotationId: string | null;
  compareVersionIds: [string, string];
  lightboxImage: { url: string; title: string } | null;

  setActiveGroup: (groupId: string | null) => void;
  setActiveDesign: (designId: string | null) => void;
  setSelectedAnnotation: (annotationId: string | null) => void;
  setCompareVersions: (leftId: string, rightId: string) => void;
  openLightbox: (url: string, title: string) => void;
  closeLightbox: () => void;

  updateAnnotationStatus: (
    annotationId: string,
    status: Annotation["status"]
  ) => void;
  addComment: (annotationId: string, content: string) => void;
  addAnnotation: (
    designId: string,
    x: number,
    y: number,
    content: string,
    priority: Annotation["priority"]
  ) => void;
  toggleChangeConfirmed: (changeId: string) => void;
  toggleDeliveryCompleted: (deliveryId: string) => void;
  confirmAllDeliveries: () => void;

  getDesignById: (designId: string) => any;
  getVersionById: (versionId: string) => Version | undefined;
  getAnnotationById: (annotationId: string) => Annotation | undefined;
  getAllAnnotations: () => Annotation[];
  getOpenAnnotationsCount: () => number;
}

export const useProjectStore = create<ProjectState>((set, get) => ({
  project: initialProject,
  designGroups: initialDesignGroups,
  versions: initialVersions,
  timelineEvents: initialTimelineEvents,
  deliveryItems: initialDeliveryItems,
  activeGroupId: initialDesignGroups[0]?.id || null,
  activeDesignId: initialDesignGroups[0]?.designs[0]?.id || null,
  selectedAnnotationId: null,
  compareVersionIds: [initialVersions[0]?.id, initialVersions[1]?.id],
  lightboxImage: null,

  setActiveGroup: (groupId) => set({ activeGroupId: groupId }),
  setActiveDesign: (designId) => set({ activeDesignId: designId }),
  setSelectedAnnotation: (annotationId) =>
    set({ selectedAnnotationId: annotationId }),
  setCompareVersions: (leftId, rightId) =>
    set({ compareVersionIds: [leftId, rightId] }),
  openLightbox: (url, title) =>
    set({ lightboxImage: { url, title } }),
  closeLightbox: () => set({ lightboxImage: null }),

  updateAnnotationStatus: (annotationId, status) =>
    set((state) => ({
      designGroups: state.designGroups.map((group) => ({
        ...group,
        designs: group.designs.map((design) => ({
          ...design,
          annotations: design.annotations.map((ann) =>
            ann.id === annotationId ? { ...ann, status } : ann
          ),
        })),
      })),
    })),

  addComment: (annotationId, content) => {
    const newComment: Comment = {
      id: `c${Date.now()}`,
      annotationId,
      content,
      author: currentUser,
      createdAt: new Date().toISOString(),
    };
    set((state) => ({
      designGroups: state.designGroups.map((group) => ({
        ...group,
        designs: group.designs.map((design) => ({
          ...design,
          annotations: design.annotations.map((ann) =>
            ann.id === annotationId
              ? { ...ann, comments: [...ann.comments, newComment] }
              : ann
          ),
        })),
      })),
    }));
  },

  addAnnotation: (designId, x, y, content, priority) => {
    const newAnnotation: Annotation = {
      id: `a${Date.now()}`,
      designId,
      x,
      y,
      content,
      priority,
      status: "open",
      author: currentUser,
      comments: [],
      createdAt: new Date().toISOString(),
    };
    set((state) => ({
      designGroups: state.designGroups.map((group) => ({
        ...group,
        designs: group.designs.map((design) =>
          design.id === designId
            ? {
                ...design,
                annotations: [...design.annotations, newAnnotation],
              }
            : design
        ),
      })),
    }));
  },

  toggleChangeConfirmed: (changeId) =>
    set((state) => ({
      versions: state.versions.map((version) => ({
        ...version,
        changes: version.changes.map((change) =>
          change.id === changeId
            ? { ...change, confirmed: !change.confirmed }
            : change
        ),
      })),
    })),

  toggleDeliveryCompleted: (deliveryId) =>
    set((state) => ({
      deliveryItems: state.deliveryItems.map((item) =>
        item.id === deliveryId
          ? { ...item, completed: !item.completed }
          : item
      ),
    })),

  confirmAllDeliveries: () =>
    set((state) => ({
      deliveryItems: state.deliveryItems.map((item) => ({
        ...item,
        completed: true,
      })),
      project: { ...state.project, status: "delivered" as const },
    })),

  getDesignById: (designId) => {
    const state = get();
    for (const group of state.designGroups) {
      const design = group.designs.find((d) => d.id === designId);
      if (design) return design;
    }
    return null;
  },

  getVersionById: (versionId) => {
    return get().versions.find((v) => v.id === versionId);
  },

  getAnnotationById: (annotationId) => {
    const state = get();
    for (const group of state.designGroups) {
      for (const design of group.designs) {
        const ann = design.annotations.find((a) => a.id === annotationId);
        if (ann) return ann;
      }
    }
    return undefined;
  },

  getAllAnnotations: () => {
    const state = get();
    const annotations: Annotation[] = [];
    for (const group of state.designGroups) {
      for (const design of group.designs) {
        annotations.push(...design.annotations);
      }
    }
    return annotations;
  },

  getOpenAnnotationsCount: () => {
    return get()
      .getAllAnnotations()
      .filter((a) => a.status === "open").length;
  },
}));
