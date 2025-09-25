import { supabase } from "../supabaseClient";

export type StoryRow = {
  id: string;
  title: string;
  description: string | null;
  author: string | null;
  slug: string;
  coverimage: string | null; // cột coverImage trong DB là "coverimage"
  rating: number | null;
  views: number | null;
  status: string | null;
  genres: string[] | null;   // text[]
  lastupdated: string | null;
  created_at: string | null;
};

export type ChapterRow = {
  id: string;
  story_id: string;
  title: string;
  content: string;
  created_at: string | null;
};

export type StoryWithChapters = StoryRow & { chapters: ChapterRow[] };

export async function fetchStoryWithChapters(slug: string): Promise<StoryWithChapters | null> {
  const { data: story, error } = await supabase
    .from("stories")
    .select("*")
    .eq("slug", slug)
    .single();

  if (error || !story) return null;

  const { data: chapters, error: cErr } = await supabase
    .from("chapters")
    .select("*")
    .eq("story_id", story.id)
    .order("created_at", { ascending: true });

  if (cErr) return { ...(story as StoryRow), chapters: [] };

  return { ...(story as StoryRow), chapters: (chapters ?? []) as ChapterRow[] };
}

export async function fetchTopStories(limit = 4, excludeId?: string): Promise<StoryRow[]> {
  let query = supabase
    .from("stories")
    .select("*")
    .order("views", { ascending: false })
    .limit(limit);

  if (excludeId) {
    query = query.neq("id", excludeId);
  }

  const { data, error } = await query;
  if (error || !data) return [];
  return data as StoryRow[];
}

export async function fetchStoryIdBySlug(slug: string): Promise<string | null> {
  const { data, error } = await supabase
    .from("stories")
    .select("id")
    .eq("slug", slug)
    .single();

  if (error || !data) return null;
  return data.id as string;
}

export async function fetchChaptersOfStory(storyId: string): Promise<ChapterRow[]> {
  const { data, error } = await supabase
    .from("chapters")
    .select("*")
    .eq("story_id", storyId)
    .order("created_at", { ascending: true });

  if (error || !data) return [];
  return data as ChapterRow[];
}

export async function fetchChapterById(storyId: string, chapterId: string): Promise<ChapterRow | null> {
  const { data, error } = await supabase
    .from("chapters")
    .select("*")
    .eq("story_id", storyId)
    .eq("id", chapterId)
    .single();

  if (error || !data) return null;
  return data as ChapterRow;
}
