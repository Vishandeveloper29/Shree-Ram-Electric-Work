const API_BASE = import.meta.env.VITE_API_URL || "http://localhost:5000/api";

const getToken = () => localStorage.getItem("srew_token");

const authHeaders = () => ({
  "Content-Type": "application/json",
  Authorization: `Bearer ${getToken()}`,
});

const handleResponse = async (res) => {
  const data = await res.json();
  if (!res.ok) throw new Error(data.message || "Request failed");
  return data;
};

// Auth
export const loginAdmin = (email, password) =>
  fetch(`${API_BASE}/auth/login`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email, password }),
  }).then(handleResponse);

export const changePassword = (currentPassword, newPassword) =>
  fetch(`${API_BASE}/auth/change-password`, {
    method: "POST",
    headers: authHeaders(),
    body: JSON.stringify({ currentPassword, newPassword }),
  }).then(handleResponse);

// Motors - public
export const getMotors = (params = {}) => {
  const qs = new URLSearchParams(
    Object.fromEntries(
      Object.entries(params).filter(([, v]) => v !== "" && v != null),
    ),
  ).toString();
  return fetch(`${API_BASE}/motors${qs ? "?" + qs : ""}`).then(handleResponse);
};

export const getMotorById = (id) =>
  fetch(`${API_BASE}/motors/${id}`).then(handleResponse);

export const getStats = () =>
  fetch(`${API_BASE}/motors/stats`).then(handleResponse);

export const getBrands = () =>
  fetch(`${API_BASE}/motors/brands`).then(handleResponse);

// Motors - admin
export const createMotor = (data) =>
  fetch(`${API_BASE}/motors`, {
    method: "POST",
    headers: authHeaders(),
    body: JSON.stringify(data),
  }).then(handleResponse);

export const updateMotor = (id, data) =>
  fetch(`${API_BASE}/motors/${id}`, {
    method: "PUT",
    headers: authHeaders(),
    body: JSON.stringify(data),
  }).then(handleResponse);

export const deleteMotor = (id) =>
  fetch(`${API_BASE}/motors/${id}`, {
    method: "DELETE",
    headers: authHeaders(),
  }).then(handleResponse);
