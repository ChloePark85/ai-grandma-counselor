// components/GrandmaAvatar.tsx
"use client";

import { useState } from "react";

export const GrandmaAvatar = () => {
  const [isLoaded, setIsLoaded] = useState(false);

  return (
    <div className="relative w-40 h-40 mx-auto">
      <div
        className={`
        absolute inset-0 rounded-full 
        bg-warm-100 border-4 border-warm-200
        overflow-hidden transition-opacity duration-300
        ${isLoaded ? "opacity-100" : "opacity-0"}
      `}
      >
        <img
          src="/images/grandma-avatar.png"
          alt="AI Grandma"
          className="w-full h-full object-cover"
          onLoad={() => setIsLoaded(true)}
        />
      </div>

      {/* Placeholder/Fallback */}
      <div
        className={`
        absolute inset-0 rounded-full 
        bg-warm-100 flex items-center justify-center
        transition-opacity duration-300
        ${isLoaded ? "opacity-0" : "opacity-100"}
      `}
      >
        <span className="text-4xl">👵</span>
      </div>
    </div>
  );
};
