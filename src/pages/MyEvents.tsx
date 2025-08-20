import { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import Navigation from '@/components/Navigation';
import { Plus, Calendar, MapPin, Palette, Eye, Trash2 } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface Event {
  id: string;
  name: string;
  location: string | null;
  primary_color: string;
  secondary_color: string | null;
  background_style: string;
  avatar_styles: string[];
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

const MyEvents = () => {
  const { user, loading: authLoading } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [events, setEvents] = useState<Event[]>([]);
  const [loading, setLoading] = useState(true);

  // Redirect if not authenticated
  useEffect(() => {
    if (!authLoading && !user) {
      navigate('/auth');
    }
  }, [user, authLoading, navigate]);

  // Load user's events
  useEffect(() => {
    if (user) {
      loadEvents();
    }
  }, [user]);

  const loadEvents = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('events')
        .select('*')
        .order('updated_at', { ascending: false });

      if (error) throw error;
      setEvents(data || []);
    } catch (error) {
      console.error('Error loading events:', error);
      toast({
        title: 'Error',
        description: 'Failed to load events',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const handleCreateNew = () => {
    navigate('/setup');
  };

  const handleViewEvent = (eventId: string) => {
    navigate(`/setup?event=${eventId}`);
  };

  const handleDeleteEvent = async (eventId: string, eventName: string) => {
    if (!confirm(`Are you sure you want to delete "${eventName}"?`)) {
      return;
    }

    try {
      const { error } = await supabase
        .from('events')
        .delete()
        .eq('id', eventId);

      if (error) throw error;

      setEvents(events.filter(event => event.id !== eventId));
      toast({
        title: 'Success',
        description: 'Event deleted successfully',
      });
    } catch (error) {
      console.error('Error deleting event:', error);
      toast({
        title: 'Error',
        description: 'Failed to delete event',
        variant: 'destructive',
      });
    }
  };

  if (authLoading || !user) {
    return null;
  }

  return (
    <div className="min-h-screen bg-background">
      <Navigation />
      <div className="pt-20 pb-12">
        <div className="container mx-auto px-6">
          {/* Header */}
          <div className="flex items-center justify-between mb-8">
            <div>
              <h1 className="text-4xl font-bold text-foreground mb-2">My Events</h1>
              <p className="text-muted-foreground">
                Manage your saved event configurations
              </p>
            </div>
            <Button onClick={handleCreateNew} size="lg" className="gap-2">
              <Plus className="h-5 w-5" />
              Create New Event
            </Button>
          </div>

          {/* Events Grid */}
          {loading ? (
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
              {[...Array(6)].map((_, i) => (
                <Card key={i} className="animate-pulse">
                  <CardHeader>
                    <div className="h-6 bg-muted rounded mb-2" />
                    <div className="h-4 bg-muted rounded w-3/4" />
                  </CardHeader>
                  <CardContent>
                    <div className="h-20 bg-muted rounded" />
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : events.length === 0 ? (
            <Card className="text-center py-16">
              <CardContent>
                <Calendar className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
                <CardTitle className="mb-2">No Events Yet</CardTitle>
                <CardDescription className="mb-6">
                  Create your first event to get started with AvatarMoment
                </CardDescription>
                <Button onClick={handleCreateNew} size="lg" className="gap-2">
                  <Plus className="h-5 w-5" />
                  Create Your First Event
                </Button>
              </CardContent>
            </Card>
          ) : (
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
              {events.map((event) => (
                <Card key={event.id} className="group hover:shadow-lg transition-shadow">
                  <CardHeader>
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <CardTitle className="text-xl mb-1">{event.name}</CardTitle>
                        {event.location && (
                          <div className="flex items-center text-sm text-muted-foreground mb-2">
                            <MapPin className="h-4 w-4 mr-1" />
                            {event.location}
                          </div>
                        )}
                      </div>
                      <div className="flex items-center gap-1 ml-2">
                        <div 
                          className="w-4 h-4 rounded-full border border-border"
                          style={{ backgroundColor: event.primary_color }}
                        />
                        {event.secondary_color && (
                          <div 
                            className="w-4 h-4 rounded-full border border-border"
                            style={{ backgroundColor: event.secondary_color }}
                          />
                        )}
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      {/* Avatar Styles */}
                      <div>
                        <p className="text-sm font-medium mb-2">Avatar Styles:</p>
                        <div className="flex flex-wrap gap-1">
                          {event.avatar_styles.length > 0 ? (
                            event.avatar_styles.map((style, index) => (
                              <Badge key={index} variant="secondary" className="text-xs">
                                {style}
                              </Badge>
                            ))
                          ) : (
                            <Badge variant="outline" className="text-xs">None selected</Badge>
                          )}
                        </div>
                      </div>

                      {/* Actions */}
                      <div className="flex items-center gap-2 pt-2">
                        <Button 
                          onClick={() => handleViewEvent(event.id)}
                          size="sm" 
                          className="flex-1 gap-2"
                        >
                          <Eye className="h-4 w-4" />
                          Edit
                        </Button>
                        <Button
                          onClick={() => handleDeleteEvent(event.id, event.name)}
                          size="sm"
                          variant="outline"
                          className="px-3"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default MyEvents;