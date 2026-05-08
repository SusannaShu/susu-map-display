import { useState } from 'react';
import { mockPins } from '../data/mockData';
import type { EventPin } from '../data/mockData';
import { useAppSelector } from '../store/store';
import toast from 'react-hot-toast';
import './MyPosts.css';

export function MyPosts() {
  const user = useAppSelector((state) => state.auth.user);
  const [filter, setFilter] = useState<'all' | 'hosting' | 'attending'>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [isSearchOpen, setIsSearchOpen] = useState(false);

  // Use mock event pins for display
  const events = mockPins.filter((p) => p.layer === 'events') as EventPin[];

  const displayEvents = events.filter((post) => {
    if (filter === 'hosting') return post.postedBy === user?.username;
    if (filter === 'attending') return post.postedBy !== user?.username;
    return true;
  }).filter((post) => {
    if (!searchQuery) return true;
    const q = searchQuery.toLowerCase();
    return post.title?.toLowerCase().includes(q) || (post as any).location?.toLowerCase().includes(q);
  });

  // Group by Month, then by Day
  const groupedEvents: Record<string, Record<string, EventPin[]>> = {};

  displayEvents.forEach((post) => {
    const d = new Date(post.startTime || post.createdAt);
    const month = d.toLocaleString('en-US', { month: 'long' });
    const dayName = d.toLocaleString('en-US', { weekday: 'long' });
    const dateNum = d.getDate();
    const dayStr = `${dayName} ${month} ${dateNum}`;

    if (!groupedEvents[month]) groupedEvents[month] = {};
    if (!groupedEvents[month][dayStr]) groupedEvents[month][dayStr] = [];
    groupedEvents[month][dayStr].push(post);
  });

  const getRealFormatTime = (dateStr: string) => {
    const d = new Date(dateStr);
    const weekday = d.toLocaleString('en-US', { weekday: 'short' });
    const month = d.getMonth() + 1;
    const date = d.getDate();
    const time = d.toLocaleString('en-US', { hour: 'numeric', minute: '2-digit', hour12: true }).toLowerCase();
    return `${weekday}, ${month}/${date} -- ${time}`;
  };

  return (
    <div className="myEventsPage" id="my-events-page">
      <div className="myEventsHeader">
        {isSearchOpen ? (
          <div className="myEventsSearchContainer" style={{ display: 'flex', width: '100%', alignItems: 'center', gap: '8px' }}>
            <input
              type="text"
              placeholder="Search events..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              autoFocus
              style={{ flex: 1, padding: '8px 16px', borderRadius: '20px', border: '1px solid var(--color-border)', outline: 'none' }}
            />
            <button className="myEventsSearchBtn" onClick={() => { setIsSearchOpen(false); setSearchQuery(''); }}>
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
                <line x1="18" y1="6" x2="6" y2="18" />
                <line x1="6" y1="6" x2="18" y2="18" />
              </svg>
            </button>
          </div>
        ) : (
          <>
            <h1 className="myEventsTitle">My Events</h1>
            <button className="myEventsSearchBtn" onClick={() => setIsSearchOpen(true)}>
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
                <circle cx="11" cy="11" r="8" />
                <line x1="21" y1="21" x2="16.65" y2="16.65" />
              </svg>
            </button>
          </>
        )}
      </div>

      <div className="myEventsFilters">
        <button className={`filterBtn ${filter === 'all' ? 'active' : ''}`} onClick={() => setFilter('all')}>All</button>
        <button className={`filterBtn ${filter === 'hosting' ? 'active' : ''}`} onClick={() => setFilter('hosting')}>Hosting</button>
        <button className={`filterBtn ${filter === 'attending' ? 'active' : ''}`} onClick={() => setFilter('attending')}>Attending</button>
      </div>

      <div className="myEventsList">
        {displayEvents.length === 0 ? (
          <div className="myEventsEmpty">No events found.</div>
        ) : (
          Object.entries(groupedEvents).map(([month, days]) => (
            <div key={month} className="monthGroup">
              <div className="monthDivider">
                <span className="monthDividerLine"></span>
                <span className="monthPill">{month}</span>
                <span className="monthDividerLine"></span>
              </div>

              {Object.entries(days).map(([dayStr, dayEvents]) => (
                <div key={dayStr} className="dayGroup">
                  <h3 className="dayTitle">
                    <span className="dayName">{dayStr.split(' ')[0]}</span>{' '}
                    <span className="dayDate">{dayStr.split(' ').slice(1).join(' ')}</span>
                  </h3>

                  {dayEvents.map((post) => {
                    const isHosting = post.postedBy === user?.username;
                    return (
                      <div key={post.id} className="eventCard">
                        <div
                          className="eventImage"
                          style={{ backgroundImage: `url(${post.imageUrl})` }}
                        />
                        <div className="eventContent">
                          <div className="eventMetaRow">
                            <div className="eventTimeBadge">
                              {getRealFormatTime(post.startTime || post.createdAt)}
                            </div>
                            <div className="eventActionBtns" style={{ display: 'flex', gap: '8px' }}>
                              <button className="eventEditBtn" onClick={() => toast.success('Action saved (display mode)')}>
                                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
                                  <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" />
                                  <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" />
                                </svg>
                              </button>
                            </div>
                          </div>
                          <div className="eventTitle">{post.title}</div>
                          <div className="eventRoleBadge">
                            {isHosting ? 'Hosting' : 'Attending'}
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              ))}
            </div>
          ))
        )}
      </div>
    </div>
  );
}
