import { supabase } from "../supabaseClient";

// ================== Types ==================
export type StoryRow = {
  id: string;
  slug: string;
  title: string;
  author: string | null;
  description: string | null;
  coverImage: string | null;
  genres: string[] | string | null;
  rating: number | null;
  views: number | null;
  status: string | null;
  created_at: string | null;
  lastUpdated: string | null;
};

export type ChapterRow = {
  id: string;
  story_id: string;
  title: string;
  content: string;
  created_at: string | null;
  slug: string | null;
  number: number | null;
  word_count: number | null;
  published_at: string | null;
};

export type StoryWithChapters = StoryRow & {
  chapters: ChapterRow[];
};

// Progress + Bookmark types
export type ReadingProgress = {
  id: string;
  user_id: string;
  story_id: string;
  chapter_id: string;
  scroll_position: number;
  updated_at: string;
};

export type Bookmark = {
  id: string;
  user_id: string;
  story_id: string;
  chapter_id: string;
  created_at: string;
};

// ================== Helper ==================
function slugify(text: string): string {
  return text
    .toLowerCase()
    .normalize("NFD") // bỏ dấu tiếng Việt
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

// ================== API ==================

// Fetch story + chapters (dùng join)
export async function fetchStoryWithChapters(slug: string): Promise<StoryWithChapters | null> {
  const { data, error } = await supabase
    .from("stories")
    .select(`
      *,
      chapters (*)
    `)
    .eq("slug", slug)
    .single();

  if (error || !data) {
    console.error("❌ fetchStoryWithChapters.error:", error);
    return null;
  }

  return { ...data, chapters: data.chapters || [] };
}

// Fetch top stories
export async function fetchTopStories(limit = 5, excludeId?: string): Promise<StoryRow[]> {
  let query = supabase.from("stories").select("*").order("views", { ascending: false }).limit(limit);
  if (excludeId) query = query.neq("id", excludeId);

  const { data, error } = await query;
  if (error) {
    console.error("❌ fetchTopStories.error:", error);
    return [];
  }
  return data || [];
}

// Fetch storyId by slug
export async function fetchStoryIdBySlug(slug: string): Promise<string | null> {
  const { data, error } = await supabase.from("stories").select("id").eq("slug", slug).single();
  if (error) {
    console.error("❌ fetchStoryIdBySlug.error:", error);
    return null;
  }
  return data?.id ?? null;
}

// Fetch all chapters of story
export async function fetchChaptersOfStory(storyId: string): Promise<ChapterRow[]> {
  const { data, error } = await supabase
    .from("chapters")
    .select("*")
    .eq("story_id", storyId)
    .order("created_at", { ascending: true });

  if (error) {
    console.error("❌ fetchChaptersOfStory.error:", error);
    return [];
  }
  return data || [];
}

// Fetch single chapter by ID
export async function fetchChapterById(storyId: string, chapterId: string): Promise<ChapterRow | null> {
  const { data, error } = await supabase
    .from("chapters")
    .select("*")
    .eq("story_id", storyId)
    .eq("id", chapterId)
    .single();

  if (error) {
    console.error("❌ fetchChapterById.error:", error);
    return null;
  }
  return data;
}

// Fetch single chapter by SLUG
export async function fetchChapterBySlug(storyId: string, chapterSlug: string): Promise<ChapterRow | null> {
  const { data, error } = await supabase
    .from("chapters")
    .select("*")
    .eq("story_id", storyId)
    .eq("slug", chapterSlug)
    .single();

  if (error) {
    console.error("❌ fetchChapterBySlug.error:", error);
    return null;
  }
  return data;
}

// ================== Insert ==================
// Tạo chapter mới với auto-slug
export async function createChapterWithSlug(
  storyId: string,
  title: string,
  content: string
): Promise<ChapterRow | null> {
  const slug = slugify(title);
  const wordCount = content ? content.split(/\s+/).filter(Boolean).length : 0;

  const { data, error } = await supabase
    .from("chapters")
    .insert([{
      story_id: storyId,
      title,
      content,
      slug,
      number: null,
      word_count: wordCount,
      created_at: new Date().toISOString(),
      published_at: new Date().toISOString()
    }])
    .select()
    .single();

  if (error) {
    console.error("❌ createChapterWithSlug.error:", error);
    return null;
  }
  return data;
}

// ================== Reading Progress ==================
export async function getReadingProgress(userId: string): Promise<ReadingProgress[]> {
  const { data, error } = await supabase
    .from("reading_progress")
    .select("*")
    .eq("user_id", userId)
    .order("updated_at", { ascending: false });

  if (error) {
    console.error("❌ getReadingProgress.error:", error);
    return [];
  }
  return data || [];
}

export async function updateReadingProgress(
  userId: string,
  storyId: string,
  chapterId: string,
  scrollPosition: number
): Promise<void> {
  const { error } = await supabase
    .from("reading_progress")
    .upsert({
      user_id: userId,
      story_id: storyId,
      chapter_id: chapterId,
      scroll_position: scrollPosition,
      updated_at: new Date().toISOString()
    }, { onConflict: "user_id,story_id" });

  if (error) {
    console.error("❌ updateReadingProgress.error:", error);
  }
}

// ================== Bookmarks ==================
export async function getBookmarks(userId: string): Promise<Bookmark[]> {
  const { data, error } = await supabase
    .from("bookmarks")
    .select("*")
    .eq("user_id", userId)
    .order("created_at", { ascending: false });

  if (error) {
    console.error("❌ getBookmarks.error:", error);
    return [];
  }
  return data || [];
}

export async function addBookmark(userId: string, storyId: string, chapterId: string): Promise<void> {
  const { error } = await supabase
    .from("bookmarks")
    .insert([{
      user_id: userId,
      story_id: storyId,
      chapter_id: chapterId
    }]);

  if (error) {
    console.error("❌ addBookmark.error:", error);
  }
}

export async function removeBookmark(userId: string, chapterId: string): Promise<void> {
  const { error } = await supabase
    .from("bookmarks")
    .delete()
    .eq("user_id", userId)
    .eq("chapter_id", chapterId);

  if (error) {
    console.error("❌ removeBookmark.error:", error);
  }
}
