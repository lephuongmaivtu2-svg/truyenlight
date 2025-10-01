import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { supabase } from "../supabaseClient";
import { Button } from "../components/ui/button";

// ---------------- API call ----------------
async function getBookmarks(userId: string) {
  const { data, error } = await supabase
    .from("bookmarks")
    .select(`
      id,
      chapter_id,
      story_id,
      story:story_id (
        id,
        slug,
        title,
        author,
        description,
        coverimage,
        rating,
        views,
        status,
        genres,
        lastupdated
      )
    `)
    .eq("user_id", userId);

  if (error) {
    console.error("Error getBookmarks:", error);
    return [];
  }

  return data;
}


async function getReadingProgress(userId: string) {
  const { data, error } = await supabase
    .from("reading_progress")
    .select(`
      id,
      chapter_id,
      story_id,
      scroll_position,
      updated_at,
      story:story_id (
        id,
        slug,
        title,
        author,
        coverimage
      )
    `)
    .eq("user_id", userId)
    .order("updated_at", { ascending: false });

  if (error) {
    console.error("Error getProgress:", error);
    return [];
  }

  return data;
}


// ---------------- Component ----------------
export function ProfilePage() {
  const [userId, setUserId] = useState<string | null>(null);
  const [progress, setProgress] = useState<any[]>([]);
  const [bookmarks, setBookmarks] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  // Lấy user hiện tại
  useEffect(() => {
    async function loadUser() {
      const { data } = await supabase.auth.getUser();
      if (data.user) {
        setUserId(data.user.id);
      }
    }
    loadUser();
  }, []);

  // Lấy progress + bookmark
  useEffect(() => {
    async function loadData() {
      if (!userId) return;
      setLoading(true);

      const [p, b] = await Promise.all([
        getReadingProgress(userId),
        getBookmarks(userId),
      ]);

      setProgress(p);
      setBookmarks(b);
      setLoading(false);
    }
    loadData();
  }, [userId]);

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-8">
        Đang tải nè, đợi xíu nha…
      </div>
    );
  }

  if (!userId) {
    return (
      <div className="container mx-auto px-4 py-8 text-center">
        <p className="mb-4">Bạn cần đăng nhập để xem trang cá nhân.</p>
        <Link to="/login">
          <Button>Đăng nhập</Button>
        </Link>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-6">Trang cá nhân</h1>

      {/* Reading progress */}
      <div className="mb-8">
        <h2 className="text-xl font-semibold mb-4">Đang đọc</h2>
        {progress.length === 0 ? (
          <p className="text-muted-foreground">Chưa có truyện nào.</p>
        ) : (
          <ul className="space-y-4">
            {progress.map((p) => (
              <li key={p.id}>
                <Link to={`/story/${p.stories.slug}/${p.chapter_id}`}>
                  <div className="flex items-center gap-4 p-3 border rounded-lg hover:bg-muted">
                    <img
                      src={p.stories.coverimage || "https://placehold.co/100x140"}
                      alt={p.stories.title}
                      className="w-16 h-20 object-cover rounded"
                    />
                    <div className="flex-1">
                      <h3 className="font-semibold">{p.stories.title}</h3>
                      <p className="text-sm text-muted-foreground">
                        Chương gần nhất: {p.chapter_id}
                      </p>
                    </div>
                    <Button size="sm">Tiếp tục đọc</Button>
                  </div>
                </Link>
              </li>
            ))}
          </ul>
        )}
      </div>

      {/* Bookmarks */}
      <div>
        <h2 className="text-xl font-semibold mb-4">Đánh dấu</h2>
        {bookmarks.length === 0 ? (
          <p className="text-muted-foreground">Chưa có truyện nào được đánh dấu.</p>
        ) : (
          <ul className="space-y-4">
            {bookmarks.map((b) => (
              <li key={b.id}>
                <Link to={`/story/${b.stories.slug}`}>
                  <div className="flex items-center gap-4 p-3 border rounded-lg hover:bg-muted">
                    <img
                      src={b.stories.coverimage || "https://placehold.co/100x140"}
                      alt={b.stories.title}
                      className="w-16 h-20 object-cover rounded"
                    />
                    <div className="flex-1">
                      <h3 className="font-semibold">{b.stories.title}</h3>
                      <p className="text-sm text-muted-foreground">
                        {b.stories.author ?? "Unknown"}
                      </p>
                    </div>
                    <Button size="sm">Đọc</Button>
                  </div>
                </Link>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}
