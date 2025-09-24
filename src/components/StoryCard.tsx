import React from 'react';
import { Link } from 'react-router-dom';
import { Star, Eye, Clock, CheckCircle } from 'lucide-react';
import { Badge } from './ui/badge';
import { Card, CardContent } from './ui/card';
import { Story } from './mockData';

interface StoryCardProps {
  story: Story;
  variant?: 'default' | 'compact' | 'featured';
}

export function StoryCard({ story, variant = 'default' }: StoryCardProps) {
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
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
  };

  if (variant === 'compact') {
    return (
      <Link to={`/story/${story.slug}`}>
        <Card className="hover:shadow-md transition-shadow">
          <CardContent className="p-4">
            <div className="flex space-x-3">
              <img
                src={story.coverImage}
                alt={story.title}
                className="w-16 h-20 object-cover rounded"
              />
              <div className="flex-1 min-w-0">
                <h3 className="font-semibold text-foreground truncate">{story.title}</h3>
                <p className="text-sm text-muted-foreground">{story.author}</p>
                <div className="flex items-center space-x-2 mt-1">
                  <div className="flex items-center space-x-1">
                    <Star className="h-3 w-3 text-yellow-500 fill-current" />
                    <span className="text-xs text-muted-foreground">{story.rating}</span>
                  </div>
                  <div className="flex items-center space-x-1">
                    <Eye className="h-3 w-3 text-muted-foreground" />
                    <span className="text-xs text-muted-foreground">{formatViews(story.views)}</span>
                  </div>
                </div>
                <Badge 
                  variant={story.status === 'Completed' ? 'default' : 'secondary'}
                  className="mt-1 text-xs"
                >
                  {story.status}
                </Badge>
              </div>
            </div>
          </CardContent>
        </Card>
      </Link>
    );
  }

  if (variant === 'featured') {
    return (
      <Link to={`/story/${story.slug}`}>
        <Card className="hover:shadow-lg transition-shadow overflow-hidden">
          <div className="relative">
            <img
              src={story.coverImage}
              alt={story.title}
              className="w-full h-48 object-cover"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
            <div className="absolute bottom-4 left-4 right-4 text-white">
              <h3 className="text-lg font-bold mb-1">{story.title}</h3>
              <p className="text-sm opacity-90">{story.author}</p>
            </div>
          </div>
          <CardContent className="p-4">
            <p className="text-muted-foreground text-sm line-clamp-2 mb-3">
              {story.description}
            </p>
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <div className="flex items-center space-x-1">
                  <Star className="h-4 w-4 text-yellow-500 fill-current" />
                  <span className="text-sm">{story.rating}</span>
                </div>
                <div className="flex items-center space-x-1">
                  <Eye className="h-4 w-4 text-muted-foreground" />
                  <span className="text-sm text-muted-foreground">{formatViews(story.views)}</span>
                </div>
              </div>
              <Badge variant={story.status === 'Completed' ? 'default' : 'secondary'}>
                {story.status}
              </Badge>
            </div>
          </CardContent>
        </Card>
      </Link>
    );
  }

  return (
    <Link to={`/story/${story.slug}`}>
      <Card className="hover:shadow-md transition-shadow">
        <CardContent className="p-4">
          <div className="flex space-x-4">
            <img
              src={story.coverImage}
              alt={story.title}
              className="w-20 h-28 object-cover rounded"
            />
            <div className="flex-1 min-w-0">
              <h3 className="font-semibold text-foreground mb-1">{story.title}</h3>
              <p className="text-sm text-muted-foreground mb-2">{story.author}</p>
              <p className="text-sm text-muted-foreground line-clamp-2 mb-3">
                {story.description}
              </p>
              
              <div className="flex flex-wrap gap-1 mb-3">
                {story.genres.slice(0, 3).map((genre) => (
                  <Badge key={genre} variant="outline" className="text-xs">
                    {genre}
                  </Badge>
                ))}
              </div>

              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <div className="flex items-center space-x-1">
                    <Star className="h-4 w-4 text-yellow-500 fill-current" />
                    <span className="text-sm">{story.rating}</span>
                  </div>
                  <div className="flex items-center space-x-1">
                    <Eye className="h-4 w-4 text-muted-foreground" />
                    <span className="text-sm text-muted-foreground">{formatViews(story.views)}</span>
                  </div>
                  <div className="flex items-center space-x-1">
                    <Clock className="h-4 w-4 text-muted-foreground" />
                    <span className="text-sm text-muted-foreground">{formatDate(story.lastUpdated)}</span>
                  </div>
                </div>
                <Badge 
                  variant={story.status === 'Completed' ? 'default' : 'secondary'}
                  className="flex items-center space-x-1"
                >
                  {story.status === 'Completed' && <CheckCircle className="h-3 w-3" />}
                  <span>{story.status}</span>
                </Badge>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </Link>
  );
}