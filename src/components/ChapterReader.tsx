import React, { useEffect, useMemo, useRef, useState } from "react";
import { useParams, Link } from "react-router-dom";
import {
  ChevronLeft,
  ChevronRight,
  List,
  Settings,
  Bookmark,
  BookmarkCheck,
  Sun,
  Moon,
  Plus,
  Minus,
  Home,
} from "lucide-react";
import { Button } from "./ui/button";
import { Card, CardContent } from "./ui/card";
import { Separator } from "./ui/separator";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "./ui/dropdown-menu";
import { useReading } from "./ReadingProvider";
import {
  fetchChapterBySlug,
  fetchChaptersOfStory,
  fetchStoryIdBySlug,
  fetchTopStories,
  StoryRow,
  ChapterRow,
} from "../lib/api";
import { StoryCard } from "./StoryCard";

export function ChapterReader() {
  const { slug, chapterSlug } = useParams<{ slug: string; chapterSlug: string }>();
  const contentRef = useRef<HTMLDivElement>(null);
  const { preferences, updatePreferences, addBookmark, getBookmark } = useReading();

  const [storyId, setStoryId] = useState<string | null>(null);
  const [storyMeta, setStoryMeta] = useState<Pick<StoryRow, "title" | "coverimage" | "slug"> | null>(null);
  const [chapters, setChapters] = useState<ChapterRow[]>([]);
  const [chapter, setChapter] = useState<ChapterRow | null>(null);
  const [recommended, setRecommended] = useState<StoryRow[]>([]);
  const [loading, setLoading] = useState(true);

  // Load storyId + chapters + current chapter
  useEffect(() => {
    let alive = true;
    async function run() {
      if (!slug || !chapterSlug) return;
      setLoading(true);

      const sId = await fetchStoryIdBySlug(slug);
      if (!sId) {
        setLoading(false);
        return;
      }
      if (!alive) return;

      setStoryId(sId);

      const list = await fetchChaptersOfStory(sId);
      if (!alive) return;
      setChapters(list);

      const chap = await fetchChapterBySlug(sId, chapterSlug);
      if (!alive) return;
      setChapter(chap);

      // lấy meta
      const rec = await fetchTopStories(3);
      if (alive) setRecommended(rec);
      setStoryMeta({ title: rec[0]?.title ?? "", coverimage: rec[0]?.coverimage ?? "", slug });

      setLoading(false);
    }
    run();
    return () => {
      alive = false;
    };
  }, [slug, chapterSlug]);

  // bookmark icon state
  const isBookmarked = useMemo(() => {
    if (!slug || !chapterSlug) return false;
    const bm = getBookmark(slug);
    return bm?.chapterSlug === chapterSlug;
  }, [slug, chapterSlug, getBookmark]);

  // auto-save reading position
  useEffect(() => {
    if (!slug || !chapterSlug) return;
    const timer = setInterval(() => {
      addBookmark({
        storySlug: slug,
        chapterSlug,
        scrollPosition: window.scrollY,
      });
    }, 5000);
    return () => clearInterval(timer);
  }, [slug, chapterSlug, addBookmark]);

  // restore scroll
  useEffect(() => {
    if (!slug || !chapterSlug) return;
    const bm = getBookmark(slug);
    if (bm && bm.chapterSlug === chapterSlug && bm.scrollPosition > 0) {
      setTimeout(() => window.scrollTo(0, bm.scrollPosition), 100);
    }
  }, [slug, chapterSlug, getBookmark]);

  // fix chỗ này → dùng slug thay vì id
  const currentIndex = useMemo(
    () => chapters.findIndex((c) => c.slug === chapterSlug),
    [chapters, chapterSlug]
  );
  const previousChapter = currentIndex > 0 ? chapters[currentIndex - 1] : null;
  const nextChapter = currentIndex >= 0 && currentIndex < chapters.length - 1 ? chapters[currentIndex + 1] : null;

  const handleBookmark = () => {
    if (!slug || !chapterSlug) return;
    addBookmark({ storySlug: slug, chapterSlug, scrollPosition: window.scrollY });
  };

  const adjustFontSize = (delta: number) => {
    const newSize = Math.max(12, Math.min(24, preferences.fontSize + delta));
    updatePreferences({ fontSize: newSize });
  };

  const toggleDarkMode = () => updatePreferences({ darkMode: !preferences.darkMode });

  // preload next
  useEffect(() => {
    if (nextChapter && slug) {
      const link = document.createElement("link");
      link.rel = "prefetch";
      link.href = `/story/${slug}/${nextChapter.slug}`;
      document.head.appendChild(link);
      return () => document.head.removeChild(link);
    }
  }, [nextChapter, slug]);

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <p className="text-muted-foreground">Loading chapter…</p>
      </div>
    );
  }

  if (!chapter) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-foreground mb-4">Chapter Not Found</h1>
          <Link to="/"><Button>Back to Home</Button></Link>
        </div>
      </div>
    );
  }

  const wordCount = (chapter.content ?? "").split(/\s+/).filter(Boolean).length;

  return (
    <div className="min-h-screen bg-background">
      {/* ... Giữ nguyên phần UI ... */}

      {/* Chỗ navigation đổi id → slug */}
      <div className="bg-muted/30 border-b border-border">
        <div className="container mx-auto px-4 py-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              {previousChapter ? (
                <Link to={`/story/${slug}/${previousChapter.slug}`}>
                  <Button variant="outline" size="sm" className="flex items-center space-x-2">
                    <ChevronLeft className="h-4 w-4" /><span className="hidden sm:inline">Previous</span>
                  </Button>
                </Link>
              ) : (
                <Button variant="outline" size="sm" disabled><ChevronLeft className="h-4 w-4" /><span className="hidden sm:inline">Previous</span></Button>
              )}
            </div>

            <div className="text-center">
              <span className="text-sm text-muted-foreground">
                Chapter {currentIndex + 1} of {chapters.length}
              </span>
            </div>

            <div className="flex items-center space-x-4">
              {nextChapter ? (
                <Link to={`/story/${slug}/${nextChapter.slug}`}>
                  <Button variant="outline" size="sm" className="flex items-center space-x-2">
                    <span className="hidden sm:inline">Next</span><ChevronRight className="h-4 w-4" />
                  </Button>
                </Link>
              ) : (
                <Button variant="outline" size="sm" disabled><span className="hidden sm:inline">Next</span><ChevronRight className="h-4 w-4" /></Button>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* ... Giữ nguyên phần content, sidebar, suggested stories ... */}

    </div>
  );
}
