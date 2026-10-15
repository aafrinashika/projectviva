export async function orgFetch(path, options = {}) {
  const token = localStorage.getItem("phishshield_token");

  const response = await fetch(`http://127.0.0.1:5000${path}`, {
    ...options,
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
      ...(options.headers || {})
    }
  });

  const data = await response.json();

  if (!response.ok) {
    throw new Error(data.error || "Request failed");
  }

  return data;
}