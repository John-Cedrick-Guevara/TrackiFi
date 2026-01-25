import React from 'react';

const Hero: React.FC = () => {
  return (
    <section className="relative overflow-hidden lg:block flex">
      
      {/* Background Decor */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-full max-w-7xl pointer-events-none -z-10">
        <div className="absolute top-20 left-10 w-96 h-96 bg-blue-500/10 rounded-full blur-3xl rounded-full mix-blend-multiply filter opacity-70 animate-float" />
        <div className="absolute top-40 right-10 w-96 h-96 bg-green-500/10 rounded-full blur-3xl rounded-full mix-blend-multiply filter opacity-70 animate-float-delayed" />
      </div>

      <div className="container grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
        {/* Text Content */}
        <div className="flex flex-col items-center lg:items-start text-center lg:text-left space-y-8 z-10">
          <h1 className="text-5xl md:text-6xl font-medium font-display leading-[1.1] tracking-tight text-text-primary">
            Take full control of <br />
            your finances with <br />
            <span className="text-gradient-primary">AI-powered insights.</span>
          </h1>
          
          <p className="text-lg md:text-xl text-text-secondary max-w-lg leading-relaxed">
            Smart dashboards track income, expenses, and investments effortlessly.
          </p>

          <button className="px-8 py-3.5 rounded-full bg-purple-700 hover:bg-purple-600 text-white text-lg font-semibold shadow-xl shadow-purple-500/30 transition-all transform hover:-translate-y-1 active:scale-95">
            Get Started Free
          </button>
        </div>

        {/* Hero Image */}
        <div className="relative z-10 lg:h-auto flex justify-center perspective-1000">
          <div className="relative animate-float w-full max-w-[700px]">
            {/* Glow behind image */}
            <div className="absolute inset-0 bg-gradient-to-tr from-purple-500/20 to-green-400/20 blur-2xl transform rotate-6" />
            
            <img 
              src="/LandingPage/hero-banner.png" 
              alt="TrackiFi Dashboard" 
              className="relative w-full h-auto drop-shadow-2xl rounded-2xl transform transition-transform hover:scale-[1.02] duration-500"
            />

            {/* Floating decorative elements (simulating the rings in design if not in image) */}
            {/* Note: The image seems to contain the rings, but if we needed CSS rings: */}
            {/* <div className="absolute -top-10 -right-10 w-24 h-24 border-4 border-green-400/30 rounded-full blur-sm animate-spin-slow" /> */}
          </div>
        </div>
      </div>
    </section>
  );
};

export default Hero;
