import React, { useEffect, useMemo, useState } from "react";
import { useParams, Link } from "react-router-dom";
import {
  Star,
  Eye,
  Clock,
  User,
  BookOpen,
  Play,
  CheckCircle,
} from "lucide-react";
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

// convert genres -> array
function toArrayGenres(genres: StoryWithChapters["genres"]): string[] {
  if (Array.isArray(genres)) return genres;
  if (typeof genres === "string") {
    return genres
      .replace(/[{}"]/g, "")
      .split(",")
      .map((s) => s.trim())
      .filter(Boolean);
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

  const bookmark = useMemo(
    () => (slug ? getBookmark(slug) : null),
    [slug, getBookmark]
  );

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
          <h1 className="text-2xl font-bold mb-4">Story Not Found</h1>
          <p className="text-muted-foreground mb-6">
            The story you're looking for doesn't exist.
          </p>
          <Link to="/">
            <Button>Back to Home</Button>
          </Link>
        </div>
      </div>
    );
  }

  const genres = toArrayGenres(story.genres);
  const chapters = story.chapters ?? [];

  const formatViews = (v: number | null) =>
    !v
      ? "0"
      : v >= 1_000_000
      ? `${(v / 1_000_000).toFixed(1)}M`
      : v >= 1000
      ? `${(v / 1000).toFixed(0)}K`
      : String(v);

  const formatDate = (d?: string | null) =>
    d
      ? new Date(d).toLocaleDateString("en-US", {
          year: "numeric",
          month: "long",
          day: "numeric",
        })
      : "-";

  const lastUpdated =
    story.lastupdated || chapters.at(-1)?.created_at || story.created_at;

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8 mb-8">
          {/* MAIN */}
          <div className="lg:col-span-3">
            {/* Cover + Info */}
            <div className="flex flex-col md:flex-row gap-6">
              <div className="flex-shrink-0">
                <img
                  src={
                    story.coverImage ||
                    "https://placehold.co/300x400?text=No+Image"
                  }
                  alt={story.title}
                  className="w-full md:w-64 h-80 object-cover rounded-lg shadow-lg"
                />
              </div>

              <div className="flex-1 space-y-4">
                <h1 className="text-3xl md:text-4xl font-bold mb-2">
                  {story.title}
                </h1>
                <div className="flex items-center space-x-2 text-muted-foreground mb-4">
                  <User className="h-4 w-4" />
                  <span>by {story.author ?? "Unknown"}</span>
                </div>

                <div className="flex flex-wrap gap-2">
                  {genres.map((g) => (
                    <Badge key={g} variant="secondary">
                      {g}
                    </Badge>
                  ))}
                </div>

                {/* Stats */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <div className="flex items-center space-x-2">
                    <Star className="h-4 w-4 text-yellow-500 fill-current" />
                    <span className="font-semibold">{story.rating ?? 0}</span>
                    <span className="text-sm text-muted-foreground">
                      Rating
                    </span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Eye className="h-4 w-4" />
                    <span className="font-semibold">
                      {formatViews(story.views)}
                    </span>
                    <span className="text-sm text-muted-foreground">Views</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <BookOpen className="h-4 w-4" />
                    <span className="font-semibold">{chapters.length}</span>
                    <span className="text-sm text-muted-foreground">
                      Chapters
                    </span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Clock className="h-4 w-4" />
                    <span className="font-semibold">
                      {formatDate(lastUpdated)}
                    </span>
                  </div>
                </div>

                {/* Status */}
                <div className="flex items-center space-x-2">
                  <Badge
                    variant={
                      story.status === "Completed" ? "default" : "secondary"
                    }
                    className="flex items-center space-x-1"
                  >
                    {story.status === "Completed" && (
                      <CheckCircle className="h-3 w-3" />
                    )}
                    <span>{story.status ?? "Ongoing"}</span>
                  </Badge>
                </div>

                {/* Actions */}
                <div className="flex flex-wrap gap-3 pt-4">
                  {chapters.length > 0 && (
                    <>
                      {/* Đọc từ chương đầu */}
                      <Link
                        to={`/story/${story.slug}/${
                          chapters[0].slug || chapters[0].id
                        }`}
                      >
                        <Button size="lg" className="flex items-center space-x-2">
                          <Play className="h-4 w-4" />
                          <span>Đọc từ đầu</span>
                        </Button>
                      </Link>

                      {/* Đọc chương mới nhất */}
                      <Link
                        to={`/story/${story.slug}/${
                          chapters[chapters.length - 1].slug ||
                          chapters[chapters.length - 1].id
                        }`}
                      >
                        <Button
                          variant="outline"
                          size="lg"
                          className="flex items-center space-x-2"
                        >
                          <BookOpen className="h-4 w-4" />
                          <span>Read Newest</span>
                        </Button>
                      </Link>

                      {/* Tiếp tục đọc (bookmark) */}
                      {bookmark && (
                        <Link to={`/story/${story.slug}/${bookmark.chapterSlug}`}>
                          <Button
                            variant="outline"
                            size="lg"
                            className="flex items-center space-x-2"
                          >
                            <BookOpen className="h-4 w-4" />
                            <span>Tiếp tục đọc</span>
                          </Button>
                        </Link>
                      )}
                    </>
                  )}
                </div>
              </div>
            </div>

            {/* Synopsis */}
            <Card className="mt-8">
              <CardHeader>
                <CardTitle>Văn án</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {(story.description ?? "No description")
                    .split("\n")
                    .map((line, idx) =>
                      line.trim() ? (
                        <p key={idx}>{line}</p>
                      ) : (
                        <br key={idx} />
                      )
                    )}
                </div>
              </CardContent>
            </Card>


            {/* Chapter List */}
            {chapters.length > 0 && (
              <Card className="mt-8">
                <CardHeader>
                  <CardTitle className="flex justify-between">
                    <span>Chapters ({chapters.length})</span>
                    <span className="text-sm text-muted-foreground">
                      Latest:{" "}
                      {chapters.at(-1)?.created_at
                        ? new Date(
                            chapters.at(-1)!.created_at!
                          ).toLocaleDateString()
                        : "-"}
                    </span>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2 max-h-96 overflow-y-auto">
                    {chapters.map((chapter, index) => (
                      <div key={chapter.id}>
                        <Link
                          to={`/story/${story.slug}/${
                            chapter.slug || chapter.id
                          }`}
                          className="flex items-center justify-between p-3 hover:bg-muted rounded-lg"
                        >
                          <div className="flex items-center space-x-3">
                            <span className="w-8 h-8 bg-primary/10 text-primary rounded-full flex items-center justify-center text-sm font-medium">
                              {index + 1}
                            </span>
                          <div>
                            <h4 className="font-medium">{chapter.title}</h4>
                            <p className="text-sm text-muted-foreground">
                              {(chapter.views ?? 0).toLocaleString()} views
                            </p>
                          </div>

                          </div>
                          <div className="text-sm text-muted-foreground">
                            {chapter.created_at
                              ? new Date(
                                  chapter.created_at
                                ).toLocaleDateString()
                              : "-"}
                          </div>
                        </Link>
                        {index < chapters.length - 1 && <Separator />}
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}
          </div>

          {/* SIDEBAR */}
          <div className="space-y-6">
            {recommended.length > 0 && (
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">You May Also Like</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  {recommended.map((s) => (
                    <StoryCard
                      key={s.id}
                      story={{
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
                        chapters: [],
                      }}
                      variant="compact"
                    />
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
