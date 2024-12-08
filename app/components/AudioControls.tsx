import { useState } from "react";

interface AudioControlsProps {
  onStartRecording: () => void;
  onStopRecording: () => void;
  isRecording: boolean;
}

export const AudioControls = ({
  onStartRecording,
  onStopRecording,
  isRecording,
}: AudioControlsProps) => {
  return (
    <div className="flex flex-col items-center gap-4">
      <button
        onClick={isRecording ? onStopRecording : onStartRecording}
        className={`w-16 h-16 rounded-full ${
          isRecording
            ? "bg-red-500 animate-pulse"
            : "bg-blue-500 hover:bg-blue-600"
        } transition-colors`}
      >
        <span className="sr-only">
          {isRecording ? "Stop Recording" : "Start Recording"}
        </span>
      </button>
      <p className="text-gray-600">
        {isRecording ? "Grandma is listening..." : "Click to talk with Grandma"}
      </p>
    </div>
  );
};
