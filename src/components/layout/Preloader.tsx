import { useEffect, useState } from 'react';

export function Preloader() {
    const [show, setShow] = useState(true);

    return (
        <div className="fixed inset-0 z-[100] flex flex-col items-center justify-center bg-background transition-opacity duration-500">
            <div className="relative flex flex-col items-center gap-4 animate-in fade-in zoom-in duration-500">
                {/* Logo Animation */}
                <div className="relative w-48 h-auto">
                    <img
                        src="/Logo-1024x236.png"
                        alt="NanoEnrich"
                        className="w-full h-full object-contain animate-pulse"
                    />
                </div>

                {/* Spinner / Loading Bar */}
                <div className="w-32 h-1 bg-muted overflow-hidden rounded-full mt-4">
                    <div className="w-full h-full bg-primary/80 animate-[loading_1.5s_ease-in-out_infinite] origin-left" />
                </div>

                <p className="text-sm text-muted-foreground font-medium animate-pulse">
                    Loading Experience...
                </p>
            </div>

            <style>{`
        @keyframes loading {
          0% { transform: translateX(-100%); }
          50% { transform: translateX(0%); }
          100% { transform: translateX(100%); }
        }
      `}</style>
        </div>
    );
}
