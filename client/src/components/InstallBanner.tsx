import React from "react";
import { usePWAInstall } from "@/hooks/usePWAInstall";
import { Download, X } from "lucide-react";
import { Button } from "@/components/ui/button";

const InstallBanner: React.FC = () => {
  const { isInstallable, install } = usePWAInstall();
  const [show, setShow] = React.useState(true);

  // if (!isInstallable || !show) return null;

  return (
    <div className="fixed top-4 left-1/2 -translate-x-1/2 z-60 w-[90%] max-w-md bg-white border border-gray-100 shadow-2xl rounded-2xl p-4 flex items-center justify-between gap-4 animate-in fade-in  slide-in-from-top-4 duration-500">
      <div className="flex items-center gap-3">
        <div className="w-12 h-12 rounded-xl bg-purple-600 flex items-center justify-center text-white shadow-lg shadow-purple-200 shrink-0">
          <Download size={24} />
        </div>
        <div>
          <h3 className="font-bold text-gray-900 text-sm">Install TrackiFi</h3>
          <p className="text-xs text-gray-500 line-clamp-1">
            Fast access & offline support
          </p>
        </div>
      </div>

      <div className="flex items-center gap-2">
        <Button
          onClick={install}
          size="sm"
          className="bg-purple-600 hover:bg-purple-700 text-white rounded-full px-4 h-9 text-xs"
        >
          Install
        </Button>
        <button
          onClick={() => setShow(false)}
          className="p-2 text-gray-400 hover:text-gray-600 transition-colors"
        >
          <X size={18} />
        </button>
      </div>
    </div>
  );
};

export default InstallBanner;
