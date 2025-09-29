import React, { useEffect, useState } from "react";
import { Search, Clock } from "lucide-react";
import { Input } from "./ui/input";
import { Button } from "./ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "./ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "./ui/tabs";
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

      if (!error) {
        const mapped = (data || []).map((story) => ({
          ...story,
          coverImage: story.coverimage,
          lastUpdated: story.created_at,
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
      {/* Thanh tìm kiếm */}
      <div className="bg-muted/20 py-6">
        <div className="container mx-auto px-4">
          <form onSubmit={handleSearch} className="max-w-2xl mx-auto relative">
            <div className="relative">
              <Input
                type="text"
                placeholder="VD: Phong bì trả nợ..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full h-10 pl-10 pr-24 text-base"
              />
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Button
                type="submit"
                className="absolute right-2 top-1/2 transform -translate-y-1/2 h-9 px-5"
              >
                Tìm
              </Button>
            </div>
          </form>
        </div>
      </div>

      {/* Search Results */}
      {showSearchResults && (
        <section className="py-8 bg-muted/30">
          <div className="container mx-auto px-4">
            <h2 className="text-2xl font-bold mb-6">
              Search Results for "{searchQuery}"
            </h2>
            {searchResults.length > 0 ? (
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                {searchResults.map((story) => (
                  <div
                    key={story.id}
                    className="border rounded-lg overflow-hidden bg-white shadow hover:shadow-md transition"
                  >
                    <img
                      src={story.coverImage || "/placeholder.jpg"}
                      alt={story.title}
                      className="w-full h-40 object-cover"
                    />
                    <div className="p-2">
                      <h3 className="text-sm font-semibold truncate">{story.title}</h3>
                      <p className="text-xs text-gray-500">Mới cập nhật</p>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-center text-muted-foreground">Không tìm thấy truyện.</p>
            )}
          </div>
        </section>
      )}

      {/* Grid + Sidebar */}
      <div className="container mx-auto px-4 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          {/* Grid 4 cột truyện */}
          <div className="lg:col-span-3">
            <div className="flex items-center space-x-2 mb-6">
              <Clock className="h-6 w-6 text-primary" />
              <h2 className="text-2xl font-bold">Truyện mới cập nhật</h2>
            </div>
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
              {stories.slice(0, 20).map((story) => (
                <div
                  key={story.id}
                  className="border rounded-lg overflow-hidden bg-white shadow hover:shadow-md transition"
                >
                  <img
                    src={story.coverImage || "/placeholder.jpg"}
                    alt={story.title}
                    className="w-full h-40 object-cover"
                  />
                  <div className="p-2">
                    <h3 className="text-sm font-semibold truncate">{story.title}</h3>
                    <p className="text-xs text-gray-500">
                      {story.lastUpdated
                        ? new Date(story.lastUpdated).toLocaleDateString()
                        : "Mới cập nhật"}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Bảng xếp hạng */}
            <Card>
              <CardHeader>
                <CardTitle>Bảng xếp hạng</CardTitle>
              </CardHeader>
              <CardContent>
                <Tabs defaultValue="day" className="w-full">
                  <TabsList className="grid grid-cols-4 mb-3">
                    <TabsTrigger value="day">Ngày</TabsTrigger>
                    <TabsTrigger value="week">Tuần</TabsTrigger>
                    <TabsTrigger value="month">Tháng</TabsTrigger>
                    <TabsTrigger value="year">Năm</TabsTrigger>
                  </TabsList>
                  <TabsContent value="day">
                    <ul className="space-y-2 text-sm">
                      <li>1. Truyện hot A</li>
                      <li>2. Truyện hot B</li>
                      <li>3. Truyện hot C</li>
                    </ul>
                  </TabsContent>
                  <TabsContent value="week">
                    <ul className="space-y-2 text-sm">
                      <li>1. Truyện tuần A</li>
                      <li>2. Truyện tuần B</li>
                      <li>3. Truyện tuần C</li>
                    </ul>
                  </TabsContent>
                  <TabsContent value="month">
                    <ul className="space-y-2 text-sm">
                      <li>1. Truyện tháng A</li>
                      <li>2. Truyện tháng B</li>
                      <li>3. Truyện tháng C</li>
                    </ul>
                  </TabsContent>
                  <TabsContent value="year">
                    <ul className="space-y-2 text-sm">
                      <li>1. Truyện năm A</li>
                      <li>2. Truyện năm B</li>
                      <li>3. Truyện năm C</li>
                    </ul>
                  </TabsContent>
                </Tabs>
              </CardContent>
            </Card>

            {/* Fanpage Facebook */}
            <Card>
              <CardHeader>
                <CardTitle>Theo dõi fanpage</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="overflow-hidden rounded-lg">
                  <iframe
                    title="Facebook Page"
                    src="https://www.facebook.com/plugins/page.php?href=https%3A%2F%2Fwww.facebook.com%2Fyourpage&tabs&width=300&height=200&small_header=false&adapt_container_width=true&hide_cover=false&show_facepile=true"
                    width="100%"
                    height="200"
                    style={{ border: "none", overflow: "hidden" }}
                    scrolling="no"
                    frameBorder="0"
                    allow="encrypted-media"
                  ></iframe>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}
