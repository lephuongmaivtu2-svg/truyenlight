import React, { useEffect, useState, useRef } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { 
  ChevronLeft, 
  ChevronRight, 
  List, 
  Settings, 
  Bookmark, 
  BookmarkCheck,
  Sun,
  Moon,
  Plus,
  Minus,
  Home
} from 'lucide-react';
import { Button } from './ui/button';
import { Card, CardContent } from './ui/card';
import { Separator } from './ui/separator';
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuItem, 
  DropdownMenuSeparator, 
  DropdownMenuTrigger 
} from './ui/dropdown-menu';
import { StoryCard } from './StoryCard';
import { getStoryBySlug, getChapterBySlug, getTopStoriesByViews } from './mockData';
import { useReading } from './ReadingProvider';

export function ChapterReader() {
  const { slug, chapterSlug } = useParams<{ slug: string; chapterSlug: string }>();
  const navigate = useNavigate();
  const contentRef = useRef<HTMLDivElement>(null);
  const { preferences, updatePreferences, addBookmark, getBookmark } = useReading();
  
  const [isBookmarked, setIsBookmarked] = useState(false);
  const [showSettings, setShowSettings] = useState(false);

  const story = slug ? getStoryBySlug(slug) : null;
  const chapter = slug && chapterSlug ? getChapterBySlug(slug, chapterSlug) : null;
  
  const recommendedStories = getTopStoriesByViews().filter(s => s.id !== story?.id).slice(0, 3);

  useEffect(() => {
    if (slug && chapterSlug) {
      const bookmark = getBookmark(slug);
      setIsBookmarked(bookmark?.chapterSlug === chapterSlug);
    }
  }, [slug, chapterSlug, getBookmark]);

  useEffect(() => {
    // Save reading position on scroll
    const handleScroll = () => {
      if (slug && chapterSlug && contentRef.current) {
        const scrollPosition = window.scrollY;
        addBookmark({
          storySlug: slug,
          chapterSlug: chapterSlug,
          scrollPosition
        });
      }
    };

    const scrollTimer = setInterval(() => {
      handleScroll();
    }, 5000); // Save position every 5 seconds

    return () => clearInterval(scrollTimer);
  }, [slug, chapterSlug, addBookmark]);

  useEffect(() => {
    // Restore scroll position
    if (slug && chapterSlug) {
      const bookmark = getBookmark(slug);
      if (bookmark && bookmark.chapterSlug === chapterSlug && bookmark.scrollPosition > 0) {
        setTimeout(() => {
          window.scrollTo(0, bookmark.scrollPosition);
        }, 100);
      }
    }
  }, [slug, chapterSlug, getBookmark]);

  if (!story || !chapter) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-foreground mb-4">Chapter Not Found</h1>
          <p className="text-muted-foreground mb-6">The chapter you're looking for doesn't exist.</p>
          <Link to="/">
            <Button>Back to Home</Button>
          </Link>
        </div>
      </div>
    );
  }

  const currentChapterIndex = story.chapters.findIndex(c => c.slug === chapterSlug);
  const previousChapter = currentChapterIndex > 0 ? story.chapters[currentChapterIndex - 1] : null;
  const nextChapter = currentChapterIndex < story.chapters.length - 1 ? story.chapters[currentChapterIndex + 1] : null;

  const handleBookmark = () => {
    if (slug && chapterSlug) {
      addBookmark({
        storySlug: slug,
        chapterSlug: chapterSlug,
        scrollPosition: window.scrollY
      });
      setIsBookmarked(true);
    }
  };

  const adjustFontSize = (delta: number) => {
    const newSize = Math.max(12, Math.min(24, preferences.fontSize + delta));
    updatePreferences({ fontSize: newSize });
  };

  const toggleDarkMode = () => {
    updatePreferences({ darkMode: !preferences.darkMode });
  };

  // Preload next chapter for smooth navigation
  useEffect(() => {
    if (nextChapter) {
      const link = document.createElement('link');
      link.rel = 'prefetch';
      link.href = `/story/${slug}/${nextChapter.slug}`;
      document.head.appendChild(link);
      
      return () => {
        document.head.removeChild(link);
      };
    }
  }, [nextChapter, slug]);

  return (
    <div className="min-h-screen bg-background">
      {/* Fixed Navigation Header */}
      <div className="sticky top-0 z-50 bg-card/95 backdrop-blur border-b border-border">
        <div className="container mx-auto px-4">
          <div className="flex items-center justify-between h-14">
            {/* Left Navigation */}
            <div className="flex items-center space-x-2">
              <Link to="/">
                <Button variant="ghost" size="sm">
                  <Home className="h-4 w-4" />
                </Button>
              </Link>
              <Link to={`/story/${slug}`}>
                <Button variant="ghost" size="sm">
                  <List className="h-4 w-4 mr-2" />
                  Chapters
                </Button>
              </Link>
            </div>

            {/* Chapter Info */}
            <div className="flex-1 text-center px-4">
              <h1 className="font-semibold text-foreground truncate">
                {chapter.title}
              </h1>
              <p className="text-sm text-muted-foreground truncate">
                {story.title}
              </p>
            </div>

            {/* Right Controls */}
            <div className="flex items-center space-x-2">
              <Button 
                variant="ghost" 
                size="sm"
                onClick={handleBookmark}
                className={isBookmarked ? 'text-primary' : ''}
              >
                {isBookmarked ? <BookmarkCheck className="h-4 w-4" /> : <Bookmark className="h-4 w-4" />}
              </Button>
              
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="sm">
                    <Settings className="h-4 w-4" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-48">
                  <DropdownMenuItem onClick={toggleDarkMode}>
                    {preferences.darkMode ? (
                      <>
                        <Sun className="h-4 w-4 mr-2" />
                        Light Mode
                      </>
                    ) : (
                      <>
                        <Moon className="h-4 w-4 mr-2" />
                        Dark Mode
                      </>
                    )}
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={() => adjustFontSize(-1)}>
                    <Minus className="h-4 w-4 mr-2" />
                    Smaller Font
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => adjustFontSize(1)}>
                    <Plus className="h-4 w-4 mr-2" />
                    Larger Font
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <div className="px-2 py-1 text-sm text-muted-foreground">
                    Font Size: {preferences.fontSize}px
                  </div>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </div>
        </div>
      </div>

      {/* Chapter Navigation */}
      <div className="bg-muted/30 border-b border-border">
        <div className="container mx-auto px-4 py-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              {previousChapter ? (
                <Link to={`/story/${slug}/${previousChapter.slug}`}>
                  <Button variant="outline" size="sm" className="flex items-center space-x-2">
                    <ChevronLeft className="h-4 w-4" />
                    <span className="hidden sm:inline">Previous</span>
                  </Button>
                </Link>
              ) : (
                <Button variant="outline" size="sm" disabled>
                  <ChevronLeft className="h-4 w-4" />
                  <span className="hidden sm:inline">Previous</span>
                </Button>
              )}
            </div>

            <div className="text-center">
              <span className="text-sm text-muted-foreground">
                Chapter {chapter.number} of {story.chapters.length}
              </span>
            </div>

            <div className="flex items-center space-x-4">
              {nextChapter ? (
                <Link to={`/story/${slug}/${nextChapter.slug}`}>
                  <Button variant="outline" size="sm" className="flex items-center space-x-2">
                    <span className="hidden sm:inline">Next</span>
                    <ChevronRight className="h-4 w-4" />
                  </Button>
                </Link>
              ) : (
                <Button variant="outline" size="sm" disabled>
                  <span className="hidden sm:inline">Next</span>
                  <ChevronRight className="h-4 w-4" />
                </Button>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Chapter Content */}
      <div className="container mx-auto px-4 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          <div className="lg:col-span-3">
            <Card>
              <CardContent className="p-8">
                <header className="mb-8">
                  <h1 className="text-3xl font-bold text-foreground mb-2">
                    {chapter.title}
                  </h1>
                  <div className="flex items-center space-x-4 text-muted-foreground text-sm">
                    <span>Chapter {chapter.number}</span>
                    <span>•</span>
                    <span>{chapter.wordCount.toLocaleString()} words</span>
                    <span>•</span>
                    <span>{new Date(chapter.publishedAt).toLocaleDateString()}</span>
                  </div>
                </header>

                <Separator className="mb-8" />

                <div 
                  ref={contentRef}
                  className="prose prose-lg max-w-none text-foreground"
                  style={{ 
                    fontSize: `${preferences.fontSize}px`,
                    lineHeight: 1.7,
                  }}
                >
                  {chapter.content.split('\n').map((paragraph, index) => (
                    <p key={index} className="mb-6 text-justify">
                      {paragraph}
                    </p>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Bottom Navigation */}
            <div className="mt-8 flex items-center justify-between">
              {previousChapter ? (
                <Link to={`/story/${slug}/${previousChapter.slug}`}>
                  <Button className="flex items-center space-x-2">
                    <ChevronLeft className="h-4 w-4" />
                    <div className="text-left">
                      <div className="text-sm opacity-75">Previous</div>
                      <div className="font-medium">{previousChapter.title}</div>
                    </div>
                  </Button>
                </Link>
              ) : (
                <div></div>
              )}

              {nextChapter ? (
                <Link to={`/story/${slug}/${nextChapter.slug}`}>
                  <Button className="flex items-center space-x-2">
                    <div className="text-right">
                      <div className="text-sm opacity-75">Next</div>
                      <div className="font-medium">{nextChapter.title}</div>
                    </div>
                    <ChevronRight className="h-4 w-4" />
                  </Button>
                </Link>
              ) : (
                <div></div>
              )}
            </div>

            {/* Suggested Stories */}
            {recommendedStories.length > 0 && (
              <Card className="mt-8">
                <CardContent className="p-6">
                  <h3 className="text-xl font-bold text-foreground mb-4">You May Also Like</h3>
                  <div className="grid grid-cols-1 gap-4">
                    {recommendedStories.map((story) => (
                      <StoryCard key={story.id} story={story} variant="compact" />
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Story Info */}
            <Card>
              <CardContent className="p-6">
                <Link to={`/story/${slug}`} className="block hover:opacity-80 transition-opacity">
                  <img
                    src={story.coverImage}
                    alt={story.title}
                    className="w-full h-40 object-cover rounded mb-4"
                  />
                  <h3 className="font-bold text-foreground mb-1">{story.title}</h3>
                  <p className="text-sm text-muted-foreground">{story.author}</p>
                </Link>
              </CardContent>
            </Card>

            {/* Chapter Navigation */}
            <Card>
              <CardContent className="p-6">
                <h4 className="font-semibold text-foreground mb-4">Navigation</h4>
                <div className="space-y-2">
                  <Link to={`/story/${slug}`}>
                    <Button variant="outline" className="w-full justify-start">
                      <List className="h-4 w-4 mr-2" />
                      All Chapters
                    </Button>
                  </Link>
                  {previousChapter && (
                    <Link to={`/story/${slug}/${previousChapter.slug}`}>
                      <Button variant="outline" className="w-full justify-start">
                        <ChevronLeft className="h-4 w-4 mr-2" />
                        Previous Chapter
                      </Button>
                    </Link>
                  )}
                  {nextChapter && (
                    <Link to={`/story/${slug}/${nextChapter.slug}`}>
                      <Button variant="outline" className="w-full justify-start">
                        <ChevronRight className="h-4 w-4 mr-2" />
                        Next Chapter
                      </Button>
                    </Link>
                  )}
                </div>
              </CardContent>
            </Card>

            {/* Reading Settings */}
            <Card>
              <CardContent className="p-6">
                <h4 className="font-semibold text-foreground mb-4">Reading Settings</h4>
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-sm">Font Size</span>
                    <div className="flex items-center space-x-2">
                      <Button size="sm" variant="outline" onClick={() => adjustFontSize(-1)}>
                        <Minus className="h-3 w-3" />
                      </Button>
                      <span className="text-sm w-8 text-center">{preferences.fontSize}</span>
                      <Button size="sm" variant="outline" onClick={() => adjustFontSize(1)}>
                        <Plus className="h-3 w-3" />
                      </Button>
                    </div>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm">Theme</span>
                    <Button size="sm" variant="outline" onClick={toggleDarkMode}>
                      {preferences.darkMode ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
                    </Button>
                  </div>
                  <Button 
                    size="sm" 
                    variant="outline" 
                    className="w-full"
                    onClick={handleBookmark}
                  >
                    {isBookmarked ? <BookmarkCheck className="h-4 w-4 mr-2" /> : <Bookmark className="h-4 w-4 mr-2" />}
                    {isBookmarked ? 'Bookmarked' : 'Bookmark'}
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}