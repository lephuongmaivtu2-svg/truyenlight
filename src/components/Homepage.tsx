import React, { useState } from 'react';
import { Search, TrendingUp, Clock, Star, CheckCircle } from 'lucide-react';
import { Input } from './ui/input';
import { Button } from './ui/button';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs';
import { StoryCard } from './StoryCard';
import { 
  getFeaturedStories, 
  getLatestUpdates, 
  getTopStoriesByViews, 
  getCompletedStories,
  searchStories 
} from './mockData';

export function Homepage() {
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<any[]>([]);
  const [showSearchResults, setShowSearchResults] = useState(false);

  const featuredStories = getFeaturedStories();
  const latestUpdates = getLatestUpdates();
  const topStories = getTopStoriesByViews();
  const completedStories = getCompletedStories();

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      const results = searchStories(searchQuery);
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
            Discover Amazing Stories
          </h1>
          <p className="text-xl text-muted-foreground mb-8 max-w-2xl mx-auto">
            Dive into thousands of light novels, web novels, and fantasy stories from talented authors around the world.
          </p>
          
          {/* Search Bar */}
          <form onSubmit={handleSearch} className="max-w-2xl mx-auto relative">
            <div className="relative">
              <Input
                type="text"
                placeholder="Search for stories, authors, or genres..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full h-12 pl-12 pr-32 text-lg"
              />
              <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 h-5 w-5 text-muted-foreground" />
              <Button 
                type="submit" 
                className="absolute right-2 top-1/2 transform -translate-y-1/2 h-8"
              >
                Search
              </Button>
            </div>
          </form>
        </div>
      </section>

      {/* Search Results */}
      {showSearchResults && (
        <section className="py-8 bg-muted/30">
          <div className="container mx-auto px-4">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-bold text-foreground">
                Search Results for "{searchQuery}"
              </h2>
              <Button 
                variant="outline" 
                onClick={() => setShowSearchResults(false)}
              >
                Clear Results
              </Button>
            </div>
            {searchResults.length > 0 ? (
              <div className="grid grid-cols-1 gap-4">
                {searchResults.map((story) => (
                  <StoryCard key={story.id} story={story} />
                ))}
              </div>
            ) : (
              <div className="text-center py-8">
                <p className="text-muted-foreground">No stories found matching your search.</p>
              </div>
            )}
          </div>
        </section>
      )}

      <div className="container mx-auto px-4 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-3 space-y-8">
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

            {/* Latest Updates */}
            <section>
              <div className="flex items-center space-x-2 mb-6">
                <Clock className="h-6 w-6 text-primary" />
                <h2 className="text-2xl font-bold text-foreground">Latest Updates</h2>
              </div>
              <div className="grid grid-cols-1 gap-4">
                {latestUpdates.slice(0, 5).map((story) => (
                  <StoryCard key={story.id} story={story} />
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
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Completed Stories */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <CheckCircle className="h-5 w-5 text-primary" />
                  <span>Completed Stories</span>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {completedStories.slice(0, 4).map((story) => (
                  <StoryCard key={story.id} story={story} variant="compact" />
                ))}
              </CardContent>
            </Card>

            {/* You May Also Like */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Star className="h-5 w-5 text-primary" />
                  <span>You May Also Like</span>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {topStories.slice(0, 4).map((story) => (
                  <StoryCard key={story.id} story={story} variant="compact" />
                ))}
              </CardContent>
            </Card>

            {/* Quick Stats */}
            <Card>
              <CardHeader>
                <CardTitle>Platform Stats</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Total Stories</span>
                  <span className="font-semibold">12,458</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Active Readers</span>
                  <span className="font-semibold">89,234</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Chapters Today</span>
                  <span className="font-semibold">156</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">New This Week</span>
                  <span className="font-semibold">43</span>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}