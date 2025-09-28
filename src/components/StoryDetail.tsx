import React, { useEffect, useMemo, useState } from "react";
import { useParams, Link } from "react-router-dom";
import { Star, Eye, Clock, User, BookOpen, Play, List, CheckCircle } from "lucide-react";
import { Button } from "./ui/button";
import { Badge } from "./ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "./ui/card";
import { Separator } from "./ui/separator";
import { StoryCard } from "./StoryCard";
import { useReading } from "./ReadingProvider";
import {
  fetchStoryWithChapters,
  fetchTopStories,
  StoryWithChapters,
  StoryRow,
} from "../lib/api";

function toArrayGenres(genres: StoryWithChapters["genres"]): string[] {
  if (Array.isArray(genres)) return genres;
  if (typeof genres === "string") {
    // fallback khi DB trả string kiểu {Fantasy,Romance}
    return genres.replace(/[{}"]/g, "").split(",").map(s => s.trim()).filter(Boolean);
  }
  return [];
}

export function StoryDetail() {
  const { slug } = useParams<{ slug: string }>();
  const { getBookmark } = useReading();

  const [story, setStory] = useState<StoryWithChapters | null>(null);
  const [recommended, setRecommended] = useState<StoryRow[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let alive = true;
    async function run() {
      if (!slug) return;
      setLoading(true);
      const s = await fetchStoryWithChapters(slug);
      if (alive) setStory(s);
      if (s) {
        const rec = await fetchTopStories(4, s.id);
        if (alive) setRecommended(rec);
      }
      setLoading(false);
    }
    run();
    return () => {
      alive = false;
    };
  }, [slug]);

  const bookmark = useMemo(() => (slug ? getBookmark(slug) : null), [slug, getBookmark]);

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <p className="text-muted-foreground">Loading story…</p>
      </div>
    );
  }

  if (!story) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-foreground mb-4">Story Not Found</h1>
          <p className="text-muted-foreground mb-6">The story you're looking for doesn't exist.</p>
          <Link to="/"><Button>Back to Home</Button></Link>
        </div>
      </div>
    );
  }

  const genres = toArrayGenres(story.genres);
  const formatViews = (v: number | null) => !v ? "0" : v >= 1_000_000 ? `${(v/1_000_000).toFixed(1)}M` : v >= 1000 ? `${(v/1000).toFixed(0)}K` : String(v);
  const formatDate = (d?: string | null) => d ? new Date(d).toLocaleDateString("en-US", { year: "numeric", month: "long", day: "numeric" }) : "-";
  const lastUpdated = story.lastupdated || story.chapters.at(-1)?.created_at || story.created_at || null;

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8 mb-8">
          {/* MAIN */}
          <div className="lg:col-span-3">
            <div className="flex flex-col md:flex-row gap-6">
              {/* Cover */}
              <div className="flex-shrink-0">
                <img
                  src={story.coverimage || "https://placehold.co/300x400?text=No+Image"}
                  alt={story.title}
                  className="w-full md:w-64 h-80 object-cover rounded-lg shadow-lg"
                />
              </div>

              {/* Info */}
              <div className="flex-1 space-y-4">
                <div>
                  <h1 className="text-3xl md:text-4xl font-bold text-foreground mb-2">
                    {story.title}
                  </h1>
                  <div className="flex items-center space-x-2 text-muted-foreground mb-4">
                    <User className="h-4 w-4" />
                    <span>by {story.author ?? "Unknown"}</span>
                  </div>
                </div>

                {/* Genres */}
                <div className="flex flex-wrap gap-2">
                  {genres.map((g) => (
                    <Badge key={g} variant="secondary">{g}</Badge>
                  ))}
                </div>

                {/* Stats */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <div className="flex items-center space-x-2">
                    <Star className="h-4 w-4 text-yellow-500 fill-current" />
                    <span className="font-semibold">{story.rating ?? 0}</span>
                    <span className="text-muted-foreground text-sm">Rating</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Eye className="h-4 w-4 text-muted-foreground" />
                    <span className="font-semibold">{formatViews(story.views)}</span>
                    <span className="text-muted-foreground text-sm">Views</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <BookOpen className="h-4 w-4 text-muted-foreground" />
                    <span className="font-semibold">{story.chapters.length}</span>
                    <span className="text-muted-foreground text-sm">Chapters</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Clock className="h-4 w-4 text-muted-foreground" />
                    <span className="font-semibold">{formatDate(lastUpdated)}</span>
                  </div>
                </div>

                {/* Status */}
                <div className="flex items-center space-x-2">
                  <Badge
                    variant={story.status === "Completed" ? "default" : "secondary"}
                    className="flex items-center space-x-1"
                  >
                    {story.status === "Completed" && <CheckCircle className="h-3 w-3" />}
                    <span>{story.status ?? "Ongoing"}</span>
                  </Badge>
                </div>

                {/* Actions */}
                <div className="flex flex-wrap gap-3 pt-4">
                  {story.chapters.length > 0 && (
                    <>
                     <Link to={`/story/${story.slug}/${chapter.slug || chapter.id}`}>
                        <Button size="lg" className="flex items-center space-x-2">
                          <Play className="h-4 w-4" />
                          <span>Read from Beginning</span>
                        </Button>
                      </Link>

                      {bookmark && (
                        <Link to={`/story/${story.slug}/${bookmark.chapterSlug}`}>
                          <Button variant="outline" size="lg" className="flex items-center space-x-2">
                            <BookOpen className="h-4 w-4" />
                            <span>Continue Reading</span>
                          </Button>
                        </Link>
                      )}

                      <Button variant="outline" size="lg" className="flex items-center space-x-2">
                        <List className="h-4 w-4" />
                        <span>Chapter List</span>
                      </Button>
                    </>
                  )}
                </div>
              </div>
            </div>

            {/* Description */}
            <Card className="mt-8">
              <CardHeader><CardTitle>Synopsis</CardTitle></CardHeader>
              <CardContent>
                <p className="text-foreground leading-relaxed whitespace-pre-line">
                  {story.description ?? "No description"}
                </p>
              </CardContent>
            </Card>

            {/* Chapter list */}
            {story.chapters.length > 0 && (
              <Card className="mt-8">
                <CardHeader>
                  <CardTitle className="flex items-center justify-between">
                    <span>Chapters ({story.chapters.length})</span>
                    <span className="text-sm text-muted-foreground">
                      Latest: {story.chapters.at(-1)?.created_at ? new Date(story.chapters.at(-1)!.created_at!).toLocaleDateString() : "-"}
                    </span>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2 max-h-96 overflow-y-auto">
                    {story.chapters.map((chapter, index) => {
                      const wordCount = (chapter.content ?? "").split(/\s+/).filter(Boolean).length;
                      return (
                        <div key={chapter.id}>
                          <Link
                              to={`/story/${story.slug}/${chapter.slug ? `${chapter.slug}-${chapter.id}` : chapter.id}`}
                              className="flex items-center justify-between p-3 hover:bg-muted rounded-lg transition-colors"
                            >
                            <div className="flex items-center space-x-3">
                              <span className="flex-shrink-0 w-8 h-8 bg-primary/10 text-primary rounded-full flex items-center justify-center text-sm font-medium">
                                {index + 1}
                              </span>
                              <div>
                                <h4 className="font-medium text-foreground">{chapter.title}</h4>
                                <p className="text-sm text-muted-foreground">
                                  {wordCount.toLocaleString()} words
                                </p>
                              </div>
                            </div>
                            <div className="text-sm text-muted-foreground">
                              {chapter.created_at ? new Date(chapter.created_at).toLocaleDateString() : "-"}
                            </div>
                          </Link>
                          {index < story.chapters.length - 1 && <Separator />}
                        </div>
                      );
                    })}
                  </div>
                </CardContent>
              </Card>
            )}
          </div>

          {/* SIDEBAR */}
          <div className="space-y-6">
            {/* Statistics */}
            <Card>
              <CardHeader><CardTitle className="text-lg">Statistics</CardTitle></CardHeader>
              <CardContent className="space-y-3">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Total Views</span>
                  <span className="font-semibold">{(story.views ?? 0).toLocaleString()}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Rating</span>
                  <span className="font-semibold">{story.rating ?? 0}/5.0</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Chapters</span>
                  <span className="font-semibold">{story.chapters.length}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Status</span>
                  <span className="font-semibold">{story.status ?? "Ongoing"}</span>
                </div>
              </CardContent>
            </Card>

            {/* Recommended */}
            {recommended.length > 0 && (
              <Card>
                <CardHeader><CardTitle className="text-lg">You May Also Like</CardTitle></CardHeader>
                <CardContent className="space-y-4">
                  {recommended.map((s) => (
                    // @ts-ignore: StoryCard expects mock Story but chỉ cần title/author/coverimage/slug oke
                    <StoryCard key={s.id} story={{
                      id: s.id,
                      title: s.title,
                      author: s.author ?? "",
                      description: s.description ?? "",
                      coverImage: s.coverimage ?? "",
                      slug: s.slug,
                      rating: s.rating ?? 0,
                      views: s.views ?? 0,
                      status: s.status ?? "Ongoing",
                      genres: toArrayGenres(s.genres),
                      lastUpdated: s.lastupdated ?? new Date().toISOString(),
                      chapters: []
                    }} variant="compact" />
                  ))}
                </CardContent>
              </Card>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
