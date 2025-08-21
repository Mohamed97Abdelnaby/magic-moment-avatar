import { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import Navigation from '@/components/Navigation';
import { Plus, Calendar, MapPin, Palette, Eye, Trash2, Sparkles } from 'lucide-react';
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
  const [selectedEvent, setSelectedEvent] = useState<Event | null>(null);
  const [isDetailsOpen, setIsDetailsOpen] = useState(false);

  // Avatar styles mapping
  const avatarStylesMap = {
    farmer: { name: "Egyptian Farmer", description: "Traditional Rural Life", preview: "🌾" },
    pharaonic: { name: "Ancient Pharaoh", description: "Royal Dynasty Style", preview: "👑" },
    basha: { name: "El Basha Style", description: "Elite Noble Fashion", preview: "🎩" },
    beach: { name: "Beach Vibes", description: "Summer Mediterranean", preview: "🏖️" },
    pixar: { name: "Pixar Style", description: "3D Animated Magic", preview: "🎭" },
    // Legacy styles (for older events)
    cyberpunk: { name: "Cyberpunk", description: "Futuristic Neon Style", preview: "🤖" },
    sketch: { name: "Sketch Art", description: "Pencil Drawing Style", preview: "✏️" },
    anime: { name: "Anime", description: "Japanese Animation Style", preview: "🎌" },
    oil: { name: "Oil Painting", description: "Classical Painted Portrait", preview: "🎨" },
    cartoon: { name: "90s Cartoon", description: "Retro Animation Style", preview: "🎪" },
  } as const;

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

  const handleEventClick = (event: Event) => {
    navigate(`/kiosk?event=${event.id}`);
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
                <Card 
                  key={event.id} 
                  className="group hover:shadow-lg transition-shadow cursor-pointer"
                  onClick={() => handleEventClick(event)}
                >
                  <CardHeader>
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <CardTitle className="text-xl mb-1 group-hover:text-primary transition-colors">
                          {event.name}
                        </CardTitle>
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
                      {/* Avatar Styles Preview */}
                      <div>
                        <p className="text-sm font-medium mb-2 flex items-center gap-1">
                          <Sparkles className="h-4 w-4" />
                          Avatar Styles ({event.avatar_styles.length})
                        </p>
                        <div className="flex flex-wrap gap-1">
                          {event.avatar_styles.length > 0 ? (
                            event.avatar_styles.slice(0, 3).map((style, index) => {
                              const styleInfo = avatarStylesMap[style as keyof typeof avatarStylesMap];
                              return (
                                <Badge key={index} variant="secondary" className="text-xs gap-1">
                                  {styleInfo?.preview || '🎨'} {styleInfo?.name || style}
                                </Badge>
                              );
                            })
                          ) : (
                            <Badge variant="outline" className="text-xs">None selected</Badge>
                          )}
                          {event.avatar_styles.length > 3 && (
                            <Badge variant="outline" className="text-xs">
                              +{event.avatar_styles.length - 3} more
                            </Badge>
                          )}
                        </div>
                        <p className="text-xs text-muted-foreground mt-2">
                          Click to open kiosk for this event
                        </p>
                      </div>

                      {/* Actions */}
                      <div className="flex items-center gap-2 pt-2">
                        <Button 
                          onClick={(e) => {
                            e.stopPropagation();
                            handleViewEvent(event.id);
                          }}
                          size="sm" 
                          className="flex-1 gap-2"
                        >
                          <Eye className="h-4 w-4" />
                          Edit
                        </Button>
                        <Button
                          onClick={(e) => {
                            e.stopPropagation();
                            handleDeleteEvent(event.id, event.name);
                          }}
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

      {/* Event Details Modal */}
      <Dialog open={isDetailsOpen} onOpenChange={setIsDetailsOpen}>
        <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="text-2xl flex items-center gap-2">
              <Sparkles className="h-6 w-6 text-primary" />
              {selectedEvent?.name}
            </DialogTitle>
            {selectedEvent?.location && (
              <div className="flex items-center text-muted-foreground gap-1">
                <MapPin className="h-4 w-4" />
                {selectedEvent.location}
              </div>
            )}
          </DialogHeader>
          
          {selectedEvent && (
            <div className="space-y-6">
              {/* Color Theme */}
              <div>
                <h3 className="font-semibold mb-3 flex items-center gap-2">
                  <Palette className="h-5 w-5" />
                  Color Theme
                </h3>
                <div className="flex items-center gap-3">
                  <div className="flex items-center gap-2">
                    <div 
                      className="w-8 h-8 rounded-full border border-border shadow-sm"
                      style={{ backgroundColor: selectedEvent.primary_color }}
                    />
                    <span className="text-sm font-medium">Primary</span>
                  </div>
                  {selectedEvent.secondary_color && (
                    <div className="flex items-center gap-2">
                      <div 
                        className="w-8 h-8 rounded-full border border-border shadow-sm"
                        style={{ backgroundColor: selectedEvent.secondary_color }}
                      />
                      <span className="text-sm font-medium">Secondary</span>
                    </div>
                  )}
                </div>
              </div>

              {/* Avatar Styles */}
              <div>
                <h3 className="font-semibold mb-3 flex items-center gap-2">
                  <Sparkles className="h-5 w-5" />
                  Chosen Avatar Styles ({selectedEvent.avatar_styles.length})
                </h3>
                {selectedEvent.avatar_styles.length > 0 ? (
                  <div className="grid gap-4 md:grid-cols-2">
                    {selectedEvent.avatar_styles.map((style, index) => {
                      const styleInfo = avatarStylesMap[style as keyof typeof avatarStylesMap];
                      return (
                        <Card key={index} className="border-2 hover:border-primary/50 transition-colors">
                          <CardContent className="p-4">
                            <div className="flex items-start gap-3">
                              <div className="text-3xl">{styleInfo?.preview || '🎨'}</div>
                              <div className="flex-1">
                                <h4 className="font-semibold text-base mb-1">
                                  {styleInfo?.name || style}
                                </h4>
                                <p className="text-sm text-muted-foreground">
                                  {styleInfo?.description || 'Custom avatar style'}
                                </p>
                              </div>
                            </div>
                          </CardContent>
                        </Card>
                      );
                    })}
                  </div>
                ) : (
                  <Card className="border-dashed">
                    <CardContent className="p-8 text-center">
                      <div className="text-4xl mb-2">🎭</div>
                      <p className="text-muted-foreground">No avatar styles selected for this event</p>
                    </CardContent>
                  </Card>
                )}
              </div>

              {/* Event Info */}
              <div className="bg-muted/50 rounded-lg p-4">
                <h4 className="font-medium mb-2">Event Information</h4>
                <div className="space-y-1 text-sm text-muted-foreground">
                  <p>Created: {new Date(selectedEvent.created_at).toLocaleDateString()}</p>
                  <p>Last Updated: {new Date(selectedEvent.updated_at).toLocaleDateString()}</p>
                  <p>Status: {selectedEvent.is_active ? 'Active' : 'Inactive'}</p>
                </div>
              </div>

              {/* Actions */}
              <div className="flex gap-3 pt-4">
                <Button 
                  onClick={() => {
                    handleViewEvent(selectedEvent.id);
                    setIsDetailsOpen(false);
                  }}
                  className="flex-1"
                >
                  <Eye className="h-4 w-4 mr-2" />
                  Edit Event
                </Button>
                <Button
                  onClick={() => {
                    navigator.clipboard.writeText(`${window.location.origin}/kiosk?event=${selectedEvent.id}`);
                    toast({
                      title: 'Link Copied!',
                      description: 'Kiosk link copied to clipboard',
                    });
                  }}
                  variant="outline"
                  className="flex-1"
                >
                  Copy Kiosk Link
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default MyEvents;