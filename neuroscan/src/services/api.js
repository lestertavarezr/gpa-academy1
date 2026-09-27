export class ApiError extends Error {
  constructor(status, body) {
    super(body?.error || `HTTP ${status}`);
    this.status = status;
    this.body = body;
  }
}

export function createApi({ base, getToken, fetchImpl = (...args) => globalThis.fetch(...args) }) {
  async function request(method, path, body) {
    const headers = { Accept: "application/json" };
    const token = getToken();
    if (token) headers.Authorization = `Bearer ${token}`;
    if (body !== undefined) headers["Content-Type"] = "application/json";
    const response = await fetchImpl(base + path, {
      method,
      headers,
      body: body === undefined ? undefined : JSON.stringify(body),
      credentials: "omit",
    });
    const data = response.status === 204 ? null : await response.json().catch(() => null);
    if (!response.ok) throw new ApiError(response.status, data);
    return data;
  }
  return {
    createAccount: () => request("POST", "/accounts"),
    deleteAccount: () => request("DELETE", "/account"),
    getProgress: () => request("GET", "/progress"),
    putProgress: (baseRev, state) => request("PUT", "/progress", { baseRev, state }),
    postEvents: (events) => request("POST", "/events", { events }),
    createPairingCode: () => request("POST", "/pairing"),
    claimPairingCode: (code) => request("POST", "/pairing/claim", { code }),
    getPushKey: () => request("GET", "/push/public-key"),
    putPushSubscription: (subscription, prefs) => request("PUT", "/push/subscription", { subscription, ...prefs }),
    deletePushSubscription: (endpoint) => request("DELETE", "/push/subscription", { endpoint }),
  };
}
