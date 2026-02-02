import { createFileRoute } from "@tanstack/react-router";
import Hero from "@/components/LandingPage/Hero";
import Highlights from "@/components/LandingPage/Highlights";
import Navbar from "@/components/LandingPage/Navbar";
import Pricing from "@/components/LandingPage/Pricing";
import Features from "@/components/LandingPage/Features";
import Footer from "@/components/LandingPage/Footer";
import { usePWAInstall } from "@/hooks/usePWAInstall";
import { useState } from "react";
import { Button } from "@/components/ui/button";

export const Route = createFileRoute("/")({
  component: App,
});

function App() {
  const { isInstallable, isIOS, isStandalone, install } = usePWAInstall();
  const [error, setError] = useState<string | null>(null);

  const handleInstallClick = async () => {
    try {
      setError(null);
      await install();
    } catch (err) {
      setError(err instanceof Error ? err.message : String(err));
    }
  };

  return (
    <div className="min-h-screen font-sans bg-bg-main text-text-primary overflow-x-hidden">
      <Navbar />

      {/* Debug Install Button - Always Visible */}
      <div className="fixed bottom-4 right-4 z-50 bg-white p-4 rounded-lg shadow-2xl border border-gray-200 max-w-sm">
        <h4 className="font-bold text-sm mb-2">PWA Debug Info</h4>
        <div className="text-xs space-y-1 mb-3">
          <p>
            Installable:{" "}
            <span className="font-mono">{String(isInstallable)}</span>
          </p>
          <p>
            iOS: <span className="font-mono">{String(isIOS)}</span>
          </p>
          <p>
            Standalone:{" "}
            <span className="font-mono">{String(isStandalone)}</span>
          </p>
          <p>
            User Agent:{" "}
            <span className="font-mono text-[10px]">
              {navigator.userAgent.substring(0, 40)}...
            </span>
          </p>
        </div>
        <Button
          onClick={handleInstallClick}
          className="w-full bg-purple-600 hover:bg-purple-700 text-white"
          size="sm"
        >
          Install App
        </Button>
        {error && (
          <div className="mt-2 p-2 bg-red-50 border border-red-200 rounded text-xs text-red-700">
            <strong>Error:</strong> {error}
          </div>
        )}
      </div>

      <Hero />
      <Features />
      <Highlights />
      <Pricing />
      <Footer />
    </div>
  );
}
