import React, { useEffect, useState } from 'react';

interface AIRobotDrawingProps {
  selectedStyle: string;
}

const AIRobotDrawing: React.FC<AIRobotDrawingProps> = ({ selectedStyle }) => {
  const [drawingPhase, setDrawingPhase] = useState(0);
  const [strokeProgress, setStrokeProgress] = useState(0);

  useEffect(() => {
    const phases = [
      { duration: 1000, description: "Setting up..." },
      { duration: 2000, description: "Drawing outline..." },
      { duration: 2000, description: "Adding details..." },
      { duration: 1500, description: "Final touches..." }
    ];

    let totalTime = 0;
    phases.forEach((phase, index) => {
      setTimeout(() => {
        setDrawingPhase(index);
      }, totalTime);
      totalTime += phase.duration;
    });

    // Animate stroke progress
    const interval = setInterval(() => {
      setStrokeProgress(prev => {
        if (prev >= 100) return 0;
        return prev + 2;
      });
    }, 100);

    return () => clearInterval(interval);
  }, []);

  return (
    <div className="relative max-w-2xl mx-auto">
      {/* AI Robot */}
      <svg
        viewBox="0 0 800 600"
        className="w-full h-auto"
        xmlns="http://www.w3.org/2000/svg"
      >
        <defs>
          <linearGradient id="robotGradient" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="hsl(var(--primary))" />
            <stop offset="100%" stopColor="hsl(var(--accent))" />
          </linearGradient>
          
          <linearGradient id="canvasGlow" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="hsl(var(--background))" />
            <stop offset="100%" stopColor="hsl(var(--muted))" />
          </linearGradient>

          <filter id="glow">
            <feGaussianBlur stdDeviation="3" result="coloredBlur"/>
            <feMerge> 
              <feMergeNode in="coloredBlur"/>
              <feMergeNode in="SourceGraphic"/>
            </feMerge>
          </filter>
        </defs>

        {/* Drawing Canvas/Screen */}
        <rect
          x="350"
          y="100"
          width="300"
          height="200"
          rx="20"
          fill="url(#canvasGlow)"
          stroke="hsl(var(--accent))"
          strokeWidth="3"
          className="animate-pulse-soft"
          filter="url(#glow)"
        />

        {/* Canvas Screen Glow */}
        <rect
          x="355"
          y="105"
          width="290"
          height="190"
          rx="15"
          fill="hsl(var(--background))"
          className="animate-neural-pulse"
        />

        {/* Drawing Progress - Avatar Sketch */}
        <g clipPath="url(#canvasClip)">
          <defs>
            <clipPath id="canvasClip">
              <rect x="355" y="105" width="290" height="190" rx="15" />
            </clipPath>
          </defs>
          
          {/* Progressive drawing strokes */}
          <path
            d="M400 150 Q500 130 580 150 Q580 200 580 250 Q500 270 400 250 Q400 200 400 150 Z"
            fill="none"
            stroke="hsl(var(--primary))"
            strokeWidth="2"
            strokeDasharray="400"
            strokeDashoffset={400 - (strokeProgress * 4)}
            className="transition-all duration-100 ease-linear"
          />
          
          {drawingPhase >= 1 && (
            <>
              {/* Eyes */}
              <circle
                cx="450"
                cy="180"
                r="8"
                fill="hsl(var(--accent))"
                className="animate-fade-in"
              />
              <circle
                cx="530"
                cy="180"
                r="8"
                fill="hsl(var(--accent))"
                className="animate-fade-in"
              />
            </>
          )}
          
          {drawingPhase >= 2 && (
            <>
              {/* Mouth */}
              <path
                d="M460 220 Q490 240 520 220"
                fill="none"
                stroke="hsl(var(--accent))"
                strokeWidth="3"
                strokeLinecap="round"
                className="animate-fade-in"
              />
              
              {/* Style indicator */}
              <text
                x="490"
                y="270"
                textAnchor="middle"
                fill="hsl(var(--primary))"
                fontSize="12"
                className="animate-fade-in"
              >
                {selectedStyle}
              </text>
            </>
          )}
        </g>

        {/* Robot Body */}
        <g className="animate-subtle-float">
          {/* Main Body */}
          <rect
            x="100"
            y="250"
            width="120"
            height="150"
            rx="20"
            fill="url(#robotGradient)"
            stroke="hsl(var(--accent))"
            strokeWidth="2"
            filter="url(#glow)"
          />

          {/* Head */}
          <rect
            x="110"
            y="180"
            width="100"
            height="80"
            rx="40"
            fill="url(#robotGradient)"
            stroke="hsl(var(--accent))"
            strokeWidth="2"
            filter="url(#glow)"
          />

          {/* Eyes */}
          <circle
            cx="135"
            cy="210"
            r="8"
            fill="hsl(var(--background))"
            className={`animate-pulse-soft ${drawingPhase >= 2 ? 'animate-bounce' : ''}`}
          />
          <circle
            cx="185"
            cy="210"
            r="8"
            fill="hsl(var(--background))"
            className={`animate-pulse-soft ${drawingPhase >= 2 ? 'animate-bounce' : ''}`}
          />

          {/* LED Indicators */}
          <rect
            x="145"
            y="270"
            width="30"
            height="8"
            rx="4"
            fill="hsl(var(--accent))"
            className="animate-pulse-glow"
          />
          <rect
            x="145"
            y="285"
            width="20"
            height="6"
            rx="3"
            fill="hsl(var(--primary))"
            className="animate-pulse-glow"
            style={{ animationDelay: '0.5s' }}
          />

          {/* Antenna */}
          <line
            x1="160"
            y1="180"
            x2="160"
            y2="160"
            stroke="hsl(var(--accent))"
            strokeWidth="3"
            strokeLinecap="round"
          />
          <circle
            cx="160"
            cy="155"
            r="5"
            fill="hsl(var(--primary))"
            className="animate-pulse-glow"
          />
        </g>

        {/* Robot Arm - Animated Drawing Arm */}
        <g className={`transition-all duration-1000 ${drawingPhase >= 1 ? 'animate-drawing-motion' : ''}`}>
          {/* Upper Arm */}
          <line
            x1="220"
            y1="300"
            x2={280 + Math.sin(drawingPhase * 0.5) * 20}
            y2={280 + Math.cos(drawingPhase * 0.5) * 10}
            stroke="hsl(var(--accent))"
            strokeWidth="8"
            strokeLinecap="round"
            className="transition-all duration-500"
          />
          
          {/* Lower Arm */}
          <line
            x1={280 + Math.sin(drawingPhase * 0.5) * 20}
            y1={280 + Math.cos(drawingPhase * 0.5) * 10}
            x2={320 + Math.sin(drawingPhase * 0.8) * 30}
            y2={200 + Math.cos(drawingPhase * 0.8) * 15}
            stroke="hsl(var(--accent))"
            strokeWidth="6"
            strokeLinecap="round"
            className="transition-all duration-500"
          />

          {/* Stylus/Brush */}
          <circle
            cx={320 + Math.sin(drawingPhase * 0.8) * 30}
            cy={200 + Math.cos(drawingPhase * 0.8) * 15}
            r="4"
            fill="hsl(var(--primary))"
            className="animate-pulse-glow"
          />
          
          {/* Drawing particles */}
          {drawingPhase >= 1 && (
            <g>
              {Array.from({ length: 5 }).map((_, i) => (
                <circle
                  key={i}
                  cx={320 + Math.sin(drawingPhase * 0.8 + i) * 30 + Math.random() * 10}
                  cy={200 + Math.cos(drawingPhase * 0.8 + i) * 15 + Math.random() * 10}
                  r={2 + Math.random() * 2}
                  fill="hsl(var(--primary))"
                  className="animate-float"
                  style={{ animationDelay: `${i * 0.2}s` }}
                />
              ))}
            </g>
          )}
        </g>

        {/* Support Arm */}
        <line
          x1="100"
          y1="350"
          x2="60"
          y2="380"
          stroke="hsl(var(--accent))"
          strokeWidth="6"
          strokeLinecap="round"
        />
      </svg>

      {/* Progress Text */}
      <div className="mt-8 text-center">
        <div className="text-2xl font-semibold mb-4 text-accent animate-pulse-soft">
          {drawingPhase === 0 && "Robot is setting up..."}
          {drawingPhase === 1 && "Drawing the outline..."}
          {drawingPhase === 2 && "Adding beautiful details..."}
          {drawingPhase === 3 && "Applying finishing touches..."}
        </div>
        
        {/* Progress Bar */}
        <div className="w-full max-w-md mx-auto bg-muted rounded-full h-3 shadow-inner">
          <div
            className="bg-gradient-to-r from-primary to-accent h-3 rounded-full transition-all duration-300 shadow-glow"
            style={{ width: `${Math.min(100, (drawingPhase + 1) * 25)}%` }}
          />
        </div>
      </div>
    </div>
  );
};

export default AIRobotDrawing;