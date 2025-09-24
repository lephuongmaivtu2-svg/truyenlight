import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Search, Menu, X, BookOpen, User } from 'lucide-react';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { searchStories } from './mockData';

export function Header() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<any[]>([]);
  const [showSearchResults, setShowSearchResults] = useState(false);
  const navigate = useNavigate();

  const handleSearch = (query: string) => {
    setSearchQuery(query);
    if (query.trim()) {
      const results = searchStories(query);
      setSearchResults(results);
      setShowSearchResults(true);
    } else {
      setShowSearchResults(false);
    }
  };

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      // In a real app, this would navigate to a search results page
      setShowSearchResults(false);
    }
  };

  return (
    <header className="bg-card border-b border-border sticky top-0 z-50">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link to="/" className="flex items-center space-x-2">
            <BookOpen className="h-8 w-8 text-primary" />
            <span className="text-xl font-bold text-foreground">NovelHub</span>
          </Link>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center space-x-8">
            <Link to="/" className="text-foreground hover:text-primary transition-colors">
              Home
            </Link>
            <a href="#genres" className="text-foreground hover:text-primary transition-colors">
              Genres
            </a>
            <a href="#search" className="text-foreground hover:text-primary transition-colors">
              Search
            </a>
            <a href="#contact" className="text-foreground hover:text-primary transition-colors">
              Contact
            </a>
          </nav>

          {/* Search Bar - Desktop */}
          <div className="hidden md:block relative">
            <form onSubmit={handleSearchSubmit} className="relative">
              <Input
                type="text"
                placeholder="Search stories..."
                value={searchQuery}
                onChange={(e) => handleSearch(e.target.value)}
                className="w-64 pl-10"
              />
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            </form>
            
            {/* Search Results Dropdown */}
            {showSearchResults && (
              <div className="absolute top-full left-0 right-0 mt-1 bg-card border border-border rounded-md shadow-lg max-h-96 overflow-y-auto z-50">
                {searchResults.length > 0 ? (
                  searchResults.slice(0, 5).map((story) => (
                    <Link
                      key={story.id}
                      to={`/story/${story.slug}`}
                      className="block p-3 hover:bg-muted transition-colors border-b border-border last:border-b-0"
                      onClick={() => setShowSearchResults(false)}
                    >
                      <div className="flex items-center space-x-3">
                        <img
                          src={story.coverImage}
                          alt={story.title}
                          className="w-10 h-10 object-cover rounded"
                        />
                        <div>
                          <h4 className="font-medium text-foreground">{story.title}</h4>
                          <p className="text-sm text-muted-foreground">{story.author}</p>
                        </div>
                      </div>
                    </Link>
                  ))
                ) : (
                  <div className="p-3 text-muted-foreground">No stories found</div>
                )}
              </div>
            )}
          </div>

          {/* Login/Register Button */}
          <div className="hidden md:flex items-center space-x-2">
            <Button variant="ghost" size="sm">
              <User className="h-4 w-4 mr-2" />
              Login
            </Button>
            <Button size="sm">Register</Button>
          </div>

          {/* Mobile Menu Button */}
          <Button
            variant="ghost"
            size="sm"
            className="md:hidden"
            onClick={() => setIsMenuOpen(!isMenuOpen)}
          >
            {isMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </Button>
        </div>

        {/* Mobile Menu */}
        {isMenuOpen && (
          <div className="md:hidden border-t border-border py-4">
            {/* Mobile Search */}
            <div className="mb-4">
              <form onSubmit={handleSearchSubmit} className="relative">
                <Input
                  type="text"
                  placeholder="Search stories..."
                  value={searchQuery}
                  onChange={(e) => handleSearch(e.target.value)}
                  className="w-full pl-10"
                />
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              </form>
            </div>

            {/* Mobile Navigation */}
            <nav className="space-y-2">
              <Link
                to="/"
                className="block py-2 text-foreground hover:text-primary transition-colors"
                onClick={() => setIsMenuOpen(false)}
              >
                Home
              </Link>
              <a
                href="#genres"
                className="block py-2 text-foreground hover:text-primary transition-colors"
                onClick={() => setIsMenuOpen(false)}
              >
                Genres
              </a>
              <a
                href="#search"
                className="block py-2 text-foreground hover:text-primary transition-colors"
                onClick={() => setIsMenuOpen(false)}
              >
                Search
              </a>
              <a
                href="#contact"
                className="block py-2 text-foreground hover:text-primary transition-colors"
                onClick={() => setIsMenuOpen(false)}
              >
                Contact
              </a>
            </nav>

            {/* Mobile Login/Register */}
            <div className="flex items-center space-x-2 mt-4 pt-4 border-t border-border">
              <Button variant="ghost" size="sm" className="flex-1">
                <User className="h-4 w-4 mr-2" />
                Login
              </Button>
              <Button size="sm" className="flex-1">Register</Button>
            </div>
          </div>
        )}
      </div>
    </header>
  );
}