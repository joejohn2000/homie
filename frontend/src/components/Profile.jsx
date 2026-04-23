import React, { useState } from 'react';
import { BadgeCheck, Briefcase, Camera, Edit3, MapPin, Save, Sparkles, Wallet, X } from 'lucide-react';

function parseBudgetRange(value = '') {
  const matches = value.match(/\d[\d,]*/g) ?? [];
  return {
    budgetMin: matches[0] ? Number(matches[0].replaceAll(',', '')) : 1000,
    budgetMax: matches[1] ? Number(matches[1].replaceAll(',', '')) : 1500
  };
}

function tagsToInput(tags = []) {
  return tags.join(', ');
}

function inputToTags(value) {
  return value
    .split(',')
    .map((item) => item.trim().toLowerCase().replace(/\s+/g, '-'))
    .filter(Boolean);
}

function locationsToInput(locations = []) {
  return locations.join(', ');
}

function inputToLocations(value) {
  return value
    .split(',')
    .map((item) => item.trim())
    .filter(Boolean);
}

function readImageFile(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result);
    reader.onerror = () => reject(new Error('Could not read image file.'));
    reader.readAsDataURL(file);
  });
}

export function Profile({ profile, onSaveProfile, isSaving }) {
  const [isEditing, setIsEditing] = useState(false);
  const [form, setForm] = useState(null);
  const [status, setStatus] = useState('');
  const [imageError, setImageError] = useState('');

  const buildProfileForm = () => {
    const budget = parseBudgetRange(profile.budgetRange);
    return {
      name: profile.name,
      job: profile.job,
      location: profile.location,
      bio: profile.bio,
      avatar: profile.avatar,
      budgetMin: budget.budgetMin,
      budgetMax: budget.budgetMax,
      habits: tagsToInput(profile.habits),
      preferredLocations: locationsToInput(profile.preferredLocations)
    };
  };

  if (!profile) {
    return (
      <div className="profile-container fade-in">
        <div className="profile-card">
          <h1 className="font-serif text-4xl">Profile</h1>
          <p className="font-bold text-[var(--text-secondary)]">We could not load your profile yet.</p>
        </div>
        <style>{profileStyles}</style>
      </div>
    );
  }

  const editForm = form ?? buildProfileForm();

  const updateForm = (field, value) => {
    setForm((current) => ({
      ...current,
      [field]: value
    }));
  };

  const handlePhotoUpload = async (event) => {
    const file = event.target.files?.[0];
    if (!file) {
      return;
    }

    if (!file.type.startsWith('image/')) {
      setImageError('Upload an image file.');
      return;
    }

    if (file.size > 1_500_000) {
      setImageError('Use an image smaller than 1.5 MB.');
      return;
    }

    try {
      const dataUrl = await readImageFile(file);
      updateForm('avatar', dataUrl);
      setImageError('');
    } catch (error) {
      setImageError(error.message);
    }
  };

  const handleSave = async (event) => {
    event.preventDefault();
    setStatus('');

    try {
      await onSaveProfile({
        name: editForm.name,
        job: editForm.job,
        location: editForm.location,
        bio: editForm.bio,
        avatar: editForm.avatar,
        budgetMin: Number(editForm.budgetMin),
        budgetMax: Number(editForm.budgetMax),
        habits: inputToTags(editForm.habits),
        preferredLocations: inputToLocations(editForm.preferredLocations)
      });
      setIsEditing(false);
      setForm(null);
      setStatus('Profile saved successfully.');
    } catch {
      setStatus('');
    }
  };

  const handleCancel = () => {
    setForm(null);
    setIsEditing(false);
  };

  return (
    <div className="profile-container fade-in">
      <div className="profile-card stagger-2">
        <div className="profile-header">
          <img src={profile.avatar} alt={profile.name} className="profile-avatar" />
          <div>
            <div className="profile-title-row">
              <h1>{profile.name}</h1>
              <span className={`status-pill ${profile.verificationStatus}`}>
                <BadgeCheck size={16} strokeWidth={2.5} />
                {profile.verificationStatus}
              </span>
            </div>
            <p className="profile-role">{profile.role === 'host' ? 'Host (Offering a room)' : 'Seeker (Looking for a room)'}</p>
          </div>
          <button
            className="edit-button"
            type="button"
            onClick={() => {
              setForm(buildProfileForm());
              setIsEditing(true);
              setStatus('');
            }}
          >
            <Edit3 size={18} strokeWidth={2.5} />
            <span className="hidden sm:inline">Edit</span>
          </button>
        </div>

        {status && <div className="status-banner scale-in">{status}</div>}

        {!isEditing ? (
          <>
            <p className="profile-bio">{profile.bio}</p>

            <div className="profile-grid">
              <div className="detail-row">
                <Briefcase size={20} strokeWidth={2.5} className="text-[var(--primary)]" />
                <span>{profile.job}</span>
              </div>
              <div className="detail-row">
                <MapPin size={20} strokeWidth={2.5} className="text-[var(--primary)]" />
                <span>{profile.location}</span>
              </div>
              <div className="detail-row">
                <Wallet size={20} strokeWidth={2.5} className="text-[var(--primary)]" />
                <span>{profile.budgetRange}</span>
              </div>
              <div className="detail-row">
                <Sparkles size={20} strokeWidth={2.5} className="text-[var(--primary)]" />
                <span>{profile.preferredLocations.join(', ')}</span>
              </div>
            </div>

            <section className="profile-section">
              <h3>Living Style Tags</h3>
              <div className="tag-list">
                {profile.habits.map((habit) => (
                  <span key={habit} className="tag">{habit.replace('-', ' ')}</span>
                ))}
              </div>
            </section>
          </>
        ) : (
          <form className="profile-form fade-in" onSubmit={handleSave}>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              <label>
                Full Name
                <input value={editForm.name} onChange={(event) => updateForm('name', event.target.value)} />
              </label>
              <label>
                Job / Occupation
                <input value={editForm.job} onChange={(event) => updateForm('job', event.target.value)} />
              </label>
            </div>
            
            <label>
              Current Location
              <input value={editForm.location} onChange={(event) => updateForm('location', event.target.value)} />
            </label>
            
            <label>
              Profile Photo
              <span className="upload-row group">
                <img src={editForm.avatar} alt="Profile preview" className="group-hover:scale-105 transition-transform" />
                <span className="group-hover:text-[var(--primary)] transition-colors">
                  <Camera size={20} strokeWidth={2.5} />
                  Change photo
                </span>
                <input type="file" accept="image/*" onChange={handlePhotoUpload} />
              </span>
              {imageError && <small className="photo-error">{imageError}</small>}
              <small>Use a clear image under 1.5 MB.</small>
            </label>
            
            <label>
              Bio
              <textarea value={editForm.bio} onChange={(event) => updateForm('bio', event.target.value)} rows={5} placeholder="Tell potential matches a bit about yourself..." />
            </label>
            
            <div className="form-pair">
              <label>
                Budget Min ($)
                <input
                  type="number"
                  min="0"
                  value={editForm.budgetMin}
                  onChange={(event) => updateForm('budgetMin', event.target.value)}
                />
              </label>
              <label>
                Budget Max ($)
                <input
                  type="number"
                  min="0"
                  value={editForm.budgetMax}
                  onChange={(event) => updateForm('budgetMax', event.target.value)}
                />
              </label>
            </div>
            
            <label>
              Living Style Tags
              <input value={editForm.habits} onChange={(event) => updateForm('habits', event.target.value)} />
              <small>Comma separated: clean, quiet, early-riser</small>
            </label>
            
            <label>
              Preferred Areas
              <input
                value={editForm.preferredLocations}
                onChange={(event) => updateForm('preferredLocations', event.target.value)}
              />
              <small>Comma separated: Brooklyn, Soho, Queens</small>
            </label>
            
            <div className="profile-actions">
              <button className="save-button" type="submit" disabled={isSaving}>
                <Save size={18} strokeWidth={2.5} />
                {isSaving ? 'Saving...' : 'Save Changes'}
              </button>
              <button className="cancel-button" type="button" onClick={handleCancel} disabled={isSaving}>
                <X size={18} strokeWidth={2.5} />
                Cancel
              </button>
            </div>
          </form>
        )}
      </div>

      <style>{profileStyles}</style>
    </div>
  );
}

