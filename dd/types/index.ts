/**
 * DD — Date × Decoration
 * Core domain types.
 *
 * Actor abstraction: a post author is either an Individual user or a Couple.
 * UI components should depend on `Actor` whenever possible to avoid
 * branching on the concrete account type.
 */

export type ActorType = "individual" | "couple";
export type PostType = "normal" | "date" | "reproduction";

/** Common fields shared by Individual users and Couples. */
export interface Actor {
  id: string;
  type: ActorType;
  username: string;
  displayName: string;
  avatar: string;
  bio: string;
  location: string;
  followers: number;
  following: number;
  postCount: number;
  dateCount: number;
  totalSavesGenerated: number;
  totalReproductions: number;
  averageRating: number;
  /** Demo DD Score — computed by lib/score.ts at mock-data build time. */
  ddScore: number;
}

export interface User extends Actor {
  type: "individual";
  accountType: "individual";
  /** Creator specialty shown in rankings (e.g. "夜景デート"). */
  specialty?: string;
}

export interface Couple extends Actor {
  type: "couple";
  coverImage: string;
  memberIds: [string, string];
  memberNames: [string, string];
  /** ISO date the couple started dating. */
  datingSince: string;
  favoriteDateStyles: string[];
  rankingPosition?: number;
}

export type MediaType = "image" | "video-placeholder";

export interface PostMedia {
  id: string;
  type: MediaType;
  url: string;
  alt: string;
}

export interface Post {
  id: string;
  authorId: string;
  authorType: ActorType;
  type: PostType;
  caption: string;
  media: PostMedia[];
  location?: string;
  /** Linked structured date (type === "date" or "reproduction"). */
  dateId?: string;
  /** For reproduction posts: the date being reproduced. */
  originalDateId?: string;
  /** For reproduction posts: the original post. */
  originalPostId?: string;
  likesCount: number;
  commentsCount: number;
  savesCount: number;
  reproductionsCount: number;
  isLiked: boolean;
  isSaved: boolean;
  createdAt: string;
}

export type DateScene =
  | "first-date"
  | "anniversary"
  | "casual"
  | "night"
  | "lunch"
  | "luxury"
  | "budget"
  | "rainy"
  | "outdoor"
  | "travel"
  | "surprise"
  | "home";

export interface DateStop {
  id: string;
  order: number;
  /** "17:30" style display time. */
  time: string;
  placeName: string;
  area: string;
  category: string;
  durationMinutes: number;
  /** Estimated cost per person in JPY. */
  estimatedCost: number;
  description: string;
  image: string;
}

export interface DateExperience {
  id: string;
  postId: string;
  title: string;
  area: string;
  budgetMin: number;
  budgetMax: number;
  durationMinutes: number;
  scene: DateScene;
  tags: string[];
  timeline: DateStop[];
  tips: string[];
  rating: number;
  reviewCount: number;
  saveCount: number;
  reproductionCount: number;
}

export interface ReproductionChange {
  stopId: string;
  /** "same" or a note describing what was changed. */
  changed: boolean;
  note: string;
}

export interface Reproduction {
  id: string;
  originalDateId: string;
  originalPostId: string;
  reproductionPostId: string;
  reproducerId: string;
  reproducerType: ActorType;
  changedStops: ReproductionChange[];
  comment: string;
  rating: number;
  createdAt: string;
}

export interface Comment {
  id: string;
  postId: string;
  authorId: string;
  text: string;
  createdAt: string;
}

export interface Review {
  id: string;
  dateId: string;
  authorId: string;
  rating: number;
  text: string;
  createdAt: string;
}

export interface RankingEntry {
  rank: number;
  score: number;
  actorId?: string;
  dateId?: string;
}

export type NotificationKind =
  | "follow"
  | "reproduction"
  | "comment"
  | "like"
  | "ranking"
  | "trending";

export interface AppNotification {
  id: string;
  kind: NotificationKind;
  actorId?: string;
  postId?: string;
  dateId?: string;
  message: string;
  createdAt: string;
  read: boolean;
}

export interface SavedItem {
  id: string;
  kind: "post" | "date";
  savedAt: string;
}
