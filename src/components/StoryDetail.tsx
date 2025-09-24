import React from 'react';
import { useParams, Link } from 'react-router-dom';
import { Star, Eye, Clock, User, BookOpen, Play, List, CheckCircle } from 'lucide-react';
import { Button } from './ui/button';
import { Badge } from './ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Separator } from './ui/separator';
import { StoryCard } from './StoryCard';
import { getStoryBySlug, getTopStoriesByViews } from './mockData';
import { useReading } from './ReadingProvider';

export function StoryDetail() {
  const { slug } = useParams<{ slug: string }>();
  const { getBookmark } = useReading();
  
  const story = slug ? getStoryBySlug(slug) : null;
  const bookmark = slug ? getBookmark(slug) : null;
  const recommendedStories = getTopStoriesByViews().filter(s => s.id !== story?.id).slice(0, 4);

  if (!story) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-foreground mb-4">Story Not Found</h1>
          <p className="text-muted-foreground mb-6">The story you're looking for doesn't exist.</p>
          <Link to="/">
            <Button>Back to Home</Button>
          </Link>
        </div>
      </div>
    );
  }

  const formatViews = (views: number) => {
    if (views >= 1000000) {
      return `${(views / 1000000).toFixed(1)}M`;
    } else if (views >= 1000) {
      return `${(views / 1000).toFixed(0)}K`;
    }
    return views.toString();
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { 
      year: 'numeric',
      month: 'long', 
      day: 'numeric' 
    });
  };

  const getLastChapter = () => {
    return story.chapters[story.chapters.length - 1];
  };

  const getContinueFromChapter = () => {
    if (bookmark) {
      return story.chapters.find(c => c.slug === bookmark.chapterSlug);
    }
    return story.chapters[0];
  };

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-8">
        {/* Story Header */}
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8 mb-8">
          <div className="lg:col-span-3">
            <div className="flex flex-col md:flex-row gap-6">
              {/* Cover Image */}
              <div className="flex-shrink-0">
                <img
                  src={story.coverImage}
                  alt={story.title}
                  className="w-full md:w-64 h-80 object-cover rounded-lg shadow-lg"
                />
              </div>

              {/* Story Info */}
              <div className="flex-1 space-y-4">
                <div>
                  <h1 className="text-3xl md:text-4xl font-bold text-foreground mb-2">
                    {story.title}
                  </h1>
                  <div className="flex items-center space-x-2 text-muted-foreground mb-4">
                    <User className="h-4 w-4" />
                    <span>by {story.author}</span>
                  </div>
                </div>

                {/* Genres */}
                <div className="flex flex-wrap gap-2">
                  {story.genres.map((genre) => (
                    <Badge key={genre} variant="secondary">
                      {genre}
                    </Badge>
                  ))}
                </div>

                {/* Stats */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <div className="flex items-center space-x-2">
                    <Star className="h-4 w-4 text-yellow-500 fill-current" />
                    <span className="font-semibold">{story.rating}</span>
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
                    <span className="font-semibold">{formatDate(story.lastUpdated)}</span>
                  </div>
                </div>

                {/* Status */}
                <div className="flex items-center space-x-2">
                  <Badge 
                    variant={story.status === 'Completed' ? 'default' : 'secondary'}
                    className="flex items-center space-x-1"
                  >
                    {story.status === 'Completed' && <CheckCircle className="h-3 w-3" />}
                    <span>{story.status}</span>
                  </Badge>
                </div>

                {/* Action Buttons */}
                <div className="flex flex-wrap gap-3 pt-4">
                  {story.chapters.length > 0 && (
                    <>
                      <Link to={`/story/${story.slug}/${story.chapters[0].slug}`}>
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
              <CardHeader>
                <CardTitle>Synopsis</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-foreground leading-relaxed whitespace-pre-line">
                  {story.description}
                </p>
              </CardContent>
            </Card>

            {/* Chapter List */}
            {story.chapters.length > 0 && (
              <Card className="mt-8">
                <CardHeader>
                  <CardTitle className="flex items-center justify-between">
                    <span>Chapters ({story.chapters.length})</span>
                    {getLastChapter() && (
                      <span className="text-sm text-muted-foreground">
                        Latest: {formatDate(getLastChapter().publishedAt)}
                      </span>
                    )}
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2 max-h-96 overflow-y-auto">
                    {story.chapters.map((chapter, index) => (
                      <div key={chapter.id}>
                        <Link 
                          to={`/story/${story.slug}/${chapter.slug}`}
                          className="flex items-center justify-between p-3 hover:bg-muted rounded-lg transition-colors"
                        >
                          <div className="flex items-center space-x-3">
                            <span className="flex-shrink-0 w-8 h-8 bg-primary/10 text-primary rounded-full flex items-center justify-center text-sm font-medium">
                              {chapter.number}
                            </span>
                            <div>
                              <h4 className="font-medium text-foreground">{chapter.title}</h4>
                              <p className="text-sm text-muted-foreground">
                                {chapter.wordCount.toLocaleString()} words
                              </p>
                            </div>
                          </div>
                          <div className="text-sm text-muted-foreground">
                            {formatDate(chapter.publishedAt)}
                          </div>
                        </Link>
                        {index < story.chapters.length - 1 && <Separator />}
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Reading Progress */}
            {bookmark && (
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Your Progress</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    <p className="text-sm text-muted-foreground">Last read:</p>
                    <p className="font-medium">{getContinueFromChapter()?.title}</p>
                    <Link to={`/story/${story.slug}/${bookmark.chapterSlug}`}>
                      <Button className="w-full mt-3">Continue Reading</Button>
                    </Link>
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Story Stats */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Statistics</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Total Views</span>
                  <span className="font-semibold">{story.views.toLocaleString()}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Rating</span>
                  <span className="font-semibold">{story.rating}/5.0</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Chapters</span>
                  <span className="font-semibold">{story.chapters.length}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Status</span>
                  <span className="font-semibold">{story.status}</span>
                </div>
              </CardContent>
            </Card>

            {/* Recommended Stories */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">You May Also Like</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {recommendedStories.map((recommendedStory) => (
                  <StoryCard key={recommendedStory.id} story={recommendedStory} variant="compact" />
                ))}
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}