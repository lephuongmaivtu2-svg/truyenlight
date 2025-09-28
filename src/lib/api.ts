import { supabase } from "../supabaseClient";

// ================== Types ==================
export type StoryRow = {
  id: string;
  slug: string;
  title: string;
  author: string | null;
  description: string | null;
  coverimage: string | null;
  genres: string[] | string | null;
  rating: number | null;
  views: number | null;
  status: string | null;
  created_at: string | null;
  lastupdated: string | null;
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

// Fetch story + chapters
export async function fetchStoryWithChapters(slug: string): Promise<StoryWithChapters | null> {
  const { data: story, error: storyError } = await supabase
    .from("stories")
    .select("*")
    .eq("slug", slug)
    .single();

  if (storyError || !story) {
    console.error("❌ fetchStoryWithChapters.storyError:", storyError);
    return null;
  }

  const { data: chapters, error: chapterError } = await supabase
    .from("chapters")
    .select("*")
    .eq("story_id", story.id)
    .order("created_at", { ascending: true });

  if (chapterError) {
    console.error("❌ fetchStoryWithChapters.chapterError:", chapterError);
  }

  return { ...story, chapters: chapters || [] };
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
