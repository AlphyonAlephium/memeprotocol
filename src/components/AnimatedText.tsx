import { useEffect, useState } from "react";

interface AnimatedTextProps {
  text: string;
  className?: string;
}

export const AnimatedText = ({ text, className = "" }: AnimatedTextProps) => {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    setIsVisible(true);
  }, []);

  const words = text.split(" ");

  return (
    <span className={className}>
      {words.map((word, wordIndex) => (
        <span key={wordIndex} className="inline-block">
          {word.split("").map((char, charIndex) => (
            <span
              key={`${wordIndex}-${charIndex}`}
              className="inline-block animate-fade-in"
              style={{
                animationDelay: `${(wordIndex * word.length + charIndex) * 0.03}s`,
                animationFillMode: "both",
                opacity: 0,
              }}
            >
              {char}
            </span>
          ))}
          {wordIndex < words.length - 1 && (
            <span className="inline-block">&nbsp;</span>
          )}
        </span>
      ))}
    </span>
  );
};
