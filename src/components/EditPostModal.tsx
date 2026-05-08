import { useState, useEffect, useRef } from 'react';
import { useAppSelector } from '../store/store';
import type { LayerType, FreeCategory, CommunityPost } from '../types';
import { AccessScopeSelector } from './AccessScopeSelector';
import type { AccessScope } from './AccessScopeSelector';
import './EditPostModal.css';

interface EditPostModalProps {
  post: CommunityPost;
  onClose: () => void;
}

type PostType = 'free' | 'event' | 'sell' | 'hangout' | null;

function mapLayerToPostType(layer: LayerType): PostType {
  if (layer === 'event') return 'event';
  if (layer === 'marketplace') return 'sell';
  if (layer === 'hangout') return 'hangout';
  return 'free';
}



export function EditPostModal({ post, onClose }: EditPostModalProps) {
  const [selectedType] = useState<PostType>(mapLayerToPostType(post.layer));
  const [title, setTitle] = useState(post.title || '');
  const [description, setDescription] = useState(post.description || '');
  const [location, setLocation] = useState(post.location || '');
  const [price, setPrice] = useState(post.price?.toString() || '');
  const [category, setCategory] = useState<string>(post.category || '');
  const [accessScope, setAccessScope] = useState<AccessScope>((post.accessScope as AccessScope) || 'public');
  const [hangoutActivity, setHangoutActivity] = useState(post.hangoutActivity || '');
  const [hangoutMaxJoiners, setHangoutMaxJoiners] = useState(post.hangoutMaxJoiners?.toString() || '5');
  const [startTime, setStartTime] = useState(post.eventStartTime ? new Date(post.eventStartTime).toISOString().slice(0, 16) : '');
  const [_userLocation] = useState<{ lat: number; lng: number } | null>({ lat: post.latitude, lng: post.longitude });
  
  const [_selectedFile, setSelectedFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(post.imageUrl || null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [isLoading, setIsLoading] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [isError] = useState(false);
  
  const { user } = useAppSelector(state => state.auth);

  // Auto-close on success
  useEffect(() => {
    if (isSuccess) {
      const timer = setTimeout(() => onClose(), 1200);
      return () => clearTimeout(timer);
    }
  }, [isSuccess, onClose]);

  const handleSubmit = () => {
    if (!selectedType || !title.trim()) return;
    setIsLoading(true);
    setTimeout(() => {
      setIsLoading(false);
      setIsSuccess(true);
    }, 500);
  };

  const categories: [FreeCategory, string][] = [
    ['food', 'Food'],
    ['furniture', 'Furniture'],
    ['books', 'Books'],
    ['art-supplies', 'Art Supplies'],
    ['clothing', 'Clothing'],
    ['other', 'Other'],
  ];

  return (
    <div className="editPostOverlay" id="edit-post-modal">
      <div className="editPostBackdrop" onClick={onClose} />
      <div className="editPostSheet">
        <div className="editPostHandle">
          <div className="editPostHandleBar" />
        </div>

        <div className="editPostHeader">
          <h2 className="editPostHeaderTitle">
            {isSuccess ? 'Updated!' : 'Edit Post'}
          </h2>
          <button className="editPostCloseBtn" onClick={onClose}>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
              <line x1="18" y1="6" x2="6" y2="18" />
              <line x1="6" y1="6" x2="18" y2="18" />
            </svg>
          </button>
        </div>

        {/* Success state */}
        {isSuccess && (
          <div className="editPostSuccessState">
            <div className="editPostSuccessIcon">
              <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="var(--color-primary)" strokeWidth="2" strokeLinecap="round">
                <polyline points="20 6 9 17 4 12" />
              </svg>
            </div>
            Your post has been updated!
          </div>
        )}

        {/* Form */}
        {!isSuccess && (
          <div className="editPostForm">
            {/* Photo upload */}
            <div className="editPostFormGroup">
              <label className="editPostLabel">Photo</label>
              <div 
                className={`editPhotoUpload ${previewUrl ? 'hasImage' : ''}`}
                id="photo-upload"
                onClick={() => fileInputRef.current?.click()}
                style={{ 
                  cursor: 'pointer',
                  backgroundImage: previewUrl ? `url(${previewUrl})` : 'none',
                  backgroundSize: 'cover',
                  backgroundPosition: 'center'
                }}
              >
                {!previewUrl && (
                  <>
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
                      <rect x="3" y="3" width="18" height="18" rx="2" ry="2" />
                      <circle cx="8.5" cy="8.5" r="1.5" />
                      <polyline points="21 15 16 10 5 21" />
                    </svg>
                    <span className="editPhotoUploadText">Tap to change photo</span>
                  </>
                )}
                <input 
                  type="file" 
                  ref={fileInputRef} 
                  style={{ display: 'none' }} 
                  accept="image/*"
                  onChange={(e) => {
                    const file = e.target.files?.[0];
                    if (file) {
                      setSelectedFile(file);
                      setPreviewUrl(URL.createObjectURL(file));
                    }
                  }}
                />
              </div>
            </div>

            {/* Title */}
            <div className="editPostFormGroup">
              <label className="editPostLabel">Title</label>
              <input
                className="editPostInput"
                placeholder="Title"
                type="text"
                id="post-title"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
              />
            </div>

            {/* Description */}
            <div className="editPostFormGroup">
              <label className="editPostLabel">Description</label>
              <textarea
                className="editPostInput editPostTextarea"
                placeholder="Tell people what you're sharing..."
                id="post-description"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
              />
            </div>

            {/* Location */}
            <div className="editPostFormGroup">
              <label className="editPostLabel">Location</label>
              <input
                className="editPostInput"
                placeholder="Building name or address..."
                type="text"
                id="post-location"
                value={location}
                onChange={(e) => setLocation(e.target.value)}
              />
            </div>

            {/* Price (marketplace only) */}
            {selectedType === 'sell' && (
              <div className="editPostFormGroup">
                <label className="editPostLabel">Price</label>
                <input
                  className="editPostInput"
                  placeholder="$0.00"
                  type="number"
                  id="post-price"
                  value={price}
                  onChange={(e) => setPrice(e.target.value)}
                />
              </div>
            )}

            {/* Category tags (free stuff) */}
            {selectedType === 'free' && (
              <div className="editPostFormGroup">
                <label className="editPostLabel">Category</label>
                <div className="editPostCategoryGrid">
                  {categories.map(([catId, catLabel]) => (
                    <button
                      key={catId}
                      className={`editPostCategoryPill ${category === catId ? 'selected' : ''}`}
                      onClick={() => setCategory(catId)}
                      type="button"
                    >
                      {catLabel}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Hangout & Event specific fields */}
            {(selectedType === 'hangout' || selectedType === 'event') && (
              <>
                {selectedType === 'hangout' && (
                  <>
                    <div className="editPostFormGroup">
                      <label className="editPostLabel">Activity</label>
                      <input
                        className="editPostInput"
                        placeholder="e.g., Walking, Studying, Coffee..."
                        type="text"
                        value={hangoutActivity}
                        onChange={(e) => setHangoutActivity(e.target.value)}
                      />
                    </div>
                    <div className="editPostFormGroup">
                      <label className="editPostLabel">Max people who can join</label>
                      <input
                        className="editPostInput"
                        type="number"
                        min="2"
                        max="20"
                        value={hangoutMaxJoiners}
                        onChange={(e) => setHangoutMaxJoiners(e.target.value)}
                      />
                    </div>
                  </>
                )}
                <div className="editPostFormGroup">
                  <label className="editPostLabel">Start time</label>
                  <input
                    className="editPostInput"
                    type="datetime-local"
                    value={startTime}
                    onChange={(e) => setStartTime(e.target.value)}
                  />
                </div>
              </>
            )}

            {/* Access Scope */}
            <AccessScopeSelector
              value={accessScope}
              onChange={setAccessScope}
              isSchoolVerified={!!(user?.schoolEmailVerified)}
            />

            {/* Error display */}
            {isError && (
              <div className="editPostErrorMsg">
                Could not update post (display mode).
              </div>
            )}

            {/* Submit */}
            <button
              className="editPostSubmit"
              id="edit-post-submit"
              onClick={handleSubmit}
              disabled={isLoading || !title.trim()}
              style={{ opacity: isLoading || !title.trim() ? 0.6 : 1 }}
            >
              {isLoading ? 'Saving...' : 'Save Changes'}
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
