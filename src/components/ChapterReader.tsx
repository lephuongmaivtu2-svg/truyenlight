import React, { useEffect, useMemo, useState } from "react";
import { useParams, Link } from "react-router-dom";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { Button } from "./ui/button";
import { useReading } from "./ReadingProvider";
import {
  fetchStoryWithChapters,
  StoryWithChapters,
  ChapterRow,
} from "../lib/api";

export function ChapterReader() {
  const { slug, chapterSlug } = useParams<{ slug: string; chapterSlug: string }>();
  const { addBookmark, getBookmark, preferences, updatePreferences } = useReading();

  const [story, setStory] = useState<StoryWithChapters | null>(null);
  const [chapter, setChapter] = useState<ChapterRow | null>(null);
  const [loading, setLoading] = useState(true);

  // Load story + chapters
  useEffect(() => {
    let alive = true;
    async function run() {
      if (!slug || !chapterSlug) return;
      setLoading(true);

      const s = await fetchStoryWithChapters(slug);
      if (!alive || !s) return;

      setStory(s);

      // tìm chapter theo slug hoặc id
      const chap = s.chapters.find(
        (c) => c.slug === chapterSlug || c.id === chapterSlug
      );
      setChapter(chap ?? null);

      setLoading(false);
    }
    run();
    return () => { alive = false; };
  }, [slug, chapterSlug]);

  // bookmark state
  const isBookmarked = useMemo(() => {
    if (!slug || !chapterSlug) return false;
    const bm = getBookmark(slug);
    return bm?.chapterSlug === chapterSlug;
  }, [slug, chapterSlug, getBookmark]);

  // auto-save bookmark
  useEffect(() => {
    if (!slug || !chapterSlug) return;
    const timer = setInterval(() => {
      addBookmark({ storySlug: slug, chapterSlug, scrollPosition: window.scrollY });
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

  // index chapter
  const chapters = story?.chapters ?? [];
  const currentIndex = useMemo(
    () => chapters.findIndex((c) => c.id === chapter?.id),
    [chapters, chapter]
  );
  const previousChapter = currentIndex > 0 ? chapters[currentIndex - 1] : null;
  const nextChapter = currentIndex >= 0 && currentIndex < chapters.length - 1 ? chapters[currentIndex + 1] : null;

  if (loading) {
    return <div className="container mx-auto px-4 py-8"><p>Loading chapter…</p></div>;
  }

  if (!story || !chapter) {
    return (
      <div className="container mx-auto px-4 py-8 text-center">
        <h1 className="text-2xl font-bold mb-4">Chapter Not Found</h1>
        <Link to="/"><Button>Back to Home</Button></Link>
      </div>
    );
  }

  const wordCount = (chapter.content ?? "").split(/\s+/).filter(Boolean).length;

  return (
    <div className="min-h-screen bg-background">
      {/* Header nav */}
      <div className="bg-muted/30 border-b border-border">
        <div className="container mx-auto px-4 py-3 flex items-center justify-between">
          {/* Prev */}
          {previousChapter ? (
            <Link to={`/story/${slug}/${previousChapter.slug || previousChapter.id}`}>
              <Button variant="outline" size="sm"><ChevronLeft className="h-4 w-4" /> Trước</Button>
            </Link>
          ) : (
            <Button variant="outline" size="sm" disabled><ChevronLeft className="h-4 w-4" /> Trước</Button>
          )}

          {/* Về trang truyện */}
          <Link to={`/story/${slug}`}>
            <Button variant="ghost" size="sm" className="mx-2">
              Về trang truyện
            </Button>
          </Link>

          {/* Next */}
          {nextChapter ? (
            <Link to={`/story/${slug}/${nextChapter.slug || nextChapter.id}`}>
              <Button variant="outline" size="sm">Sau <ChevronRight className="h-4 w-4" /></Button>
            </Link>
          ) : (
            <Button variant="outline" size="sm" disabled>Trước <ChevronRight className="h-4 w-4" /></Button>
          )}
        </div>
      </div>

      {/* Chapter content */}
<div className="container mx-auto px-4 py-8 prose max-w-3xl">
  <h1 className="text-2xl font-bold mb-4">{chapter.title}</h1>
  <p className="text-sm text-muted-foreground mb-6">{wordCount} words</p>
  
  <div className="space-y-4">
    {(chapter.content ?? "")
      .split("\n") // tách theo dòng
      .map((line, idx) =>
        line.trim() ? (
          <p key={idx}>{line}</p> // nếu có chữ thì render thành đoạn <p>
        ) : (
          <br key={idx} /> // nếu dòng trống thì giữ <br />
        )
      )}
  </div>
</div>


     {/* Footer nav (Prev/Next) */}
      <div className="container mx-auto px-4 py-8 flex items-center justify-between">
        {previousChapter ? (
          <Link to={`/story/${slug}/${previousChapter.slug || previousChapter.id}`}>
            <Button variant="outline" size="sm"><ChevronLeft className="h-4 w-4" /> Trước</Button>
          </Link>
        ) : (
          <Button variant="outline" size="sm" disabled><ChevronLeft className="h-4 w-4" /> Trước</Button>
        )}
      
        {nextChapter ? (
          <Link to={`/story/${slug}/${nextChapter.slug || nextChapter.id}`}>
            <Button variant="outline" size="sm">Sau <ChevronRight className="h-4 w-4" /></Button>
          </Link>
        ) : (
          <Button variant="outline" size="sm" disabled>Sau <ChevronRight className="h-4 w-4" /></Button>
        )}
      </div>
    </div>
  );
}
