const API_BASE = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001/api/v1';

export async function getDistricts() {
  const res = await fetch(`${API_BASE}/districts`, { cache: 'no-store' });
  if (!res.ok) throw new Error('Failed to fetch districts');
  const data = await res.json();
  return data.districts || data; // Handle both response formats
}

export async function getDistrictData(code: string, month?: number) {
  const url = month 
    ? `${API_BASE}/districts/${code}/summary?month=${month}`
    : `${API_BASE}/districts/${code}/summary`;
  
  const res = await fetch(url, { cache: 'no-store' });
  if (!res.ok) throw new Error('Failed to fetch district data');
  return res.json();
}

export async function getDistrictTrend(code: string) {
  const res = await fetch(`${API_BASE}/districts/${code}/trend`, { cache: 'no-store' });
  if (!res.ok) throw new Error('Failed to fetch trend');
  const data = await res.json();
  return data.trend || data; // Handle both response formats
}

export async function getRankings() {
  const res = await fetch(`${API_BASE}/rankings`, { cache: 'no-store' });
  if (!res.ok) throw new Error('Failed to fetch rankings');
  const data = await res.json();
  return data.rankings || data; // Handle both response formats
}
