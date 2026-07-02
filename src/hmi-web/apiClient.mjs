const defaultApiBaseUrl = "http://localhost:5078";
const requestTimeoutMs = 1200;

export async function loadDashboardSnapshot(apiBaseUrl = defaultApiBaseUrl) {
  const snapshot = await readJson(`${apiBaseUrl}/api/dashboard/snapshot`);

  return {
    source: "api",
    summary: snapshot.summary,
    readings: snapshot.readings,
    alarms: snapshot.alarms,
    capturedAt: snapshot.capturedAt
  };
}

async function readJson(url) {
  const controller = new AbortController();
  const timeout = window.setTimeout(() => controller.abort(), requestTimeoutMs);

  try {
    const response = await fetch(url, {
      headers: { Accept: "application/json" },
      signal: controller.signal
    });

    if (!response.ok) {
      throw new Error(`GET ${url} returned ${response.status}`);
    }

    return await response.json();
  } finally {
    window.clearTimeout(timeout);
  }
}
