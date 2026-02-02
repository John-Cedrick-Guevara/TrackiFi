import { createFileRoute } from "@tanstack/react-router";
import Hero from "@/components/LandingPage/Hero";
import Highlights from "@/components/LandingPage/Highlights";
import Navbar from "@/components/LandingPage/Navbar";
import Pricing from "@/components/LandingPage/Pricing";
import Features from "@/components/LandingPage/Features";
import Footer from "@/components/LandingPage/Footer";
import { usePWAInstall } from "@/hooks/usePWAInstall";
import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";

export const Route = createFileRoute("/")({
  component: App,
});

function App() {
  const { isInstallable, isIOS, isStandalone, install } = usePWAInstall();
  const [error, setError] = useState<string | null>(null);
  const [swStatus, setSwStatus] = useState<string>("checking...");
  const [manifestStatus, setManifestStatus] = useState<string>("checking...");
  const [isHttps, setIsHttps] = useState(false);

  useEffect(() => {
    // Check HTTPS
    setIsHttps(window.location.protocol === "https:");

    // Check Service Worker
    if ("serviceWorker" in navigator) {
      navigator.serviceWorker
        .getRegistration()
        .then((reg) => {
          setSwStatus(reg ? "registered ✓" : "not registered ✗");
        })
        .catch(() => setSwStatus("error ✗"));
    } else {
      setSwStatus("not supported ✗");
    }

    // Check Manifest
    fetch("/manifest.json")
      .then((res) =>
        res.ok ? setManifestStatus("found ✓") : setManifestStatus("404 ✗"),
      )
      .catch(() => setManifestStatus("error ✗"));
  });

  const handleInstallClick = async () => {
    try {
      setError(null);
      const result = await install();
      if (!result) {
        setError("Install prompt not available yet. Try: 1) Browse the site for 30+ seconds, 2) Refresh the page, or 3) Use Chrome menu > 'Install app'");
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : String(err));
    }
  };

  return (
    <div className="min-h-screen font-sans bg-bg-main text-text-primary overflow-x-hidden">
      <Navbar />

      {/* Debug Install Button - Always Visible */}
      <div className="fixed bottom-4 right-4 z-50 bg-white p-4 rounded-lg shadow-2xl border border-gray-200 max-w-sm">
        <h4 className="font-bold text-sm mb-2 text-purple-600">
          PWA Debug Info
        </h4>
        <div className="text-xs space-y-1 mb-3 font-mono">
          <p className={isHttps ? "text-green-600" : "text-red-600"}>
            HTTPS: <strong>{String(isHttps)}</strong> {!isHttps && "⚠️"}
          </p>
          <p>
            Service Worker: <strong>{swStatus}</strong>
          </p>
          <p>
            Manifest: <strong>{manifestStatus}</strong>
          </p>
          <p className={isInstallable ? "text-green-600" : "text-orange-600"}>
            Installable: <strong>{String(isInstallable)}</strong>
          </p>
          <p>
            iOS: <strong>{String(isIOS)}</strong>
          </p>
          <p>
            Standalone: <strong>{String(isStandalone)}</strong>
          </p>
          <p
            className="text-[10px] text-gray-500 truncate"
            title={navigator.userAgent}
          >
            UA: {navigator.userAgent.substring(0, 35)}...
          </p>
        </div>
        <Button
          onClick={handleInstallClick}
          className="w-full bg-purple-600 hover:bg-purple-700 text-white"
          size="sm"
        >
          {isInstallable ? "Install App" : "Force Install Attempt"}
        </Button>
        {error && (
          <div className="mt-2 p-2 bg-red-50 border border-red-200 rounded text-xs text-red-700">
            <strong>Error:</strong> {error}
          </div>
        )}
        {!isHttps && (
          <div className="mt-2 p-2 bg-orange-50 border border-orange-200 rounded text-xs text-orange-700">
            ⚠️ PWAs require HTTPS on mobile devices
          </div>
        )}
        {!isInstallable && isHttps && (
          <div className="mt-2 p-2 bg-blue-50 border border-blue-200 rounded text-[10px] text-blue-700 leading-tight">
            <strong>Manual Install:</strong> Chrome Menu (⋮) → "Install app" or "Add to Home screen"
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
