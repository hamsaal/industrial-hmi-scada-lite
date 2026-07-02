const defaultApiBaseUrl = "http://localhost:5078";
const requestTimeoutMs = 1200;

export async function loadDashboardSnapshot(apiBaseUrl = defaultApiBaseUrl) {
  const snapshot = await readJson(`${apiBaseUrl}/api/dashboard/snapshot`);

  return toDashboardSnapshot(snapshot, "api");
}

export function subscribeDashboardSnapshots({
  onSnapshot,
  onError,
  apiBaseUrl = defaultApiBaseUrl
}) {
  const events = new EventSource(`${apiBaseUrl}/api/dashboard/stream`);

  events.addEventListener("snapshot", (event) => {
    onSnapshot(toDashboardSnapshot(JSON.parse(event.data), "stream"));
  });

  events.addEventListener("error", () => {
    onError?.();
  });

  return () => events.close();
}

export async function acknowledgeAlarms(alarmIds, apiBaseUrl = defaultApiBaseUrl) {
  return await writeJson(`${apiBaseUrl}/api/alarms/acknowledge`, {
    alarmIds,
    operatorName: "demo-operator"
  });
}

async function readJson(url) {
  return await sendJson(url, {
    method: "GET",
    headers: { Accept: "application/json" }
  });
}

async function writeJson(url, body) {
  return await sendJson(url, {
    method: "POST",
    headers: {
      Accept: "application/json",
      "Content-Type": "application/json"
    },
    body: JSON.stringify(body)
  });
}

async function sendJson(url, init) {
  const controller = new AbortController();
  const timeout = window.setTimeout(() => controller.abort(), requestTimeoutMs);

  try {
    const response = await fetch(url, {
      ...init,
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

function toDashboardSnapshot(snapshot, source) {
  return {
    source,
    summary: snapshot.summary,
    readings: snapshot.readings,
    alarms: snapshot.alarms,
    capturedAt: snapshot.capturedAt
  };
}
