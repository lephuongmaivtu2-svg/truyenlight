import React, { useEffect, useState } from "react";
import { Search, TrendingUp, Clock, Star, CheckCircle } from "lucide-react";
import { Input } from "./ui/input";
import { Button } from "./ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "./ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "./ui/tabs";
import { StoryCard } from "./StoryCard";
import { supabase } from "../supabaseClient";
import { getTopStoriesByViews,  } from "../supabaseClient";

export function Homepage() {
  const [searchQuery, setSearchQuery] = useState("");
  const [stories, setStories] = useState<any[]>([]);
  const [searchResults, setSearchResults] = useState<any[]>([]);
  const [showSearchResults, setShowSearchResults] = useState(false);
  const [featuredStories, setFeaturedStories] = useState<any[]>([]);
  const [topStories, setTopStories] = useState<any[]>([]);

  
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
      console.log("Fetched stories:", data);
      // Map lại field cho khớp UI (StoryCard.tsx dùng camelCase)
      const mapped = (data || []).map((story) => ({
        ...story,
        coverImage: story.coverimage,   // DB trả về "coverimage"
        lastUpdated: story.created_at,  // dùng cho Clock
      }));
      setStories(mapped);
    }
  };
 const fetchTop = async () => {
    const stories = await getTopStoriesByViews();
    setTopStories(stories);
  };
  fetchTop();
   
  const fetchFeatured = async () => {
    const { data, error } = await supabase
      .from("stories")
      .select("*")
      .eq("is_featured", true)
      .limit(8);

    if (error) {
      console.error("Supabase fetch featured error:", error);
    } else {
      setFeaturedStories(data || []);
    }
  };

  // gọi cả 2 hàm
  fetchStories();
  fetchFeatured();
}, []);

// trong Homepage.tsx
const getTopStoriesByViews = async () => {
  const { data, error } = await supabase
    .from("stories")
    .select("*")
    .order("views", { ascending: false })
    .limit(10);

  if (error) {
    console.error("Supabase fetch top stories error:", error);
    return [];
  }
  return data || [];
};
  
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
      <section className="bg-gradient-to-r from-primary/10 to-primary/5 py-16">
        <div className="container mx-auto px-4 text-center">
          <h1 className="text-4xl md:text-6xl font-bold text-foreground mb-4">
            Truyện Light - Light Novel
          </h1>
          <p className="text-xl text-muted-foreground mb-8 max-w-2xl mx-auto">
            Đăng nhập để lưu trữ những bộ truyện đang còn đọc dang dở.
          </p>
          
          {/* Search Bar */}
          <form onSubmit={handleSearch} className="max-w-2xl mx-auto relative">
            <div className="relative">
              <Input
                type="text"
                placeholder="VD: Phong bì trả nợ..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full h-12 pl-12 pr-32 text-lg"
              />
              <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 h-5 w-5 text-muted-foreground" />
              <Button 
                type="submit" 
                className="absolute right-2 top-1/2 transform -translate-y-1/2 h-8"
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
     {/* Featured Stories */}
                <section>
                  <div className="flex items-center space-x-2 mb-6">
                    <Star className="h-6 w-6 text-primary" />
                    <h2 className="text-2xl font-bold text-foreground">Featured Stories</h2>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {featuredStories.map((story) => (
                      <StoryCard key={story.id} story={story} variant="featured" />
                    ))}
                  </div>
                </section>
    
    
          {/* Rankings */}
            <section>
              <div className="flex items-center space-x-2 mb-6">
                <TrendingUp className="h-6 w-6 text-primary" />
                <h2 className="text-2xl font-bold text-foreground">Top Stories</h2>
              </div>
              
              <Tabs defaultValue="views" className="w-full">
                <TabsList className="grid w-full grid-cols-3">
                  <TabsTrigger value="views">By Views</TabsTrigger>
                  <TabsTrigger value="rating">By Rating</TabsTrigger>
                  <TabsTrigger value="recent">Recent</TabsTrigger>
                </TabsList>
                
                <TabsContent value="views" className="mt-6">
                  <div className="grid grid-cols-1 gap-4">
                    {topStories.slice(0, 5).map((story, index) => (
                      <div key={story.id} className="flex items-center space-x-4">
                        <div className="flex-shrink-0 w-8 h-8 bg-primary text-primary-foreground rounded-full flex items-center justify-center font-bold">
                          {index + 1}
                        </div>
                        <div className="flex-1">
                          <StoryCard story={story} variant="compact" />
                        </div>
                      </div>
                    ))}
                  </div>
                </TabsContent>
                
                <TabsContent value="rating" className="mt-6">
                  <div className="grid grid-cols-1 gap-4">
                    {[...topStories].sort((a, b) => b.rating - a.rating).slice(0, 5).map((story, index) => (
                      <div key={story.id} className="flex items-center space-x-4">
                        <div className="flex-shrink-0 w-8 h-8 bg-primary text-primary-foreground rounded-full flex items-center justify-center font-bold">
                          {index + 1}
                        </div>
                        <div className="flex-1">
                          <StoryCard story={story} variant="compact" />
                        </div>
                      </div>
                    ))}
                  </div>
                </TabsContent>
                
                <TabsContent value="recent" className="mt-6">
                  <div className="grid grid-cols-1 gap-4">
                    {latestUpdates.slice(0, 5).map((story, index) => (
                      <div key={story.id} className="flex items-center space-x-4">
                        <div className="flex-shrink-0 w-8 h-8 bg-primary text-primary-foreground rounded-full flex items-center justify-center font-bold">
                          {index + 1}
                        </div>
                        <div className="flex-1">
                          <StoryCard story={story} variant="compact" />
                        </div>
                      </div>
                    ))}
                  </div>
                </TabsContent>
              </Tabs>
            </section>
    

      
      {/*Featured & Latest*/}
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
