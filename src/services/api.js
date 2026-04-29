const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000';

export async function fetchAPI(endpoint, options = {}) {
  const url = `${API_BASE_URL}${endpoint}`;
  
  const config = {
    headers: {
      'Content-Type': 'application/json',
      ...options.headers,
    },
    ...options,
  };

  const response = await fetch(url, config);

  if (!response.ok) {
    const error = await response.json().catch(() => ({ detail: 'Request failed' }));
    throw new Error(error.detail || `HTTP ${response.status}`);
  }

  if (response.status === 204) {
    return null;
  }

  return response.json();
}

export const itemsAPI = {
  getAll: (params = {}) => {
    const query = new URLSearchParams();
    if (params.skip) query.set('skip', params.skip);
    if (params.limit) query.set('limit', params.limit);
    if (params.learned !== undefined) query.set('learned', params.learned);
    if (params.difficulty) query.set('difficulty', params.difficulty);
    
    const queryString = query.toString();
    return fetchAPI(`/api/items/${queryString ? '?' + queryString : ''}`);
  },

  getCount: () => fetchAPI('/api/items/count'),

  getById: (id) => fetchAPI(`/api/items/${id}`),

  create: (data) => fetchAPI('/api/items/', {
    method: 'POST',
    body: JSON.stringify(data),
  }),

  update: (id, data) => fetchAPI(`/api/items/${id}`, {
    method: 'PUT',
    body: JSON.stringify(data),
  }),

  delete: (id) => fetchAPI(`/api/items/${id}`, {
    method: 'DELETE',
  }),

  bulkDelete: (ids) => fetchAPI('/api/items/bulk-delete', {
    method: 'POST',
    body: JSON.stringify(ids),
  }),

  import: (text) => fetchAPI('/api/items/import', {
    method: 'POST',
    body: JSON.stringify({ text }),
  }),

  initDefault: () => fetchAPI('/api/items/init-default', {
    method: 'POST',
  }),
};

export const settingsAPI = {
  getAll: () => fetchAPI('/api/settings/'),

  get: (key) => fetchAPI(`/api/settings/${key}`),

  update: (key, value) => fetchAPI(`/api/settings/${key}`, {
    method: 'PUT',
    body: JSON.stringify({ value }),
  }),

  delete: (key) => fetchAPI(`/api/settings/${key}`, {
    method: 'DELETE',
  }),

  deleteAll: () => fetchAPI('/api/settings/all', {
    method: 'DELETE',
  }),
};

export const wrongNotesAPI = {
  getAll: () => fetchAPI('/api/wrong-notes/'),

  check: (itemId) => fetchAPI(`/api/wrong-notes/check/${itemId}`),

  add: (itemId) => fetchAPI(`/api/wrong-notes/${itemId}`, {
    method: 'POST',
  }),

  remove: (itemId) => fetchAPI(`/api/wrong-notes/${itemId}`, {
    method: 'DELETE',
  }),

  clear: () => fetchAPI('/api/wrong-notes/all', {
    method: 'DELETE',
  }),
};

export const dailyStatsAPI = {
  getToday: () => fetchAPI('/api/daily-stats/today'),

  getByDate: (date) => fetchAPI(`/api/daily-stats/${date}`),

  update: (isCorrect) => fetchAPI(`/api/daily-stats/update?is_correct=${isCorrect}`, {
    method: 'PUT',
  }),

  getAll: () => fetchAPI('/api/daily-stats/'),
};

export const databaseAPI = {
  export: () => fetchAPI('/api/database/export'),

  import: (data) => fetchAPI('/api/database/import', {
    method: 'POST',
    body: JSON.stringify(data),
  }),
};

export default {
  items: itemsAPI,
  settings: settingsAPI,
  wrongNotes: wrongNotesAPI,
  dailyStats: dailyStatsAPI,
  database: databaseAPI,
};
