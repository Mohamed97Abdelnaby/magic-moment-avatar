// Shared particle field component for visual effects
const ParticleField = ({ count = 12 }: { count?: number }) => {
  return (
    <div className="particles">
      {Array.from({ length: count }).map((_, i) => (
        <div
          key={i}
          className="absolute w-1 h-1 rounded-full opacity-40"
          style={{
            left: `${Math.random() * 100}%`,
            top: `${Math.random() * 100}%`,
            background: 'hsl(var(--gradient-particle))',
            animation: `float ${8 + Math.random() * 4}s ease-in-out infinite ${Math.random() * 8}s`,
          }}
        />
      ))}
    </div>
  );
};

export default ParticleField;