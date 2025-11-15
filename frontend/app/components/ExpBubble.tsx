"use client";
import { useEffect, useState } from "react";

type ExpBubbleProps = {
  readonly onComplete?: () => void;
};

export default function ExpBubble({ onComplete }: Readonly<ExpBubbleProps>) {
  const [isVisible, setIsVisible] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => {
      setIsVisible(false);
      onComplete?.();
    }, 2000);

    return () => clearTimeout(timer);
  }, [onComplete]);

  if (!isVisible) return null;

  return (
    <div
      className={`fixed bottom-10 right-10 pointer-events-none ${
        isVisible ? "animate-bubble" : ""
      }`}
    >
      <div className="relative w-12 h-12 bg-gradient-to-r from-green-400 to-emerald-500 rounded-full flex items-center justify-center shadow-lg">
        <span className="text-white text-sm font-bold">+10</span>
        <style>{`
          @keyframes bubble {
            0% {
              opacity: 1;
              transform: translateY(0) translateX(0);
            }
            50% {
              opacity: 1;
            }
            100% {
              opacity: 0;
              transform: translateY(-150px) translateX(30px);
            }
          }
          .animate-bubble {
            animation: bubble 2s ease-out forwards;
          }
        `}</style>
      </div>
    </div>
  );
}
