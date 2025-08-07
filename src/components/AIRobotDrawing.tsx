import React, { useEffect, useState } from 'react';

interface AIRobotDrawingProps {
  selectedStyle: string;
}

const AIRobotDrawing: React.FC<AIRobotDrawingProps> = ({ selectedStyle }) => {
  const [drawingPhase, setDrawingPhase] = useState(0);
  const [strokeProgress, setStrokeProgress] = useState(0);

  useEffect(() => {
    const phases = [
      { duration: 1500, description: "Preparing the canvas..." },
      { duration: 2500, description: "Sketching with care..." },
      { duration: 3000, description: "Adding artistic touches..." },
      { duration: 2000, description: "Bringing it to life..." }
    ];

    let totalTime = 0;
    phases.forEach((phase, index) => {
      setTimeout(() => {
        setDrawingPhase(index);
      }, totalTime);
      totalTime += phase.duration;
    });

    // Gentle stroke animation
    const interval = setInterval(() => {
      setStrokeProgress(prev => {
        if (prev >= 100) return 0;
        return prev + 1.5;
      });
    }, 150);

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

        {/* Artistic Robot Body */}
        <g className="animate-breathe">
          {/* Main Body - Softer, more organic */}
          <rect
            x="100"
            y="250"
            width="120"
            height="150"
            rx="30"
            fill="url(#robotGradient)"
            stroke="hsl(var(--accent))"
            strokeWidth="1.5"
            filter="url(#glow)"
            opacity="0.9"
          />

          {/* Head - More rounded and gentle */}
          <ellipse
            cx="160"
            cy="220"
            rx="55"
            ry="45"
            fill="url(#robotGradient)"
            stroke="hsl(var(--accent))"
            strokeWidth="1.5"
            filter="url(#glow)"
            opacity="0.9"
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

        {/* Artistic Robot Arm - Gentle, fluid movements */}
        <g className={`transition-all duration-2000 ease-in-out ${drawingPhase >= 1 ? 'animate-breathe' : ''}`}>
          {/* Upper Arm - More fluid */}
          <line
            x1="220"
            y1="300"
            x2={280 + Math.sin(drawingPhase * 0.3) * 15}
            y2={280 + Math.cos(drawingPhase * 0.3) * 8}
            stroke="hsl(var(--accent))"
            strokeWidth="6"
            strokeLinecap="round"
            className="transition-all duration-1000 ease-out"
            opacity="0.8"
          />
          
          {/* Lower Arm - Graceful movements */}
          <line
            x1={280 + Math.sin(drawingPhase * 0.3) * 15}
            y1={280 + Math.cos(drawingPhase * 0.3) * 8}
            x2={320 + Math.sin(drawingPhase * 0.5) * 20}
            y2={200 + Math.cos(drawingPhase * 0.5) * 10}
            stroke="hsl(var(--accent))"
            strokeWidth="4"
            strokeLinecap="round"
            className="transition-all duration-1000 ease-out"
            opacity="0.8"
          />

          {/* Artistic Brush/Stylus */}
          <circle
            cx={320 + Math.sin(drawingPhase * 0.5) * 20}
            cy={200 + Math.cos(drawingPhase * 0.5) * 10}
            r="3"
            fill="hsl(var(--primary))"
            className="animate-pulse-soft"
            opacity="0.9"
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

      {/* Gentle Progress Display */}
      <div className="mt-12 text-center space-y-6">
        <div className="text-xl font-light text-primary/80 animate-breathe">
          {drawingPhase === 0 && "Preparing the canvas..."}
          {drawingPhase === 1 && "Sketching with care..."}
          {drawingPhase === 2 && "Adding artistic touches..."}
          {drawingPhase === 3 && "Bringing it to life..."}
        </div>
        
        {/* Minimalist Progress Indicator */}
        <div className="flex justify-center space-x-2">
          {Array.from({ length: 4 }).map((_, i) => (
            <div
              key={i}
              className={`w-2 h-2 rounded-full transition-all duration-500 ${
                i <= drawingPhase 
                  ? 'bg-primary/80 scale-110' 
                  : 'bg-muted-foreground/30'
              }`}
            />
          ))}
        </div>
      </div>
    </div>
  );
};

export default AIRobotDrawing;