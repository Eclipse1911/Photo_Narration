import { 
  collection, 
  doc, 
  getDoc, 
  getDocs, 
  setDoc, 
  addDoc, 
  updateDoc, 
  deleteDoc, 
  query, 
  where, 
  orderBy, 
  limit, 
  runTransaction,
  increment,
  Timestamp 
} from 'firebase/firestore';
import { db } from './config';
import { Story, UserProfile } from '../types';

const STORIES_COLLECTION = 'stories';
const USERS_COLLECTION = 'users';

// Pre-seeded stories if the Firestore database is fresh
const SAMPLE_STORIES: Omit<Story, 'id'>[] = [
  {
    userId: 'seed_author_1',
    title: 'The Whispering Pines of Emerald Lake',
    description: 'A quiet dawn walk in the Canadian Rockies',
    aiNarration: 'As first light pierced through the misty canopy of ancient pines, the glass-like surface of Emerald Lake mirrored a quiet world untouched by time. The air tasted of pine needles and cold mountain granite, carrying an unspoken story of stillness that settled deep within the soul.',
    imageURL: 'https://images.unsplash.com/photo-1506744038136-46273834b3fb?auto=format&fit=crop&w=1200&q=80',
    tags: ['Nature', 'Travel'],
    isPublic: true,
    createdAt: new Date(Date.now() - 3600000 * 2).toISOString(),
    likesCount: 24,
    authorName: 'Aria Sterling',
    authorAvatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=200&q=80'
  },
  {
    userId: 'seed_author_2',
    title: 'Golden Hour on Shibuya Crossing',
    description: 'Urban energy caught in amber afternoon light',
    aiNarration: 'Thousands of footsteps rhythmically crossed the asphalt, bathed in the rich amber brilliance of late Tokyo afternoon sun. Midst the sea of neon signs and rushing shadows, a brief instant of silent harmony flickered—a reminder that in the busiest places on Earth, individual moments remain soft and solitary.',
    imageURL: 'https://images.unsplash.com/photo-1503899036084-c55cdd92da26?auto=format&fit=crop&w=1200&q=80',
    tags: ['Travel', 'Architecture', 'People'],
    isPublic: true,
    createdAt: new Date(Date.now() - 3600000 * 8).toISOString(),
    likesCount: 42,
    authorName: 'Kenji Takahashi',
    authorAvatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=200&q=80'
  },
  {
    userId: 'seed_author_3',
    title: 'Artisanal Hearth & Morning Roast',
    description: 'Rustic coffee brewing at dawn',
    aiNarration: 'The rich, earthy aroma of freshly roasted beans mingled with steam rising against dark wooden panels. Every pour was an intentional ritual, turning a quiet morning corner into a sanctuary of warmth and sensory comfort.',
    imageURL: 'https://images.unsplash.com/photo-1495474472287-4d71bcdd2085?auto=format&fit=crop&w=1200&q=80',
    tags: ['Food', 'Portrait'],
    isPublic: true,
    createdAt: new Date(Date.now() - 3600000 * 24).toISOString(),
    likesCount: 19,
    authorName: 'Mateo Rossi',
    authorAvatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=200&q=80'
  },
  {
    userId: 'seed_author_4',
    title: 'Shadows of the Gothic Archway',
    description: 'Architectural geometry in Prague',
    aiNarration: 'Drawn by stone carved centuries ago, shafts of geometric sunlight sliced through the Gothic portico. The interplay of dark stone and luminous archways created a hauntingly beautiful tapestry of history and shadows.',
    imageURL: 'https://images.unsplash.com/photo-1513694203232-719a280e022f?auto=format&fit=crop&w=1200&q=80',
    tags: ['Architecture', 'Abstract'],
    isPublic: true,
    createdAt: new Date(Date.now() - 3600000 * 36).toISOString(),
    likesCount: 31,
    authorName: 'Sophie Bennett',
    authorAvatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=200&q=80'
  },
  {
    userId: 'seed_author_1',
    title: 'Solitude at Black Sand Beach',
    description: 'Vík, Iceland coast under moody skies',
    aiNarration: 'Basalt columns stood like silent sentinels against the roaring Atlantic waves. The contrast between dark volcanic sand and white sea foam captured the wild, untamed spirit of northern frontiers.',
    imageURL: 'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&w=1200&q=80',
    tags: ['Nature', 'Travel'],
    isPublic: true,
    createdAt: new Date(Date.now() - 3600000 * 48).toISOString(),
    likesCount: 56,
    authorName: 'Aria Sterling',
    authorAvatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=200&q=80'
  },
  {
    userId: 'seed_author_2',
    title: 'Portrait in Warm Analog Tones',
    description: 'Film photography experimental lighting',
    aiNarration: 'Gently illuminated by soft window light, subtle grain and deep crimson shadows gave the expression a timeless depth. It spoke of unspoken thoughts and quiet contemplation trapped in a single frame.',
    imageURL: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&w=1200&q=80',
    tags: ['Portrait', 'People'],
    isPublic: true,
    createdAt: new Date(Date.now() - 3600000 * 72).toISOString(),
    likesCount: 38,
    authorName: 'Kenji Takahashi',
    authorAvatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=200&q=80'
  }
];

