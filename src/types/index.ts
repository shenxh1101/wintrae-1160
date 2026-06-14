export interface User {
  id: string;
  name: string;
  role: "designer" | "client";
  avatar: string;
}

export interface Project {
  id: string;
  title: string;
  client: string;
  designer: User;
  description: string;
  coverImage: string;
  startDate: string;
  endDate: string;
  status: "draft" | "review" | "revision" | "approved" | "delivered";
  progress: number;
}

export interface DesignGroup {
  id: string;
  name: string;
  description: string;
  designs: Design[];
}

export interface Design {
  id: string;
  title: string;
  description: string;
  imageUrl: string;
  version: number;
  status: "pending" | "approved" | "revision";
  annotations: Annotation[];
  createdAt: string;
}

export interface Annotation {
  id: string;
  designId: string;
  x: number;
  y: number;
  content: string;
  priority: "low" | "medium" | "high";
  status: "open" | "resolved" | "closed";
  author: User;
  comments: Comment[];
  createdAt: string;
}

export interface Comment {
  id: string;
  annotationId: string;
  content: string;
  author: User;
  createdAt: string;
}

export interface Version {
  id: string;
  number: number;
  name: string;
  description: string;
  designIds: string[];
  createdAt: string;
  changes: ChangeItem[];
}

export interface ChangeItem {
  id: string;
  type: "added" | "modified" | "removed";
  description: string;
  designId?: string;
  confirmed: boolean;
}

export interface TimelineEvent {
  id: string;
  type: "version" | "annotation" | "status" | "delivery";
  title: string;
  description: string;
  date: string;
  user: User;
}

export interface DeliveryItem {
  id: string;
  name: string;
  description: string;
  fileType: string;
  fileSize: string;
  completed: boolean;
}

export type PageRoute = "/" | "/browse" | "/comments" | "/compare" | "/delivery";
