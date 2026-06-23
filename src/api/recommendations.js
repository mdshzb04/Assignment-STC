const API_ORIGIN = import.meta.env.VITE_API_URL?.replace(/\/$/, '') ?? '';
const API_BASE = API_ORIGIN ? `${API_ORIGIN}/api` : '/api';

async function parseResponse(response) {
  const text = await response.text();
  try {
    return JSON.parse(text);
  } catch {
    throw new Error('Server returned an invalid response. Please try again.');
  }
}

export async function fetchProducts() {
  const response = await fetch(`${API_BASE}/products`);
  const data = await parseResponse(response);

  if (!response.ok) {
    throw new Error(data.error || 'Failed to load products');
  }

  return data;
}

export async function fetchRecommendations(preferences) {
  const response = await fetch(`${API_BASE}/recommend`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ preferences }),
  });

  const data = await parseResponse(response);

  if (!response.ok) {
    throw new Error(data.error || 'Failed to fetch recommendations');
  }

  return data;
}
