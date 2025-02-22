// components/AudioControls.tsx
"use client";

import { useState, useEffect } from "react";

interface AudioControlsProps {
  onStartRecording: () => Promise<void>;
  onStopRecording: () => void;
  isRecording: boolean;
  isConnected: boolean;
}

export const AudioControls = ({
  onStartRecording,
  onStopRecording,
  isRecording,
  isConnected,
}: AudioControlsProps) => {
  const [isPressed, setIsPressed] = useState(false);

  useEffect(() => {
    if (!isRecording) {
      setIsPressed(false);
    }
  }, [isRecording]);

  const handleMouseDown = async () => {
    setIsPressed(true);
    await onStartRecording();
  };

  const handleMouseUp = () => {
    setIsPressed(false);
    onStopRecording();
  };

  return (
    <div className="flex flex-col items-center gap-4">
      <button
        onMouseDown={handleMouseDown}
        onMouseUp={handleMouseUp}
        onTouchStart={handleMouseDown}
        onTouchEnd={handleMouseUp}
        disabled={!isConnected}
        className={`
          w-20 h-20 rounded-full 
          transition-all duration-200
          flex items-center justify-center
          ${isConnected ? "hover:scale-105" : "opacity-50 cursor-not-allowed"}
          ${isRecording ? "bg-red-500 scale-110" : "bg-warm-500"}
          ${isPressed ? "scale-95" : ""}
        `}
      >
        <span className="sr-only">
          {isRecording ? "Stop Recording" : "Start Recording"}
        </span>
        <div
          className={`
          w-12 h-12 
          ${isRecording ? "rounded-lg" : "rounded-full"}
          ${isRecording ? "bg-red-700" : "bg-warm-700"}
          transition-all duration-300
        `}
        />
      </button>

      <p
        className={`
        text-warm-700 text-center transition-colors
        ${isRecording ? "animate-pulse" : ""}
      `}
      >
        {!isConnected
          ? "Connecting..."
          : isRecording
          ? "Grandma is listening..."
          : "Hold to talk with Grandma"}
      </p>
    </div>
  );
};
