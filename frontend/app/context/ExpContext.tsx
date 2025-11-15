"use client";
import { createContext, useContext, useState, useCallback, useMemo, useEffect } from "react";

type BubbleType = {
  id: number;
  startX: number;
  startY: number;
};

type ExpContextType = {
  showBubble: () => void;
};

const ExpContext = createContext<ExpContextType | undefined>(undefined);

export function ExpProvider({ children }: { readonly children: React.ReactNode }) {
  const [bubbles, setBubbles] = useState<BubbleType[]>([]);

  const showBubble = useCallback(() => {
    const id = Date.now();
    
    const startX = window.innerWidth / 2;
    const startY = window.innerHeight / 2;
    
    setBubbles((prev) => [...prev, { id, startX, startY }]);
    
    const timeoutId = setTimeout(() => {
      setBubbles((prev) => {
        const filtered = prev.filter((b) => b.id !== id);
        return filtered;
      });
    }, 1500);
    
    return () => clearTimeout(timeoutId);
  }, []);

  useEffect(() => {
    const handleExpGained = () => {
      showBubble();
    };

    if (typeof globalThis !== 'undefined' && globalThis.window) {
      globalThis.window.addEventListener('exp-gained', handleExpGained);
      return () => globalThis.window?.removeEventListener('exp-gained', handleExpGained);
    }
  }, [showBubble]);

  const contextValue = useMemo(() => ({ showBubble }), [showBubble]);

  return (
    <ExpContext.Provider value={contextValue}>
      {children}
      <div className="pointer-events-none fixed inset-0 overflow-hidden">
        {bubbles.map(({ id, startX, startY }) => {
          const deltaX = 60 - startX;
          const deltaY = 60 - startY;
          return (
            <div
              key={id}
              className="absolute w-12 h-12 bg-gradient-to-r from-green-400 to-emerald-500 rounded-full flex items-center justify-center shadow-lg"
              style={{
                left: `${startX}px`,
                top: `${startY}px`,
                animation: `bubbleToTarget 1.5s ease-in forwards`,
                '--delta-x': `${deltaX}px`,
                '--delta-y': `${deltaY}px`,
              } as React.CSSProperties & { '--delta-x': string; '--delta-y': string }}
            >
              <span className="text-white text-sm font-bold">+10</span>
            </div>
          );
        })}
        <style>{`
          @keyframes bubbleToTarget {
            0% {
              opacity: 1;
              transform: translate(0, 0) scale(1);
            }
            90% {
              opacity: 1;
            }
            100% {
              opacity: 0;
              transform: translate(var(--delta-x), var(--delta-y)) scale(0.5);
            }
          }
        `}</style>
      </div>
    </ExpContext.Provider>
  );
}

export function useExp() {
  const context = useContext(ExpContext);
  if (!context) {
    throw new Error("useExp must be used within ExpProvider");
  }
  return context;
}