export async function createStory(storyData: Omit<Story, 'id'>): Promise<string> {
  const storiesRef = collection(db, STORIES_COLLECTION);
  const docRef = await addDoc(storiesRef, {
    ...storyData,
    createdAt: storyData.createdAt || new Date().toISOString(),
    likesCount: storyData.likesCount || 0
  });
  return docRef.id;
}

export async function seedSampleStoriesIfNeeded(): Promise<Story[]> {
  try {
    const storiesRef = collection(db, STORIES_COLLECTION);
    const q = query(storiesRef, where('isPublic', '==', true), limit(10));
    const snapshot = await getDocs(q);

    if (snapshot.empty) {
      console.log('No public stories found in Firestore. Seeding initial stories...');
      const seeded: Story[] = [];
      for (const sample of SAMPLE_STORIES) {
        const id = await createStory(sample);
        seeded.push({ ...sample, id });
      }
      return seeded;
    }

    return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Story));
  } catch (err) {
    console.warn('Unable to query Firestore or seed stories, returning sample dataset:', err);
    return SAMPLE_STORIES.map((s, idx) => ({ ...s, id: `sample_${idx + 1}` }));
  }
}

export async function getPublicStories(options?: {
  searchQuery?: string;
  tag?: string;
  limitCount?: number;
}): Promise<Story[]> {
  try {
    const storiesRef = collection(db, STORIES_COLLECTION);
    const q = query(storiesRef, where('isPublic', '==', true));
    const snapshot = await getDocs(q);

    let stories: Story[] = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Story));

    // If database was empty, auto seed
    if (stories.length === 0) {
      stories = await seedSampleStoriesIfNeeded();
    }

    // Filter by tag if requested
    if (options?.tag && options.tag !== 'All') {
      stories = stories.filter(s => s.tags?.includes(options.tag!));
    }

    // Filter by search query if requested
    if (options?.searchQuery) {
      const queryLower = options.searchQuery.toLowerCase().trim();
      stories = stories.filter(s => 
        s.title.toLowerCase().includes(queryLower) ||
        s.aiNarration.toLowerCase().includes(queryLower) ||
        (s.tags && s.tags.some(t => t.toLowerCase().includes(queryLower))) ||
        (s.authorName && s.authorName.toLowerCase().includes(queryLower))
      );
    }

    // Sort by createdAt descending
    stories.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());

    if (options?.limitCount) {
      stories = stories.slice(0, options.limitCount);
    }

    return stories;
  } catch (err) {
    console.warn('Error fetching public stories, using fallback data:', err);
    let stories = SAMPLE_STORIES.map((s, idx) => ({ ...s, id: `sample_${idx + 1}` }));
    if (options?.tag && options.tag !== 'All') {
      stories = stories.filter(s => s.tags?.includes(options.tag!));
    }
    if (options?.searchQuery) {
      const queryLower = options.searchQuery.toLowerCase().trim();
      stories = stories.filter(s => 
        s.title.toLowerCase().includes(queryLower) ||
        s.aiNarration.toLowerCase().includes(queryLower)
      );
    }
    if (options?.limitCount) {
      stories = stories.slice(0, options.limitCount);
    }
    return stories;
  }
}

