import React, { useState, useEffect, useRef } from "react";

const Navbar = () => {
  const [currentTime, setCurrentTime] = useState(new Date());
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const dropdownRef = useRef(null);
  const user = JSON.parse(localStorage.getItem("user") || "{}");

  // Clock
  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  // Fix — clear ALL localStorage items on logout
  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    localStorage.removeItem("doneLectureIds");
    localStorage.removeItem("adminDoneLectureIds");
    localStorage.removeItem("todayLectureCount");
    localStorage.removeItem("adminTodayLectureCount");
    window.location.href = "/";  // go to landing page
  };

  // Close dropdown on outside click
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setDropdownOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  return (
    <div className="flex justify-between items-center p-4 bg-white shadow-md">
      <div>
        <p className="text-sm font-medium">Today</p>
        <p className="text-lg font-semibold">
          {currentTime.toLocaleDateString()}
        </p>
        <p className="text-sm text-gray-500">
          {currentTime.toLocaleTimeString()}
        </p>
      </div>

      <div className="relative" ref={dropdownRef}>
        <button
          onClick={() => setDropdownOpen(!dropdownOpen)}
          className="flex items-center p-2 border rounded-full cursor-pointer"
        >
          <img src="/assets/Profile.svg" alt="Profile" className="w-8 h-8 rounded-full" />
        </button>

        {/* Dropdown */}
        <div className={`absolute right-0 mt-3 w-80 bg-white shadow-xl rounded-2xl p-4 z-50 transition-all duration-200 ${
          dropdownOpen ? "opacity-100 visible" : "opacity-0 invisible"
        }`}>
          <div className="flex items-center gap-3 border-b pb-3">
            <div className="w-12 h-12 bg-gray-200 rounded-full flex items-center justify-center">
              <img src="/assets/Profile.svg" alt="Profile" className="w-10 h-10 rounded-full" />
            </div>
            <div>
              <p className="text-lg font-semibold">{user?.name || 'Teacher'}</p>
              <p className="text-sm text-gray-400">{user?.email || ''}</p>
            </div>
          </div>
          <div className="mt-4 space-y-2 text-sm text-gray-700">
            <button
              className="hover:bg-gray-100 p-2 rounded-lg text-red-500 w-full text-left"
              onClick={handleLogout}
            >
              🚪 Sign out
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Navbar;