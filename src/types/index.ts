export interface UserProfile {
  uid: string;
  displayName: string;
  email: string;
  photoURL?: string;
  bio?: string;
  createdAt: string;
}

export interface Story {
  id: string;
  userId: string;
  title: string;
  description?: string; // Optional user prompt or notes
  aiNarration: string;
  imageURL: string;
  tags: string[];
  isPublic: boolean;
  createdAt: string; // ISO string
  likesCount: number;
  authorName?: string;
  authorAvatar?: string;
}

export interface LikeRecord {
  likedAt: string;
}

export type PresetTag = 
  | 'Nature' 
  | 'Travel' 
  | 'Food' 
  | 'Portrait' 
  | 'Architecture' 
  | 'Abstract' 
  | 'People';

export const PRESET_TAGS: PresetTag[] = [
  'Nature',
  'Travel',
  'Food',
  'Portrait',
  'Architecture',
  'Abstract',
  'People'
];

export interface NarrateRequest {
  imageBase64: string;
  mimeType?: string;
  hint?: string;
}

export interface NarrateResponse {
  narration: string;
  error?: string;
}
