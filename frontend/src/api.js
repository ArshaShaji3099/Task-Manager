const BASE_URL = "http://127.0.0.1:8000/api";

export const getAccessToken = () => localStorage.getItem("access_token");
export const getRefreshToken = () => localStorage.getItem("refresh_token");
export const saveTokens = (access, refresh) => {
    localStorage.setItem("access_token", access);
    localStorage.setItem("refresh_token", refresh);
};
export const clearTokens = () => {
    localStorage.removeItem("access_token");
    localStorage.removeItem("refresh_token");
    localStorage.removeItem("username");
};

const authFetch = async (url, options = {}) => {
    let token = getAccessToken();
    const res = await fetch(url, {
        ...options,
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}`, ...(options.headers || {}) },
    });

    if (res.status === 401) {
        const refresh = getRefreshToken();
        if (!refresh) { clearTokens(); window.location.href = "/"; return; }

        const refreshRes = await fetch(`${BASE_URL}/auth/refresh/`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ refresh }),
        });

        if (refreshRes.ok) {
            const data = await refreshRes.json();
            saveTokens(data.access, data.refresh || refresh);
            return fetch(url, {
                ...options,
                headers: { "Content-Type": "application/json", Authorization: `Bearer ${data.access}`, ...(options.headers || {}) },
            });
        } else {
            clearTokens();
            window.location.href = "/";
            return;
        }
    }
    return res;
};

export const loginUser = async (username, password) => {
    const res = await fetch(`${BASE_URL}/auth/login/`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username, password }),
    });
    if (!res.ok) throw new Error("Invalid username or password.");
    const data = await res.json();
    saveTokens(data.access, data.refresh);
    localStorage.setItem("username", username);
    return data;
};

export const registerUser = async (username, email, password) => {
    const res = await fetch(`${BASE_URL}/auth/register/`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username, email, password }),
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || "Registration failed.");
    return data;
};

export const logoutUser = () => clearTokens();

export const getTasks = async (userType = "", search = "", priority = "") => {
    const params = new URLSearchParams();
    if (userType) params.append("user_type", userType);
    if (search) params.append("search", search);
    if (priority) params.append("priority", priority);
    const url = `${BASE_URL}/tasks/${params.toString() ? "?" + params.toString() : ""}`;
    const res = await authFetch(url);
    if (!res.ok) throw new Error("Failed to fetch tasks");
    return res.json();
};

export const createTask = async (data) => {
    const res = await authFetch(`${BASE_URL}/tasks/`, { method: "POST", body: JSON.stringify(data) });
    if (!res.ok) throw new Error("Failed to create task");
    return res.json();
};

export const updateTask = async (id, data) => {
    const res = await authFetch(`${BASE_URL}/tasks/${id}/`, { method: "PUT", body: JSON.stringify(data) });
    if (!res.ok) throw new Error("Failed to update task");
    return res.json();
};

export const deleteTask = async (id) => {
    const res = await authFetch(`${BASE_URL}/tasks/${id}/`, { method: "DELETE" });
    if (!res.ok) throw new Error("Failed to delete task");
};

export const toggleComplete = async (id) => {
    const res = await authFetch(`${BASE_URL}/tasks/${id}/complete/`, { method: "PATCH" });
    if (!res.ok) throw new Error("Failed to update task");
    return res.json();
};

export const getSchedule = async (userType = "") => {
    const url = userType ? `${BASE_URL}/schedule/${userType}/` : `${BASE_URL}/schedule/`;
    const res = await authFetch(url);
    if (!res.ok) throw new Error("Failed to fetch schedule");
    return res.json();
};