const profileStyles = `
  .profile-container {
    width: 100%;
    padding-bottom: 2rem;
  }
  .profile-card {
    padding: 2.5rem;
    display: flex;
    flex-direction: column;
    gap: 2rem;
    border: 2px solid var(--border-dark);
    border-radius: 24px;
    background: var(--bg-card);
    box-shadow: 8px 8px 0px var(--border-dark);
  }
  .profile-header {
    display: grid;
    grid-template-columns: 100px minmax(0, 1fr) auto;
    align-items: start;
    gap: 1.5rem;
  }
  .profile-avatar {
    width: 100px;
    height: 100px;
    border-radius: 16px;
    object-fit: cover;
    border: 2px solid var(--border-dark);
    box-shadow: 4px 4px 0px var(--border-dark);
  }
  .profile-title-row {
    display: flex;
    align-items: center;
    gap: 1rem;
    flex-wrap: wrap;
    margin-bottom: 0.5rem;
  }
  .profile-title-row h1 {
    font-family: 'Instrument Serif', serif;
    font-size: 3rem;
    font-weight: 400;
    line-height: 1;
    color: var(--text-primary);
    overflow-wrap: anywhere;
  }
  .profile-role {
    font-weight: 700;
    text-transform: uppercase;
    letter-spacing: 0.05em;
    font-size: 0.85rem;
    color: var(--text-secondary);
  }
  .profile-bio {
    font-size: 1.2rem;
    line-height: 1.6;
    color: var(--text-primary);
    font-weight: 500;
  }
  .profile-form small {
    color: var(--text-secondary);
    font-size: 0.8rem;
    font-weight: 600;
  }
  .profile-grid {
    display: grid;
    grid-template-columns: repeat(2, minmax(0, 1fr));
    gap: 1rem;
  }
  .detail-row {
    min-height: 64px;
    display: flex;
    align-items: center;
    gap: 1rem;
    color: var(--text-primary);
    border: 2px solid var(--border-light);
    border-radius: 16px;
    padding: 1rem 1.25rem;
    font-weight: 600;
    font-size: 1.05rem;
    background: white;
  }
  .detail-row span {
    overflow-wrap: anywhere;
  }
  .profile-section,
  .profile-form {
    display: flex;
    flex-direction: column;
    gap: 1.5rem;
  }
  .profile-section h3 {
    font-size: 1rem;
    font-weight: 800;
    text-transform: uppercase;
    letter-spacing: 0.05em;
    color: var(--text-secondary);
    margin-bottom: -0.5rem;
  }
  .tag-list {
    display: flex;
    flex-wrap: wrap;
    gap: 0.5rem;
  }
  .tag {
    padding: 0.4rem 1rem;
    border-radius: 999px;
    border: 2px solid var(--border-dark);
    background: var(--bg-subtle);
    color: var(--text-primary);
    font-size: 0.8rem;
    font-weight: 800;
    text-transform: uppercase;
    letter-spacing: 0.05em;
    box-shadow: 2px 2px 0px var(--border-dark);
  }
  .status-pill {
    display: inline-flex;
    align-items: center;
    gap: 0.4rem;
    padding: 0.4rem 0.8rem;
    font-size: 0.75rem;
    font-weight: 800;
    text-transform: uppercase;
    letter-spacing: 0.05em;
    border-radius: 999px;
    border: 2px solid var(--border-dark);
    box-shadow: 2px 2px 0px var(--border-dark);
  }
  .status-pill.verified {
    background: #4ade80;
    color: var(--border-dark);
  }
  .status-pill.pending {
    background: #fcd34d;
    color: var(--border-dark);
  }
  .edit-button,
  .save-button,
  .cancel-button {
    min-height: 48px;
    border-radius: 12px;
    border: 2px solid var(--border-dark);
    display: inline-flex;
    align-items: center;
    justify-content: center;
    gap: 0.5rem;
    cursor: pointer;
    font-weight: 800;
    text-transform: uppercase;
    letter-spacing: 0.05em;
    font-size: 0.85rem;
    transition: transform 0.2s, box-shadow 0.2s;
    box-shadow: 4px 4px 0px var(--border-dark);
    padding: 0 1.5rem;
  }
  .edit-button,
  .cancel-button {
    background: white;
    color: var(--text-primary);
  }
  .save-button {
    background: var(--primary);
    color: white;
  }
  .edit-button:hover,
  .save-button:hover,
  .cancel-button:hover {
    transform: translateY(-2px);
    box-shadow: 6px 6px 0px var(--border-dark);
  }
  .edit-button:active,
  .save-button:active,
  .cancel-button:active {
    transform: translateY(2px);
    box-shadow: 0px 0px 0px var(--border-dark);
  }
  .edit-button:disabled,
  .save-button:disabled,
  .cancel-button:disabled {
    opacity: 0.55;
    cursor: not-allowed;
    transform: none;
    box-shadow: none;
  }
  .status-banner {
    padding: 1rem 1.5rem;
    border-radius: 12px;
    font-weight: 800;
    font-size: 0.85rem;
    text-transform: uppercase;
    letter-spacing: 0.05em;
    border: 2px solid var(--border-dark);
    box-shadow: 4px 4px 0px var(--border-dark);
    background: #4ade80;
    color: var(--border-dark);
  }
  .profile-form label {
    display: flex;
    flex-direction: column;
    gap: 0.5rem;
    color: var(--text-primary);
    font-weight: 800;
    font-size: 0.95rem;
  }
  .profile-form input,
  .profile-form textarea {
    width: 100%;
    min-height: 54px;
    border: 2px solid var(--border-light);
    border-radius: 12px;
    background: white;
    color: var(--text-primary);
    padding: 1rem;
    outline: none;
    font: inherit;
    font-weight: 500;
    transition: border-color 0.2s;
  }
  .upload-row {
    position: relative;
    min-height: 100px;
    display: grid;
    grid-template-columns: 84px minmax(0, 1fr);
    align-items: center;
    gap: 1.25rem;
    border: 2px dashed var(--border-light);
    border-radius: 16px;
    padding: 0.75rem;
    cursor: pointer;
    background: var(--bg-subtle);
    transition: border-color 0.2s;
  }
  .upload-row:hover {
    border-color: var(--primary);
  }
  .upload-row img {
    width: 84px;
    height: 84px;
    object-fit: cover;
    border-radius: 12px;
    border: 2px solid var(--border-dark);
  }
  .upload-row span {
    display: inline-flex;
    align-items: center;
    gap: 0.5rem;
    color: var(--text-secondary);
    font-weight: 800;
    text-transform: uppercase;
    letter-spacing: 0.05em;
    font-size: 0.85rem;
  }
  .upload-row input {
    position: absolute;
    inset: 0;
    opacity: 0;
    cursor: pointer;
  }
  .photo-error {
    color: #f43f5e;
  }
  .profile-form textarea {
    resize: vertical;
  }
  .profile-form input:focus,
  .profile-form textarea:focus {
    border-color: var(--primary);
  }
  .form-pair,
  .profile-actions {
    display: grid;
    grid-template-columns: repeat(2, minmax(0, 1fr));
    gap: 1rem;
  }
  @media (max-width: 640px) {
    .profile-card {
      padding: 1.5rem;
    }
    .profile-header {
      grid-template-columns: 84px minmax(0, 1fr);
    }
    .profile-avatar {
      width: 84px;
      height: 84px;
    }
    .edit-button {
      grid-column: 1 / -1;
      width: 100%;
    }
    .profile-grid,
    .form-pair,
    .profile-actions {
      grid-template-columns: 1fr;
    }
    .profile-title-row h1 {
      font-size: 2.2rem;
    }
  }
`;
