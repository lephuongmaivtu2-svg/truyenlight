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
import { fetchChapterById, fetchChaptersOfStory, fetchStoryIdBySlug, fetchTopStories, StoryRow, ChapterRow } from "../lib/api";
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

      const chap = await fetchChapterById(sId, chapterSlug);
      if (!alive) return;
      setChapter(chap);

      // lấy thêm meta story để hiển thị (nhẹ nhàng lấy từ list top stories nếu có; hoặc thôi bỏ)
      const rec = await fetchTopStories(3);
      if (alive) setRecommended(rec);

      // meta cơ bản
      setStoryMeta({ title: rec[0]?.title ?? "", coverimage: rec[0]?.coverimage ?? "", slug: slug });

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

  const currentIndex = useMemo(() => chapters.findIndex((c) => c.id === chapterSlug), [chapters, chapterSlug]);
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
      link.href = `/story/${slug}/${nextChapter.id}`;
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
      {/* Top nav */}
      <div className="sticky top-0 z-50 bg-card/95 backdrop-blur border-b border-border">
        <div className="container mx-auto px-4">
          <div className="flex items-center justify-between h-14">
            {/* Left */}
            <div className="flex items-center space-x-2">
              <Link to="/"><Button variant="ghost" size="sm"><Home className="h-4 w-4" /></Button></Link>
              <Link to={`/story/${slug}`}><Button variant="ghost" size="sm"><List className="h-4 w-4 mr-2" />Chapters</Button></Link>
            </div>

            {/* Center */}
            <div className="flex-1 text-center px-4">
              <h1 className="font-semibold text-foreground truncate">{chapter.title}</h1>
              <p className="text-sm text-muted-foreground truncate">{storyMeta?.title ?? ""}</p>
            </div>

            {/* Right */}
            <div className="flex items-center space-x-2">
              <Button
                variant="ghost"
                size="sm"
                onClick={handleBookmark}
                className={isBookmarked ? "text-primary" : ""}
                aria-label="Bookmark"
              >
                {isBookmarked ? <BookmarkCheck className="h-4 w-4" /> : <Bookmark className="h-4 w-4" />}
              </Button>

              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="sm"><Settings className="h-4 w-4" /></Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-48">
                  <DropdownMenuItem onClick={toggleDarkMode}>
                    {preferences.darkMode ? (<><Sun className="h-4 w-4 mr-2" />Light Mode</>) : (<><Moon className="h-4 w-4 mr-2" />Dark Mode</>)}
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={() => adjustFontSize(-1)}><Minus className="h-4 w-4 mr-2" />Smaller Font</DropdownMenuItem>
                  <DropdownMenuItem onClick={() => adjustFontSize(1)}><Plus className="h-4 w-4 mr-2" />Larger Font</DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <div className="px-2 py-1 text-sm text-muted-foreground">Font Size: {preferences.fontSize}px</div>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </div>
        </div>
      </div>

      {/* Chapter nav */}
      <div className="bg-muted/30 border-b border-border">
        <div className="container mx-auto px-4 py-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              {previousChapter ? (
                <Link to={`/story/${slug}/${previousChapter.id}`}>
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
                <Link to={`/story/${slug}/${nextChapter.id}`}>
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

      {/* Content */}
      <div className="container mx-auto px-4 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          <div className="lg:col-span-3">
            <Card>
              <CardContent className="p-8">
                <header className="mb-8">
                  <h1 className="text-3xl font-bold text-foreground mb-2">{chapter.title}</h1>
                  <div className="flex items-center space-x-4 text-muted-foreground text-sm">
                    <span>Chapter {currentIndex + 1}</span>
                    <span>•</span>
                    <span>{wordCount.toLocaleString()} words</span>
                    <span>•</span>
                    <span>{chapter.created_at ? new Date(chapter.created_at).toLocaleDateString() : "-"}</span>
                  </div>
                </header>

                <Separator className="mb-8" />

                <div
                  ref={contentRef}
                  className="prose prose-lg max-w-none text-foreground"
                  style={{ fontSize: `${preferences.fontSize}px`, lineHeight: 1.7 }}
                >
                  {(chapter.content ?? "").split("\n").map((p, i) => (
                    <p key={i} className="mb-6 text-justify">{p}</p>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Bottom nav */}
            <div className="mt-8 flex items-center justify-between">
              {previousChapter ? (
                <Link to={`/story/${slug}/${previousChapter.id}`}>
                  <Button className="flex items-center space-x-2">
                    <ChevronLeft className="h-4 w-4" />
                    <div className="text-left">
                      <div className="text-sm opacity-75">Previous</div>
                      <div className="font-medium">{previousChapter.title}</div>
                    </div>
                  </Button>
                </Link>
              ) : <div />}

              {nextChapter ? (
                <Link to={`/story/${slug}/${nextChapter.id}`}>
                  <Button className="flex items-center space-x-2">
                    <div className="text-right">
                      <div className="text-sm opacity-75">Next</div>
                      <div className="font-medium">{nextChapter.title}</div>
                    </div>
                    <ChevronRight className="h-4 w-4" />
                  </Button>
                </Link>
              ) : <div />}
            </div>

            {/* Suggested */}
            {recommended.length > 0 && (
              <Card className="mt-8">
                <CardContent className="p-6">
                  <h3 className="text-xl font-bold text-foreground mb-4">You May Also Like</h3>
                  <div className="grid grid-cols-1 gap-4">
                    {recommended.map((s) => (
                      // @ts-ignore StoryCard mock; đủ field render
                      <StoryCard key={s.id} story={{
                        id: s.id, title: s.title, author: s.author ?? "",
                        description: s.description ?? "", coverImage: s.coverimage ?? "",
                        slug: s.slug, rating: s.rating ?? 0, views: s.views ?? 0,
                        status: s.status ?? "Ongoing", genres: [], lastUpdated: s.lastupdated ?? new Date().toISOString(), chapters: []
                      }} variant="compact" />
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            <Card>
              <CardContent className="p-6">
                <Link to={`/story/${slug}`} className="block hover:opacity-80 transition-opacity">
                  <img
                    src={storyMeta?.coverimage || "https://placehold.co/600x300?text=Story"}
                    alt={storyMeta?.title || ""}
                    className="w-full h-40 object-cover rounded mb-4"
                  />
                  <h3 className="font-bold text-foreground mb-1">{storyMeta?.title ?? ""}</h3>
                </Link>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <h4 className="font-semibold text-foreground mb-4">Navigation</h4>
                <div className="space-y-2">
                  <Link to={`/story/${slug}`}>
                    <Button variant="outline" className="w-full justify-start">
                      <List className="h-4 w-4 mr-2" />All Chapters
                    </Button>
                  </Link>
                  {previousChapter && (
                    <Link to={`/story/${slug}/${previousChapter.id}`}>
                      <Button variant="outline" className="w-full justify-start">
                        <ChevronLeft className="h-4 w-4 mr-2" />Previous Chapter
                      </Button>
                    </Link>
                  )}
                  {nextChapter && (
                    <Link to={`/story/${slug}/${nextChapter.id}`}>
                      <Button variant="outline" className="w-full justify-start">
                        <ChevronRight className="h-4 w-4 mr-2" />Next Chapter
                      </Button>
                    </Link>
                  )}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <h4 className="font-semibold text-foreground mb-4">Reading Settings</h4>
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-sm">Font Size</span>
                    <div className="flex items-center space-x-2">
                      <Button size="sm" variant="outline" onClick={() => adjustFontSize(-1)}><Minus className="h-3 w-3" /></Button>
                      <span className="text-sm w-8 text-center">{preferences.fontSize}</span>
                      <Button size="sm" variant="outline" onClick={() => adjustFontSize(1)}><Plus className="h-3 w-3" /></Button>
                    </div>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm">Theme</span>
                    <Button size="sm" variant="outline" onClick={toggleDarkMode}>
                      {preferences.darkMode ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
                    </Button>
                  </div>
                  <Button size="sm" variant="outline" className="w-full" onClick={handleBookmark}>
                    {isBookmarked ? <BookmarkCheck className="h-4 w-4 mr-2" /> : <Bookmark className="h-4 w-4 mr-2" />}
                    {isBookmarked ? "Bookmarked" : "Bookmark"}
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}
