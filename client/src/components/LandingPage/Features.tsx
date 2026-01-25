import React from "react";

const Features: React.FC = () => {
  return (
    <section className="py-20 px-6 md:px-12 bg-white/50 relative overflow-hidden">
      {/* Background Gradient Spot */}
      <div className="absolute bottom-0 left-1/4 w-96 h-96 bg-purple-100/50 blur-3xl rounded-full -z-10" />

      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-16 space-y-4">
          <h2 className="text-3xl md:text-5xl font-medium font-display text-gray-900">
            Financial Chaos vs. AI-Assisted Clarity
          </h2>
          <p className="text-gray-600 text-lg max-w-2xl mx-auto">
            Smart dashboards track income, expenses in insights.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 lg:gap-16">
          {/* Problem Card */}
          <div
            className="glass-panel group p-8 transition-all hover:-translate-y-1"
          >
            <div className="relative z-10 flex flex-col items-center">
              <img
                src="/LandingPage/problem.png"
                alt="Financial Chaos"
                className="w-full h-auto drop-shadow-md mb-6 transform group-hover:scale-[1.02] transition-transform duration-500"
              />
              <div className="flex items-center gap-2 text-red-500 font-bold text-xl">
                <div className="w-8 h-8 rounded-full bg-red-100 flex items-center justify-center">
                  <span className="text-lg">!</span>
                </div>
                Problem
              </div>
            </div>

            {/* Hover Glow */}
            <div className="absolute inset-0 bg-red-400/5 opacity-0 group-hover:opacity-100 rounded-3xl transition-opacity duration-300 pointer-events-none" />
          </div>

          {/* Solution Card */}
          <div className="glass-panel group p-8 transition-all hover:-translate-y-1">
            <div className="relative z-10 flex flex-col items-center">
              <img
                src="/LandingPage/solution.png"
                alt="AI Solution"
                className="w-full h-auto drop-shadow-md mb-6 transform group-hover:scale-[1.02] transition-transform duration-500"
              />
              <div className="flex items-center gap-2 text-green-500 font-bold text-xl">
                <div className="w-8 h-8 rounded-full bg-green-100 flex items-center justify-center">
                  <svg
                    className="w-5 h-5"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth="3"
                      d="M5 13l4 4L19 7"
                    />
                  </svg>
                </div>
                Solution
              </div>
            </div>
            {/* Hover Glow */}
            <div className="absolute inset-0 bg-green-400/5 opacity-0 group-hover:opacity-100 rounded-3xl transition-opacity duration-300 pointer-events-none" />
          </div>
        </div>
      </div>
    </section>
  );
};

export default Features;
