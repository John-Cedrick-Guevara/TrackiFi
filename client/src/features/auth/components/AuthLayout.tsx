import React, { type ReactNode } from "react";

interface AuthLayoutProps {
  children: ReactNode;
  title: string;
  subtitle: string;
}

export const AuthLayout: React.FC<AuthLayoutProps> = ({
  children,
  title,
  subtitle,
}) => {
  return (
    <div className="flex min-h-screen w-full bg-bg-main font-sans">
      {/* Left Column - Desktop Design Section */}
      <div className="hidden lg:flex lg:w-1/2 relative bg-bg-surface border-r border-border p-12 flex-col justify-between overflow-hidden">
        {/* Background Decoration/Gradient */}
        <div className="absolute inset-0 bg-gradient-to-br from-bg-surface via-bg-main to-bg-surface opacity-50 z-0 pointer-events-none" />
        <div className="absolute -top-24 -left-24 w-96 h-96 bg-accent-primary rounded-full blur-[128px] opacity-10 animate-float-delayed" />
        <div className="absolute bottom-0 right-0 w-96 h-96 bg-accent-tertiary rounded-full blur-[128px] opacity-10 animate-float" />

        {/* Logo Brand */}
        <div className="relative z-10 flex items-center gap-3">
          <div className="h-10 w-10 rounded-xl bg-gradient-to-br from-accent-primary to-accent-tertiary flex items-center justify-center shadow-md">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-6 w-6 text-white"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="M12 2v20M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6" />
            </svg>
          </div>
          <span className="text-2xl font-display font-bold text-text-primary tracking-tight">
            TrackiFi
          </span>
        </div>

        {/* Hero Text */}
        <div className="relative z-10 max-w-xl">
          <h2 className="text-5xl font-display font-bold leading-tight text-text-primary mb-6">
            Financial clarity,
            <br />
            <span className="text-transparent bg-clip-text text-gradient-primary">
              simplified.
            </span>
          </h2>
          <p className="text-lg text-text-secondary leading-relaxed">
            Experience the future of financial tracking. Secure, intelligent,
            and designed for your peace of mind.
          </p>
        </div>

        {/* Footer Info */}
        <div className="relative z-10 flex items-center justify-between text-sm text-text-secondary">
          <p>© 2026 TrackiFi Inc.</p>
          <div className="flex gap-4">
            <span className="cursor-pointer hover:text-text-primary transition-colors">
              Privacy
            </span>
            <span className="cursor-pointer hover:text-text-primary transition-colors">
              Terms
            </span>
            <span className="cursor-pointer hover:text-text-primary transition-colors">
              Help
            </span>
          </div>
        </div>
      </div>

      {/* Right Column - Form Section */}
      <div className="w-full lg:w-1/2 flex items-center justify-center p-4 sm:p-6 lg:p-12 relative">
        <div className="w-full max-w-md space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
          {/* Mobile Header (Includes Logo) / Desktop Header (No Logo) */}
          <div className="text-center space-y-2">
            {/* Logo - Mobile Only */}
            <div className="lg:hidden inline-flex items-center justify-center h-12 w-12 rounded-xl bg-gradient-to-br from-[var(--color-accent-primary)] to-[var(--color-accent-tertiary)] shadow-lg mb-4">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-6 w-6 text-white"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <path d="M12 2v20M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6" />
              </svg>
            </div>

            <h1 className="text-3xl font-display font-bold tracking-tight text-text-primary">
              {title}
            </h1>
            <p className="text-text-secondary text-sm md:text-base">
              {subtitle}
            </p>
          </div>

          {/* Form Card */}
          <div className="bg-bg-surface rounded-2xl  border border-border p-8 sm:p-10">
            {children}
          </div>

          {/* Trust Indicators */}
          <div className="flex items-center justify-center gap-6 text-text-secondary opacity-60 text-xs">
            <div className="flex items-center gap-1">
              <svg
                className="w-3 h-3"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"
                ></path>
              </svg>
              <span>256-bit Encryption</span>
            </div>
            <div className="flex items-center gap-1">
              <svg
                className="w-3 h-3"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                ></path>
              </svg>
              <span>TrackiFi Secure</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
