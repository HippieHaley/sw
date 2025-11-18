'use client';

import { useState, useEffect } from 'react';
import { Calendar as BigCalendar, momentLocalizer, View } from 'react-big-calendar';
import moment from 'moment';
import 'react-big-calendar/lib/css/react-big-calendar.css';

const localizer = momentLocalizer(moment);

interface Post {
  id: string;
  title: string;
  scheduledFor: string | null;
  status: string;
}

interface CalendarEvent {
  id: string;
  title: string;
  start: Date;
  end: Date;
  resource: Post;
}

export default function Calendar() {
  const [events, setEvents] = useState<CalendarEvent[]>([]);
  const [loading, setLoading] = useState(true);
  const [view, setView] = useState<View>('month');
  const [date, setDate] = useState(new Date());

  useEffect(() => {
    loadPosts();
  }, []);

  const loadPosts = async () => {
    try {
      const response = await fetch('/api/posts');
      const data = await response.json();

      if (data.posts) {
        const calendarEvents: CalendarEvent[] = data.posts
          .filter((post: Post) => post.scheduledFor)
          .map((post: Post) => {
            const start = new Date(post.scheduledFor!);
            return {
              id: post.id,
              title: post.title,
              start,
              end: new Date(start.getTime() + 60 * 60 * 1000), // 1 hour duration
              resource: post,
            };
          });

        setEvents(calendarEvents);
      }
      setLoading(false);
    } catch (error) {
      console.error('Failed to load posts:', error);
      setLoading(false);
    }
  };

  const handleSelectEvent = (event: CalendarEvent) => {
    alert(`Post: ${event.title}\nScheduled: ${event.start.toLocaleString()}\nStatus: ${event.resource.status}`);
  };

  const handleSelectSlot = (slotInfo: any) => {
    const title = prompt('Enter post title:');
    if (title) {
      // Navigate to create post with pre-filled date
      window.location.href = `/dashboard?tab=create&date=${slotInfo.start.toISOString()}`;
    }
  };

  if (loading) {
    return (
      <div className="bg-gray-800 rounded-lg p-8 text-center">
        <p className="text-gray-400">Loading calendar...</p>
      </div>
    );
  }

  return (
    <div className="bg-gray-800 rounded-lg p-6">
      <h2 className="text-2xl font-bold text-white mb-6">Content Calendar</h2>
      
      <div className="calendar-container bg-white rounded-lg p-4">
        <BigCalendar
          localizer={localizer}
          events={events}
          startAccessor="start"
          endAccessor="end"
          style={{ height: 600 }}
          view={view}
          onView={setView}
          date={date}
          onNavigate={setDate}
          onSelectEvent={handleSelectEvent}
          onSelectSlot={handleSelectSlot}
          selectable
          popup
        />
      </div>

      <div className="mt-4 text-sm text-gray-400">
        <p>📅 Click on a date to create a new scheduled post</p>
        <p>📝 Click on an event to view post details</p>
      </div>
    </div>
  );
}
