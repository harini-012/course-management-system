
/* =====================================================
   STUDENT COURSE MANAGEMENT SYSTEM
   API.JS - MONGODB BACKEND VERSION
   ===================================================== */

const API_URL = "https://course-management-system-backend-pbbz.onrender.com";
const SESSION_KEY = "courseManagementSession";
const TOKEN_KEY = "token";

// =====================================================
// AUTHENTICATION HEADERS
// =====================================================

function getAuthHeaders() {
  const token = sessionStorage.getItem(TOKEN_KEY);

  return {
    "Content-Type": "application/json",
    ...(token
      ? { Authorization: `Bearer ${token}` }
      : {})
  };
}

// =====================================================
// COMMON API REQUEST
// =====================================================

async function apiRequest(
  resource,
  {
    method = "GET",
    data,
    params
  } = {}
) {
  let url = `${API_URL}/${resource}`;

  if (params) {
    const query = new URLSearchParams();

    for (const [key, value] of Object.entries(params)) {
      if (
        value !== undefined &&
        value !== null &&
        value !== ""
      ) {
        query.append(key, String(value));
      }
    }

    const queryString = query.toString();

    if (queryString) {
      url += `?${queryString}`;
    }
  }

  const options = {
    method,
    headers: getAuthHeaders()
  };

  if (data !== undefined) {
    options.body = JSON.stringify(data);
  }

  let response;

  try {
    response = await fetch(url, options);
  } catch (error) {
    console.error("API connection error:", error);

    throw new Error(
      "Unable to connect to backend. Check that Express is running on port 3001."
    );
  }

  let result = null;

  if (response.status !== 204) {
    const contentType =
      response.headers.get("content-type") || "";

    if (contentType.includes("application/json")) {
      result = await response.json();
    } else {
      result = await response.text();
    }
  }

  if (!response.ok) {
    const message =
      result &&
      typeof result === "object" &&
      result.message
        ? result.message
        : `API request failed (${response.status})`;

    const error = new Error(message);
    error.status = response.status;

    throw error;
  }

  return result;
}

// =====================================================
// GET ALL RECORDS
// =====================================================

export async function getData(resource) {
  return apiRequest(resource);
}

// =====================================================
// GET RECORD BY ID
// =====================================================

export async function getById(resource, id) {
  if (
    id === undefined ||
    id === null ||
    id === ""
  ) {
    return null;
  }

  try {
    return await apiRequest(
      `${resource}/${encodeURIComponent(id)}`
    );
  } catch (error) {
    if (error.status === 404) {
      return null;
    }

    throw error;
  }
}

// =====================================================
// QUERY RECORDS
// =====================================================

export async function queryData(
  resource,
  params = {}
) {
  return apiRequest(resource, { params });
}

// =====================================================
// CREATE RECORD
// =====================================================

export async function saveData(resource, data) {
  return apiRequest(resource, {
    method: "POST",
    data
  });
}

// =====================================================
// REPLACE RECORD
// =====================================================

export async function updateData(
  resource,
  id,
  data
) {
  if (
    id === undefined ||
    id === null ||
    id === ""
  ) {
    throw new Error(`Invalid ${resource} id`);
  }

  return apiRequest(
    `${resource}/${encodeURIComponent(id)}`,
    {
      method: "PUT",
      data
    }
  );
}

// =====================================================
// PARTIALLY UPDATE RECORD
// =====================================================

export async function patchData(
  resource,
  id,
  data
) {
  if (
    id === undefined ||
    id === null ||
    id === ""
  ) {
    throw new Error(`Invalid ${resource} id`);
  }

  return apiRequest(
    `${resource}/${encodeURIComponent(id)}`,
    {
      method: "PATCH",
      data
    }
  );
}

// =====================================================
// DELETE RECORD
// =====================================================

export async function removeData(resource, id) {
  if (
    id === undefined ||
    id === null ||
    id === ""
  ) {
    return false;
  }

  try {
    await apiRequest(
      `${resource}/${encodeURIComponent(id)}`,
      {
        method: "DELETE"
      }
    );

    return true;
  } catch (error) {
    // A missing record is already effectively deleted.
    if (error.status === 404) {
      return true;
    }

    throw error;
  }
}

// =====================================================
// GET CURRENT SESSION
// =====================================================

export async function getSession() {
  try {
    const saved = sessionStorage.getItem(SESSION_KEY);

    if (!saved) {
      return null;
    }

    const session = JSON.parse(saved);

    if (
      !session ||
      !session.userId ||
      !session.role
    ) {
      return null;
    }

    return session;
  } catch (error) {
    console.error(
      "Unable to get current session:",
      error
    );

    return null;
  }
}

// =====================================================
// CLEAR CURRENT SESSION
// =====================================================

export async function clearSessions() {
  try {
    sessionStorage.removeItem(SESSION_KEY);
    sessionStorage.removeItem(TOKEN_KEY);

    return true;
  } catch (error) {
    console.error(
      "Unable to clear session:",
      error
    );

    return false;
  }
}

// =====================================================
// CREATE CURRENT SESSION
// =====================================================

export async function createSession(sessionData) {
  if (
    !sessionData ||
    !sessionData.userId ||
    !sessionData.role
  ) {
    throw new Error("Invalid session data");
  }

  const session = {
    id: crypto.randomUUID(),
    role: String(sessionData.role).toLowerCase(),
    userId: String(sessionData.userId),
    email: sessionData.email || "",
    name: sessionData.name || "",
    loginTime: new Date().toISOString()
  };

  sessionStorage.setItem(
    SESSION_KEY,
    JSON.stringify(session)
  );

  return session;
}

// =====================================================
// GET CURRENT STUDENT
// =====================================================

export async function getCurrentStudent() {
  try {
    const session = await getSession();

    if (
      !session ||
      session.role !== "student" ||
      !session.userId
    ) {
      return null;
    }

    return await getById(
      "students",
      session.userId
    );
  } catch (error) {
    console.error(
      "Unable to get current student:",
      error
    );

    return null;
  }
}

// =====================================================
// GET CURRENT ADMIN
// =====================================================

export async function getCurrentAdmin() {
  try {
    const session = await getSession();

    if (
      !session ||
      session.role !== "admin" ||
      !session.userId
    ) {
      return null;
    }

    return await getById(
      "admins",
      session.userId
    );
  } catch (error) {
    console.error(
      "Unable to get current administrator:",
      error
    );

    return null;
  }
}

// =====================================================
// GET SELECTED COURSE KEY
// =====================================================

export async function getSelectedCourseKey() {
  try {
    const state = await getById(
      "appState",
      "current"
    );

    return state
      ? state.selectedCourseKey ?? null
      : null;
  } catch (error) {
    console.error(
      "Unable to get selected course:",
      error
    );

    return null;
  }
}

// =====================================================
// SET SELECTED COURSE KEY
// =====================================================

export async function setSelectedCourseKey(courseKey) {
  return patchData(
    "appState",
    "current",
    {
      selectedCourseKey: courseKey
    }
  );
}

// =====================================================
// GET APPLICATION STATE
// =====================================================

export async function getAppState() {
  return getById(
    "appState",
    "current"
  );
}

// =====================================================
// UPDATE APPLICATION STATE
// =====================================================

export async function updateAppState(data) {
  return patchData(
    "appState",
    "current",
    data
  );
}

// =====================================================
// EXPORT API URL
// =====================================================

export { API_URL };
