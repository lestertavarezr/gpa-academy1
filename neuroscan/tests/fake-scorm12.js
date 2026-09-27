// SCORM 1.2 runtime API double with the rules an LMS like Moodle enforces: initialize-once,
// CMIString4096 for suspend_data, read-only review mode, vocabularies and error codes.
// Runs in Node (unit tests) and in the browser (the e2e fake Moodle host page).
export function createFakeScorm12({ record = {}, mode = "normal", onCommit = () => {} } = {}) {
  const data = {
    "cmi.core.student_id": "42",
    "cmi.core.student_name": "Estudiante, Prueba",
    "cmi.core.lesson_status": "not attempted",
    "cmi.suspend_data": "",
    ...record,
    "cmi.core.entry": record["cmi.suspend_data"] ? "resume" : "ab-initio",
    "cmi.core.lesson_mode": mode,
  };
  const STATUS = ["passed", "completed", "failed", "incomplete", "browsed", "not attempted"];
  const WRITABLE = {
    "cmi.suspend_data": (v) => v.length <= 4096,
    "cmi.core.lesson_status": (v) => STATUS.includes(v) && v !== "not attempted",
    "cmi.core.score.raw": (v) => v === "" || (/^\d+(\.\d+)?$/.test(v) && Number(v) <= 100),
    "cmi.core.score.min": (v) => /^\d+(\.\d+)?$/.test(v),
    "cmi.core.score.max": (v) => /^\d+(\.\d+)?$/.test(v),
    "cmi.core.exit": (v) => ["", "time-out", "suspend", "logout"].includes(v),
    "cmi.core.session_time": (v) => /^\d{2,4}:\d{2}:\d{2}(\.\d{1,2})?$/.test(v),
  };
  let state = "new";
  let lastError = "0";
  const api = {
    calls: [],
    commits: 0,
    data,
    LMSInitialize(arg) {
      api.calls.push(["LMSInitialize", arg]);
      if (state === "running") return ((lastError = "101"), "false");
      state = "running";
      return ((lastError = "0"), "true");
    },
    LMSFinish(arg) {
      api.calls.push(["LMSFinish", arg]);
      if (state !== "running") return ((lastError = "301"), "false");
      onCommit({ ...data });
      state = "finished";
      return ((lastError = "0"), "true");
    },
    LMSGetValue(element) {
      api.calls.push(["LMSGetValue", element]);
      if (state !== "running") return ((lastError = "301"), "");
      if (!(element in data)) return ((lastError = "401"), "");
      lastError = "0";
      return data[element];
    },
    LMSSetValue(element, value) {
      api.calls.push(["LMSSetValue", element, value]);
      if (state !== "running") return ((lastError = "301"), "false");
      if (mode !== "normal") return ((lastError = "403"), "false");
      const valid = WRITABLE[element];
      if (!valid) return ((lastError = element in data ? "403" : "401"), "false");
      if (typeof value !== "string" || !valid(value)) return ((lastError = "405"), "false");
      data[element] = value;
      return ((lastError = "0"), "true");
    },
    LMSCommit(arg) {
      api.calls.push(["LMSCommit", arg]);
      if (state !== "running") return ((lastError = "301"), "false");
      api.commits += 1;
      onCommit({ ...data });
      return ((lastError = "0"), "true");
    },
    LMSGetLastError: () => lastError,
    LMSGetErrorString: (code) => ({ 0: "No error", 101: "General exception", 301: "Not initialized", 401: "Not implemented", 403: "Read only", 405: "Incorrect data type" })[code] || "",
    LMSGetDiagnostic: (code) => api.LMSGetErrorString(code || lastError),
  };
  return api;
}
