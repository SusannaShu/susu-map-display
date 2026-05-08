import { useState } from 'react';
import { LiveMap } from './components/LiveMap';
import { MyPosts } from './components/MyPosts';
import { MessagesPage } from './components/MessagesPage';
import { ProfilePage } from './components/ProfilePage';
import { BottomNav } from './components/BottomNav';
import type { TabId } from './components/BottomNav';
import { QuickPostModal } from './components/QuickPostModal';
import { useAppSelector } from './store/store';
import { Toaster } from 'react-hot-toast';
import './index.css';

function App() {
  const [activeTab, setActiveTab] = useState<TabId>('map');
  const [isPostModalOpen, setIsPostModalOpen] = useState(false);

  const { isAuthenticated, user } = useAppSelector((state) => state.auth);

  const renderActiveTab = () => {
    switch (activeTab) {
      case 'map':
        return <LiveMap />;
      case 'posts':
        return <MyPosts />;
      case 'messages':
        return <MessagesPage />;
      case 'profile':
        return <ProfilePage isAuthenticated={isAuthenticated} user={user} />;
      default:
        return <LiveMap />;
    }
  };

  return (
    <div style={{
      width: '100%',
      height: '100%',
      display: 'flex',
      flexDirection: 'column',
      position: 'relative',
      overflow: 'hidden',
      background: 'var(--color-bg)',
    }}>
      <div style={{ flex: 1, position: 'relative', overflow: 'hidden' }}>
        {renderActiveTab()}
      </div>

      <BottomNav
        activeTab={activeTab}
        onTabChange={setActiveTab}
        onPostClick={() => setIsPostModalOpen(true)}
      />

      {isPostModalOpen && (
        <QuickPostModal onClose={() => setIsPostModalOpen(false)} />
      )}

      <Toaster 
        position="top-center"
        toastOptions={{
          style: {
            borderRadius: '24px',
            background: '#333',
            color: '#fff',
            fontSize: '15px',
            padding: '12px 24px',
          },
          success: {
            iconTheme: {
              primary: '#0d9488',
              secondary: '#fff',
            },
          },
        }}
      />
    </div>
  );
}

export default App;
