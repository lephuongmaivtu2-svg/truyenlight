import React, { useEffect, useState } from "react";
import { Search, TrendingUp, Clock, Star, CheckCircle } from "lucide-react";
import { Input } from "./ui/input";
import { Button } from "./ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "./ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "./ui/tabs";
import { StoryCard } from "./StoryCard";
import { supabase } from "../supabaseClient";

export function Homepage() {
  const [searchQuery, setSearchQuery] = useState("");
  const [stories, setStories] = useState<any[]>([]);
  const [searchResults, setSearchResults] = useState<any[]>([]);
  const [showSearchResults, setShowSearchResults] = useState(false);

  // Fetch tất cả stories
  useEffect(() => {
  const fetchStories = async () => {
    const { data, error } = await supabase
      .from("stories")
      .select("*")
      .order("created_at", { ascending: false });

    if (error) {
      console.error("Supabase fetch error:", error);
    } else {
      console.log("Fetched stories:", data); // 👉 Log ra để xem data có về không

      // Map lại field cho khớp UI (StoryCard.tsx dùng camelCase)
      const mapped = (data || []).map((story) => ({
        ...story,
        coverImage: story.coverimage,   // DB trả về "coverimage"
        lastUpdated: story.created_at,  // dùng cho Clock
      }));

      setStories(mapped);
    }
  };
  fetchStories();
}, []);


  // Handle search
  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      const results = stories.filter((story) =>
        story.title.toLowerCase().includes(searchQuery.toLowerCase())
      );
      setSearchResults(results);
      setShowSearchResults(true);
    }
  };

  return (
    <div className="min-h-screen bg-background">
    
      {/* Hero Section with Search */}
          <section className="relative bg-gradient-to-r from-indigo-700 via-purple-700 to-pink-700 py-24">
        <div className="absolute inset-0 bg-black/40" /> {/* Overlay tối */}
        <div className="container relative mx-auto px-4 text-center text-white">
          <h1 className="text-3xl md:text-5xl font-extrabold tracking-tight mb-4">
            Thư viện Light Novel Online
          </h1>
          <p className="text-lg md:text-xl text-gray-200 mb-8 max-w-2xl mx-auto">
            Đọc truyện miễn phí, cập nhật sớm nhất và dễ dàng theo dõi bộ yêu thích.
          </p>
      
          <form onSubmit={handleSearch} className="max-w-2xl mx-auto relative">
            <div className="relative rounded-full shadow-lg overflow-hidden">
              <Input
                type="text"
                placeholder="Tìm kiếm truyện..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full h-14 pl-14 pr-36 text-lg border-none focus:ring-0"
              />
              <Search className="absolute left-5 top-1/2 transform -translate-y-1/2 h-6 w-6 text-gray-400" />
              <Button
                type="submit"
                className="absolute right-2 top-1/2 transform -translate-y-1/2 h-10 px-6 rounded-full"
              >
                Tìm
              </Button>
            </div>
          </form>
        </div>
      </section>


      
      {/* Search Results */}
      {showSearchResults && (
        <section className="py-8 bg-muted/30">
          <div className="container mx-auto px-4">
            <h2 className="text-2xl font-bold mb-6">
              Search Results for "{searchQuery}"
            </h2>
            {searchResults.length > 0 ? (
              <div className="grid grid-cols-1 gap-4">
                {searchResults.map((story) => (
                  <StoryCard key={story.id} story={story} />
                ))}
              </div>
            ) : (
              <p className="text-center text-muted-foreground">
                No stories found.
              </p>
            )}
          </div>
        </section>
      )}

      {/* Featured & Latest */}
      <div className="container mx-auto px-4 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          <div className="lg:col-span-3 space-y-8">
            {/* Latest Updates */}
            <section>
              <div className="flex items-center space-x-2 mb-6">
                <Clock className="h-6 w-6 text-primary" />
                <h2 className="text-2xl font-bold">Truyện nóng hổi vừa thổi vừa ăn</h2>
              </div>
              <div className="grid grid-cols-1 gap-4">
                {stories.slice(0, 5).map((story) => (
                  <StoryCard key={story.id} story={story} />
                ))}
              </div>
            </section>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Toàn bộ truyện</CardTitle>
              </CardHeader>
              <CardContent>
                {stories.slice(0, 5).map((story) => (
                  <StoryCard key={story.id} story={story} variant="compact" />
                ))}
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}