export async function getStoryById(storyId: string): Promise<Story | null> {
  try {
    const docRef = doc(db, STORIES_COLLECTION, storyId);
    const snap = await getDoc(docRef);
    if (snap.exists()) {
      return { id: snap.id, ...snap.data() } as Story;
    }
    // Check sample stories if id starts with sample_
    if (storyId.startsWith('sample_')) {
      const index = parseInt(storyId.replace('sample_', '')) - 1;
      if (index >= 0 && index < SAMPLE_STORIES.length) {
        return { ...SAMPLE_STORIES[index], id: storyId };
      }
    }
    return null;
  } catch (err) {
    console.warn(`Error fetching story ${storyId}:`, err);
    if (storyId.startsWith('sample_')) {
      const index = parseInt(storyId.replace('sample_', '')) - 1;
      if (index >= 0 && index < SAMPLE_STORIES.length) {
        return { ...SAMPLE_STORIES[index], id: storyId };
      }
    }
    return null;
  }
}

export async function getUserStories(userId: string): Promise<Story[]> {
  try {
    const storiesRef = collection(db, STORIES_COLLECTION);
    const q = query(storiesRef, where('userId', '==', userId));
    const snapshot = await getDocs(q);
    const stories = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Story));
    return stories.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  } catch (err) {
    console.warn('Error fetching user stories:', err);
    return [];
  }
}

export async function getLikedStories(userId: string): Promise<Story[]> {
  try {
    // Query public stories or all stories
    const publicStories = await getPublicStories();
    const liked: Story[] = [];

    for (const story of publicStories) {
      if (story.id.startsWith('sample_')) continue;
      const likeDocRef = doc(db, STORIES_COLLECTION, story.id, 'likes', userId);
      const snap = await getDoc(likeDocRef);
      if (snap.exists()) {
        liked.push(story);
      }
    }

    return liked;
  } catch (err) {
    console.warn('Error fetching liked stories:', err);
    return [];
  }
}

export async function updateStory(storyId: string, updates: Partial<Story>): Promise<void> {
  const docRef = doc(db, STORIES_COLLECTION, storyId);
  await updateDoc(docRef, updates);
}

export async function deleteStory(storyId: string): Promise<void> {
  const docRef = doc(db, STORIES_COLLECTION, storyId);
  await deleteDoc(docRef);
}

export async function toggleLikeStory(storyId: string, userId: string): Promise<{ liked: boolean; newCount: number }> {
  if (storyId.startsWith('sample_')) {
    // Simulated like for sample stories
    return { liked: true, newCount: 25 };
  }

  const storyRef = doc(db, STORIES_COLLECTION, storyId);
  const likeRef = doc(db, STORIES_COLLECTION, storyId, 'likes', userId);

  const likeSnap = await getDoc(likeRef);
  const isCurrentlyLiked = likeSnap.exists();

  if (isCurrentlyLiked) {
    await deleteDoc(likeRef);
    await updateDoc(storyRef, { likesCount: increment(-1) });
    const updatedSnap = await getDoc(storyRef);
    const newCount = updatedSnap.exists() ? (updatedSnap.data().likesCount || 0) : 0;
    return { liked: false, newCount };
  } else {
    await setDoc(likeRef, { likedAt: new Date().toISOString() });
    await updateDoc(storyRef, { likesCount: increment(1) });
    const updatedSnap = await getDoc(storyRef);
    const newCount = updatedSnap.exists() ? (updatedSnap.data().likesCount || 0) : 1;
    return { liked: true, newCount };
  }
}

export async function checkUserLikedStory(storyId: string, userId: string): Promise<boolean> {
  if (!userId || storyId.startsWith('sample_')) return false;
  try {
    const likeRef = doc(db, STORIES_COLLECTION, storyId, 'likes', userId);
    const snap = await getDoc(likeRef);
    return snap.exists();
  } catch (err) {
    return false;
  }
}

export async function getUserProfile(userId: string): Promise<UserProfile | null> {
  try {
    const docRef = doc(db, USERS_COLLECTION, userId);
    const snap = await getDoc(docRef);
    if (snap.exists()) {
      return { uid: userId, ...snap.data() } as UserProfile;
    }
    // Check if it's a seed author
    if (userId.startsWith('seed_author_')) {
      const sample = SAMPLE_STORIES.find(s => s.userId === userId);
      if (sample) {
        return {
          uid: userId,
          displayName: sample.authorName || 'Featured Author',
          email: `${userId}@photonarrator.app`,
          photoURL: sample.authorAvatar,
          bio: 'Visual storyteller exploring light, emotion, and places around the globe.',
          createdAt: new Date().toISOString()
        };
      }
    }
    return null;
  } catch (err) {
    console.warn(`Error fetching user profile ${userId}:`, err);
    return null;
  }
}
