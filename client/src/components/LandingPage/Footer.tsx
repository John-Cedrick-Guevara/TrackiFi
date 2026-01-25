import React from "react";

const Footer: React.FC = () => {
  return (
    <footer className="py-20 px-6 md:px-12 bg-white relative">
      <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-4 gap-12 text-sm text-gray-500">
        {/* Brand */}
        <div className="flex flex-col gap-4">
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 rounded bg-linear-to-br from-blue-500 to-green-400 flex items-center justify-center text-white font-bold text-xs shadow-md">
              <span className="mb-px uppercase">F</span>
            </div>
            <span className="text-lg font-bold font-display text-gray-900 tracking-tight">
              TrackiFi
            </span>
          </div>
        </div>

        {/* Links Col 1 */}
        <div className="flex flex-col gap-3">
          <a href="#" className="hover:text-purple-600 transition-colors">
            About
          </a>
          <a href="#" className="hover:text-purple-600 transition-colors">
            Privacy
          </a>
          <a href="#" className="hover:text-purple-600 transition-colors">
            Contact
          </a>
        </div>

        {/* Links Col 2 */}
        <div className="flex flex-col gap-3">
          <a href="#" className="hover:text-purple-600 transition-colors">
            Blog
          </a>
          <a href="#" className="hover:text-purple-600 transition-colors">
            Terms
          </a>
          <a href="#" className="hover:text-purple-600 transition-colors">
            Social Kinda
          </a>
        </div>

        {/* Newsletter */}
        <div className="flex flex-col gap-4">
          <span className="font-semibold text-gray-900">
            Futuristic newsletter
          </span>
          <div className="flex items-center bg-gray-100 rounded-xl p-1 focus-within:ring-2 focus-within:ring-purple-500/50 transition-shadow">
            <input
              type="email"
              placeholder="Enter your email"
              className="bg-transparent border-none outline-none px-3 w-full text-gray-700 placeholder-gray-400"
            />
            <button className="bg-[#001f3f] text-white px-4 py-1.5 rounded-lg text-xs font-semibold hover:bg-gray-900 transition-colors">
              Signup
            </button>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto mt-12 pt-8 border-t border-gray-100 text-center text-xs text-gray-400">
        Powered by TrackiFi.com
      </div>
    </footer>
  );
};

export default Footer;
