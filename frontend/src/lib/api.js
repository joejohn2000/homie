const API_BASE = import.meta.env.VITE_API_BASE ?? '';

async function request(path, options = {}) {
  const response = await fetch(`${API_BASE}${path}`, {
    headers: {
      'Content-Type': 'application/json',
      ...(options.headers ?? {})
    },
    ...options
  });

  const payload = await response.json().catch(() => ({}));
  if (!response.ok) {
    const detail = payload.error
      ?? payload.detail
      ?? payload.credentials?.[0]
      ?? Object.entries(payload)
        .map(([field, messages]) => `${field}: ${Array.isArray(messages) ? messages.join(', ') : messages}`)
        .join(' ');
    throw new Error(detail || 'Request failed');
  }

  return payload;
}

export const api = {
  health() {
    return request('/api/health/');
  },
  onboard(profile) {
    return request('/api/onboarding/', {
      method: 'POST',
      body: JSON.stringify(profile)
    });
  },
  login(credentials) {
    return request('/api/login/', {
      method: 'POST',
      body: JSON.stringify(credentials)
    });
  },
  discover(userId) {
    return request(`/api/discover/?userId=${encodeURIComponent(userId)}`);
  },
  swipe(payload) {
    return request('/api/swipe/', {
      method: 'POST',
      body: JSON.stringify(payload)
    });
  },
  matches(userId) {
    return request(`/api/matches/?userId=${encodeURIComponent(userId)}`);
  },
  profile(userId) {
    return request(`/api/profile/?userId=${encodeURIComponent(userId)}`);
  },
  updateProfile(payload) {
    return request('/api/profile/', {
      method: 'PATCH',
      body: JSON.stringify(payload)
    });
  },
  sendMessage(payload) {
    return request('/api/messages/', {
      method: 'POST',
      body: JSON.stringify(payload)
    });
  },
  createViewingRequest(payload) {
    return request('/api/viewing-requests/', {
      method: 'POST',
      body: JSON.stringify(payload)
    });
  },
  users(role) {
    const query = role ? `?role=${encodeURIComponent(role)}` : '';
    return request(`/api/users/${query}`);
  },
  createListing(payload) {
    return request('/api/listings/', {
      method: 'POST',
      body: JSON.stringify(payload)
    });
  }
};
