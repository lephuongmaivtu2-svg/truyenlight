import { supabase } from "./supabaseClient";

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
};

export type StoryWithChapters = StoryRow & {
  chapters: ChapterRow[];
};

// Fetch story + chapters
export async function fetchStoryWithChapters(slug: string): Promise<StoryWithChapters | null> {
  const { data: story, error: storyError } = await supabase
    .from("stories")
    .select("*")
    .eq("slug", slug)
    .single();

  if (storyError || !story) {
    console.error(storyError);
    return null;
  }

  const { data: chapters, error: chapterError } = await supabase
    .from("chapters")
    .select("*")
    .eq("story_id", story.id)
    .order("created_at", { ascending: true });

  if (chapterError) console.error(chapterError);

  return { ...story, chapters: chapters || [] };
}

// Fetch top stories
export async function fetchTopStories(limit = 5, excludeId?: string): Promise<StoryRow[]> {
  let query = supabase.from("stories").select("*").order("views", { ascending: false }).limit(limit);
  if (excludeId) query = query.neq("id", excludeId);
  const { data, error } = await query;
  if (error) {
    console.error(error);
    return [];
  }
  return data || [];
}

// Fetch storyId by slug
export async function fetchStoryIdBySlug(slug: string): Promise<string | null> {
  const { data, error } = await supabase.from("stories").select("id").eq("slug", slug).single();
  if (error) {
    console.error(error);
    return null;
  }
  return data?.id ?? null;
}

// Fetch chapters of story
export async function fetchChaptersOfStory(storyId: string): Promise<ChapterRow[]> {
  const { data, error } = await supabase
    .from("chapters")
    .select("*")
    .eq("story_id", storyId)
    .order("created_at", { ascending: true });
  if (error) {
    console.error(error);
    return [];
  }
  return data || [];
}

// Fetch single chapter
export async function fetchChapterById(storyId: string, chapterId: string): Promise<ChapterRow | null> {
  const { data, error } = await supabase
    .from("chapters")
    .select("*")
    .eq("story_id", storyId)
    .eq("id", chapterId)
    .single();
  if (error) {
    console.error(error);
    return null;
  }
  return data;
}
