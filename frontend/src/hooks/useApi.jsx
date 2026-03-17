import { useState } from 'react';

function useApi() {
  const API_URL = import.meta.env.VITE_API_URL;
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // ── Central logout — clears everything ──
  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    localStorage.removeItem("doneLectureIds");
    localStorage.removeItem("adminDoneLectureIds");
    localStorage.removeItem("todayLectureCount");
    localStorage.removeItem("adminTodayLectureCount");
    window.location.href = "/";
  };

  // ── Handle 401 globally ──
  const handle401 = (status) => {
    if (status === 401) {
      handleLogout();
      return true;
    }
    return false;
  };

  const post = async (path, data, options = {}) => {
    setLoading(true);
    setError(null);
    try {
      const response = await fetch(`${API_URL}${path}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
          ...options.headers,
        },
        body: JSON.stringify(data),
        credentials: 'include',
      });

      if (handle401(response.status)) return;

      if (!response.ok) {
        const errData = await response.json().catch(() => ({}));
        throw new Error(errData.message || `HTTP error! status: ${response.status}`);
      }

      return await response.json();
    } catch (error) {
      setError(error);
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const get = async (path, options = {}) => {
    setLoading(true);
    setError(null);
    try {
      const response = await fetch(`${API_URL}${path}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
          ...options.headers,
        },
        credentials: 'include',
      });

      if (handle401(response.status)) return;

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      return await response.json();
    } catch (error) {
      setError(error);
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const patch = async (path, data, options = {}) => {
    setLoading(true);
    setError(null);
    try {
      const response = await fetch(`${API_URL}${path}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
          ...options.headers,
        },
        body: JSON.stringify(data),
        credentials: 'include',
      });

      if (handle401(response.status)) return;

      if (!response.ok) {
        const errData = await response.json().catch(() => ({}));
        throw new Error(errData.message || `HTTP error! status: ${response.status}`);
      }

      return await response.json();
    } catch (error) {
      setError(error);
      throw error;
    } finally {
      setLoading(false);
    }
  };

  return { post, get, patch, handleLogout, loading, error };
}

export default useApi;