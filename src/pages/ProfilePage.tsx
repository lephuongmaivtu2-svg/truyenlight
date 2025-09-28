import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { supabase } from "../supabaseClient";
import { getReadingProgress, getBookmarks, ReadingProgress, Bookmark } from "../lib/api";
import { Button } from "../components/ui/button";

export function ProfilePage() {
  const [userId, setUserId] = useState<string | null>(null);
  const [progress, setProgress] = useState<ReadingProgress[]>([]);
  const [bookmarks, setBookmarks] = useState<Bookmark[]>([]);
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
        getBookmarks(userId)
      ]);

      setProgress(p);
      setBookmarks(b);
      setLoading(false);
    }
    loadData();
  }, [userId]);

  if (loading) {
    return <div className="container mx-auto px-4 py-8">Đang tải nè, đợi xíu nha…</div>;
  }

  if (!userId) {
    return (
      <div className="container mx-auto px-4 py-8 text-center">
        <p className="mb-4">Bạn cần đăng nhập để xem trang cá nhân.</p>
        <Link to="/login"><Button>Đăng nhập</Button></Link>
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
          <ul className="space-y-2">
            {progress.map((p) => (
              <li key={p.id} className="flex justify-between items-center p-3 border rounded-lg">
                <span>
                  Story ID: {p.story_id} – Chapter ID: {p.chapter_id}
                </span>
                <Link to={`/story/${p.story_id}/${p.chapter_id}`}>
                  <Button size="sm">Continue</Button>
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
          <ul className="space-y-2">
            {bookmarks.map((b) => (
              <li key={b.id} className="flex justify-between items-center p-3 border rounded-lg">
                <span>
                  Story ID: {b.story_id} – Chapter ID: {b.chapter_id}
                </span>
                <Link to={`/story/${b.story_id}/${b.chapter_id}`}>
                  <Button size="sm">Đọc</Button>
                </Link>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}
