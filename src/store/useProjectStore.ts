import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";
import type {
  Project,
  DesignGroup,
  Version,
  TimelineEvent,
  DeliveryItem,
  Annotation,
  Comment,
  ChangeItem,
  DeliveryRecord,
  DownloadRecord,
} from "../types";
import {
  project as initialProject,
  designGroups as initialDesignGroups,
  versions as initialVersions,
  timelineEvents as initialTimelineEvents,
  deliveryItems as initialDeliveryItems,
  currentUser,
} from "../data/mockData";

interface PersistedState {
  project: Project;
  designGroups: DesignGroup[];
  versions: Version[];
  timelineEvents: TimelineEvent[];
  deliveryItems: DeliveryItem[];
  deliveryRecord: DeliveryRecord | null;
}

interface ProjectState extends PersistedState {
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
  confirmAllDeliveries: (signature: string) => void;
  addTimelineEvent: (event: Omit<TimelineEvent, "id" | "date">) => void;
  addDownloadRecord: (type: "single" | "package", itemIds: string[]) => void;

  getDesignById: (designId: string) => any;
  getVersionById: (versionId: string) => Version | undefined;
  getAnnotationById: (annotationId: string) => Annotation | undefined;
  getAllAnnotations: () => Annotation[];
  getOpenAnnotationsCount: () => number;
  getDesignGroupByDesignId: (designId: string) => DesignGroup | undefined;
  resetStore: () => void;
}

const STORAGE_KEY = "designflow-project-state";

const getInitialState = (): PersistedState => {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) {
      const parsed = JSON.parse(stored);
      if (parsed.state) {
        const {
          project,
          designGroups,
          versions,
          timelineEvents,
          deliveryItems,
          deliveryRecord,
        } = parsed.state;
        if (
          project &&
          designGroups &&
          versions &&
          timelineEvents &&
          deliveryItems
        ) {
          return {
            project,
            designGroups,
            versions,
            timelineEvents,
            deliveryItems,
            deliveryRecord: deliveryRecord || null,
          };
        }
      }
    }
  } catch (e) {
    console.log("No persisted state found or error parsing:", e);
  }
  return {
    project: initialProject,
    designGroups: initialDesignGroups,
    versions: initialVersions,
    timelineEvents: initialTimelineEvents,
    deliveryItems: initialDeliveryItems,
    deliveryRecord: null,
  };
};

const initialPersistedState = getInitialState();

export const useProjectStore = create<ProjectState>()(
  persist(
    (set, get) => ({
      ...initialPersistedState,
      activeGroupId: initialPersistedState.designGroups[0]?.id || null,
      activeDesignId:
        initialPersistedState.designGroups[0]?.designs[0]?.id || null,
      selectedAnnotationId: null,
      compareVersionIds: [
        initialPersistedState.versions[0]?.id,
        initialPersistedState.versions[1]?.id,
      ],
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

      addTimelineEvent: (event) => {
        const newEvent: TimelineEvent = {
          ...event,
          id: `t${Date.now()}`,
          date: new Date().toISOString(),
        };
        set((state) => ({
          timelineEvents: [newEvent, ...state.timelineEvents],
        }));
      },

      addDownloadRecord: (type, itemIds) => {
        const newRecord: DownloadRecord = {
          id: `dr${Date.now()}`,
          type,
          itemIds,
          downloadedAt: new Date().toISOString(),
          downloadedBy: currentUser,
        };
        set((state) => {
          if (!state.deliveryRecord) {
            return state;
          }
          return {
            deliveryRecord: {
              ...state.deliveryRecord,
              downloadRecords: [newRecord, ...state.deliveryRecord.downloadRecords],
            },
          };
        });
      },

      updateAnnotationStatus: (annotationId, status) => {
        const annotation = get().getAnnotationById(annotationId);
        if (annotation) {
          const design = get()
            .designGroups.flatMap((g) => g.designs)
            .find((d) => d.annotations.some((a) => a.id === annotationId));
          get().addTimelineEvent({
            type: "annotation",
            title: "批注状态更新",
            description: `"${annotation.content.slice(0, 30)}..." 状态更新为"${
              status === "open"
                ? "待处理"
                : status === "resolved"
                  ? "已解决"
                  : "已关闭"
            }"`,
            user: currentUser,
          });
        }
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
        }));
      },

      addComment: (annotationId, content) => {
        const newComment: Comment = {
          id: `c${Date.now()}`,
          annotationId,
          content,
          author: currentUser,
          createdAt: new Date().toISOString(),
        };
        const annotation = get().getAnnotationById(annotationId);
        if (annotation) {
          get().addTimelineEvent({
            type: "annotation",
            title: "新增评论",
            description: "在批注中添加了新评论",
            user: currentUser,
          });
        }
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
        const design = get()
          .designGroups.flatMap((g) => g.designs)
          .find((d) => d.id === designId);
        get().addTimelineEvent({
          type: "annotation",
          title: "新增批注",
          description: `在"${design?.title || "设计方案"}"添加了新批注`,
          user: currentUser,
        });
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

      confirmAllDeliveries: (signature) => {
        const now = new Date().toISOString();
        get().addTimelineEvent({
          type: "delivery",
          title: "项目交付确认",
          description: `项目已由"${signature}"确认交付，所有文件已归档`,
          user: currentUser,
        });

        const newDeliveryRecord: DeliveryRecord = {
          id: `dvr${Date.now()}`,
          confirmedBy: currentUser.name,
          confirmedAt: now,
          signature,
          deliveryItems: [...get().deliveryItems].map((item) => ({
            ...item,
            completed: true,
          })),
          downloadRecords: [],
        };

        set((state) => ({
          deliveryItems: state.deliveryItems.map((item) => ({
            ...item,
            completed: true,
          })),
          project: {
            ...state.project,
            status: "delivered" as const,
            endDate: now.split("T")[0],
          },
          deliveryRecord: newDeliveryRecord,
        }));
      },

      getDesignById: (designId) => {
        const state = get();
        for (const group of state.designGroups) {
          const design = group.designs.find((d) => d.id === designId);
          if (design) return design;
        }
        return null;
      },

      getDesignGroupByDesignId: (designId) => {
        const state = get();
        for (const group of state.designGroups) {
          const design = group.designs.find((d) => d.id === designId);
          if (design) return group;
        }
        return undefined;
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

      resetStore: () => {
        localStorage.removeItem(STORAGE_KEY);
        set({
          project: initialProject,
          designGroups: initialDesignGroups,
          versions: initialVersions,
          timelineEvents: initialTimelineEvents,
          deliveryItems: initialDeliveryItems,
          deliveryRecord: null,
          activeGroupId: initialDesignGroups[0]?.id || null,
          activeDesignId:
            initialDesignGroups[0]?.designs[0]?.id || null,
        });
      },
    }),
    {
      name: STORAGE_KEY,
      storage: createJSONStorage(() => localStorage),
      partialize: (state) => ({
        project: state.project,
        designGroups: state.designGroups,
        versions: state.versions,
        timelineEvents: state.timelineEvents,
        deliveryItems: state.deliveryItems,
        deliveryRecord: state.deliveryRecord,
      }),
      onRehydrateStorage: () => (state) => {
        console.log("State rehydrated from localStorage");
      },
    }
  )
);
