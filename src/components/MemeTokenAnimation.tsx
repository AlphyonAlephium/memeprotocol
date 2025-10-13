import { useEffect, useState } from "react";

const MEME_TOKENS = [
  { name: "DOGE", emoji: "🐕", color: "#C3A634" },
  { name: "SHIB", emoji: "🐕‍🦺", color: "#FFA409" },
  { name: "PEPE", emoji: "🐸", color: "#4CAF50" },
  { name: "FLOKI", emoji: "🐶", color: "#FF6B9D" },
  { name: "BONK", emoji: "🏏", color: "#FF4B4B" },
  { name: "WIF", emoji: "🧢", color: "#8B4FBF" },
  { name: "WOJAK", emoji: "😭", color: "#69C3FF" },
  { name: "MOON", emoji: "🌙", color: "#FFD700" },
];

interface TokenParticle {
  id: number;
  token: typeof MEME_TOKENS[0];
  x: number;
  y: number;
  size: number;
  speed: number;
  opacity: number;
  rotation: number;
}

export const MemeTokenAnimation = () => {
  const [particles, setParticles] = useState<TokenParticle[]>([]);

  useEffect(() => {
    // Initialize particles
    const initialParticles: TokenParticle[] = MEME_TOKENS.map((token, index) => ({
      id: index,
      token,
      x: Math.random() * 100,
      y: Math.random() * 100,
      size: Math.random() * 40 + 40,
      speed: Math.random() * 0.5 + 0.2,
      opacity: Math.random() * 0.3 + 0.4,
      rotation: Math.random() * 360,
    }));

    setParticles(initialParticles);

    // Animate particles
    const interval = setInterval(() => {
      setParticles((prev) =>
        prev.map((particle) => ({
          ...particle,
          y: (particle.y + particle.speed) % 110,
          x: particle.x + Math.sin(Date.now() / 1000 + particle.id) * 0.2,
          rotation: (particle.rotation + 0.5) % 360,
          opacity:
            0.4 + Math.sin(Date.now() / 1000 + particle.id) * 0.2,
        }))
      );
    }, 50);

    return () => clearInterval(interval);
  }, []);

  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none">
      {particles.map((particle) => (
        <div
          key={particle.id}
          className="absolute transition-all duration-100 ease-linear"
          style={{
            left: `${particle.x}%`,
            top: `${particle.y}%`,
            fontSize: `${particle.size}px`,
            opacity: particle.opacity,
            transform: `rotate(${particle.rotation}deg)`,
            filter: `drop-shadow(0 0 8px ${particle.token.color}40)`,
          }}
        >
          <div className="relative">
            <span className="block animate-pulse">{particle.token.emoji}</span>
            <span
              className="absolute -bottom-1 left-1/2 -translate-x-1/2 text-xs font-bold whitespace-nowrap"
              style={{ color: particle.token.color }}
            >
              ${particle.token.name}
            </span>
          </div>
        </div>
      ))}
      
      {/* Gradient overlay to blend edges */}
      <div className="absolute inset-0 bg-gradient-to-b from-background via-transparent to-background pointer-events-none" />
    </div>
  );
};
