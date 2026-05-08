import { useState } from 'react';

import toast from 'react-hot-toast';
import './ProfilePage.css';

interface ProfilePageProps {
  isAuthenticated: boolean;
  user: any;
}

export function ProfilePage({ user }: ProfilePageProps) {
  const displayName = user?.username || 'DemoUser';
  const displayEmail = user?.email || 'demo@nyu.edu';
  const displayBio = "When in doubt, I'm always building :D";
  const displaySchool = user?.school || 'NYU';

  const stats = [
    { value: '8', label: 'Items Shared' },
    { value: '12', label: 'Items Grabbed' },
    { value: '3', label: 'Events' },
    { value: 'N/A', label: 'Trust Score', isStar: true },
  ];

  // Profile Edit State (local only)
  const [isEditingProfile, setIsEditingProfile] = useState(false);
  const [editUsername, setEditUsername] = useState('');
  const [editBio, setEditBio] = useState('');

  const handleEditProfileClick = () => {
    setEditUsername(displayName);
    setEditBio(displayBio);
    setIsEditingProfile(true);
  };

  const handleSaveProfile = () => {
    setIsEditingProfile(false);
    toast.success('Profile saved (display mode)');
  };

  const handleShareProfile = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: `${displayName}'s Profile`,
          text: `Check out my profile on SUSU Map!`,
          url: window.location.href,
        });
      } catch {
        // Share cancelled
      }
    } else {
      navigator.clipboard.writeText(window.location.href);
      toast.success('Profile link copied to clipboard!');
    }
  };

  return (
    <div className="profilePage" id="profile-page">
      <div className="profileScrollContainer">
        <div className="profileTopRow">
          <h1 className="profileHeading">Profile</h1>
          <button className="profileSettingsBtn" id="profile-settings">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
              <circle cx="12" cy="12" r="3" />
              <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06A1.65 1.65 0 0 0 4.68 15a1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06A1.65 1.65 0 0 0 9 4.68a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06A1.65 1.65 0 0 0 19.4 9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z" />
            </svg>
          </button>
        </div>

        {/* Display mode badge */}
        <div className="profileDemoBadge" style={{ textAlign: 'center', width: '100%', marginBottom: '16px' }}>
          Display mode -- read-only demo
        </div>

        {/* Avatar */}
        <div className="profileAvatarSection">
          <div className="profileAvatar">
            {displayName.split(' ').map((n: string) => n[0]).join('').toUpperCase()}
          </div>
          <h2 className="profileName">{displayName}</h2>
          <div className="profileEmail">{displayEmail}</div>
          <div className="profileSchool">{displaySchool}</div>
        </div>

        {/* Action buttons */}
        <div className="profileActions">
          <button className="profileActionBtn primary" id="edit-profile" onClick={handleEditProfileClick}>Edit profile</button>
          <button className="profileActionBtn secondary" id="share-profile" onClick={handleShareProfile}>Share profile</button>
        </div>

        {/* Edit Profile Modal */}
        {isEditingProfile && (
          <div className="postOverlay" style={{ zIndex: 1000 }} id="edit-profile-modal">
            <div className="postBackdrop" onClick={() => setIsEditingProfile(false)} />
            <div className="postSheet" style={{ padding: '24px' }}>
              <div className="postHeader">
                <h2 className="postHeaderTitle">Edit Profile</h2>
                <button className="postCloseBtn" onClick={() => setIsEditingProfile(false)}>
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
                    <line x1="18" y1="6" x2="6" y2="18" />
                    <line x1="6" y1="6" x2="18" y2="18" />
                  </svg>
                </button>
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '16px', marginTop: '16px', width: '100%' }}>
                <div className="profileAvatar" style={{ width: '80px', height: '80px' }}>
                  {displayName.split(' ').map((n: string) => n[0]).join('').toUpperCase()}
                </div>

                <div style={{ width: '100%', textAlign: 'left', marginTop: '12px' }}>
                  <label className="postLabel">Username</label>
                  <input
                    type="text"
                    className="postInput"
                    value={editUsername}
                    onChange={(e) => setEditUsername(e.target.value)}
                    placeholder="Username"
                  />
                </div>

                <div style={{ width: '100%', textAlign: 'left' }}>
                  <label className="postLabel">Bio</label>
                  <textarea
                    className="postInput postTextarea"
                    value={editBio}
                    onChange={(e) => setEditBio(e.target.value)}
                    placeholder="Bio"
                    style={{ minHeight: '80px' }}
                  />
                </div>

                <div style={{ display: 'flex', gap: '8px', width: '100%', marginTop: '12px' }}>
                  <button className="postSubmit" onClick={handleSaveProfile}>
                    Save Profile
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Stats */}
        <div className="profileStats">
          {stats.map((stat, i) => (
            <div key={i} className="profileStatCard">
              <div className="profileStatValue">
                {stat.isStar && <span className="profileStatStar">*</span>}
                {stat.value}
              </div>
              <div className="profileStatLabel">{stat.label}</div>
            </div>
          ))}
        </div>

        {/* Bio */}
        {!isEditingProfile && (
          <div className="profileSection">
            <h3 className="profileSectionTitle">About</h3>
            <p className="profileBio">{displayBio}</p>
          </div>
        )}

        {/* School verification */}
        <div className="profileSection">
          <h3 className="profileSectionTitle">School Verification</h3>
          <div className="profileVerifyCard" style={{ background: '#ecfdf5', borderColor: '#a7f3d0' }}>
            <div className="verifyIcon" style={{ background: '#d1fae5' }}>
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#10b981" strokeWidth="2" strokeLinecap="round">
                <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path>
                <polyline points="22 4 12 14.01 9 11.01"></polyline>
              </svg>
            </div>
            <div className="verifyInfo">
              <div className="verifyTitle" style={{ color: '#065f46' }}>Verified Student</div>
              <div className="verifyDesc" style={{ color: '#047857' }}>
                Your school email is verified. You have access to campus-specific features.
              </div>
            </div>
          </div>
        </div>

        {/* Community credit */}
        <div className="profileSection">
          <h3 className="profileSectionTitle">Community Credit</h3>
          <div className="creditCard">
            <div className="creditScore">
              <div className="creditScoreValue">142</div>
              <div className="creditScoreLabel">points</div>
            </div>
            <div className="creditDesc">
              Earn credit by sharing items, posting accurate updates, and reporting lines. Use credit for priority access to popular events and items.
            </div>
            <div className="creditActions">
              <div className="creditAction">
                <span className="creditActionLabel">Share an item</span>
                <span className="creditActionPoints">+10 pts</span>
              </div>
              <div className="creditAction">
                <span className="creditActionLabel">Post a story</span>
                <span className="creditActionPoints">+5 pts</span>
              </div>
              <div className="creditAction">
                <span className="creditActionLabel">Verify a status</span>
                <span className="creditActionPoints">+3 pts</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
