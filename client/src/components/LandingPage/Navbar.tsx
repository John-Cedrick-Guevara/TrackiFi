import React, { useState, useEffect } from "react";

const Navbar: React.FC = () => {
  const [isVisible, setIsVisible] = useState(true);

  useEffect(() => {
    let lastScrollY = window.scrollY;

    const handleScroll = () => {
      const currentScrollY = window.scrollY;

      if (currentScrollY > lastScrollY && currentScrollY > 50) {
        setIsVisible(false);
      } else {
        setIsVisible(true);
      }

      lastScrollY = currentScrollY;
    };

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <nav
      className={`fixed mt-2 w-full max-w-7xl mx-auto rounded-full shadow-md border border-black/10 top-0 left-0 right-0 z-50 flex items-center justify-between px-6 py-3 md:px-12 backdrop-blur-md bg-transparent transition-transform duration-300 ${
        isVisible ? "translate-y-0" : "-translate-y-24"
      }`}
    >
      {/* Logo Icon */}
      <img src="/TrackiFi-logo.png" className="w-30" alt="TrackiFi Logo" />

      <div>
        <button className="px-6 py-2.5 rounded-xl bg-[#7F5AF0] hover:bg-[#6c4bd6] text-white font-medium shadow-lg shadow-purple-500/30 transition-all transform hover:-translate-y-0.5 active:translate-y-0 font-display text-sm">
          Sign up
        </button>
      </div>
    </nav>
  );
};

export default Navbar;
