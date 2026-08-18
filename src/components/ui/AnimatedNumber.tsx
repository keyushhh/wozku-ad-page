import { useEffect, useRef, useState } from "react";
import { animate, useReducedMotion } from "framer-motion";

interface AnimatedNumberProps {
  value: number;
  format?: (value: number) => string;
  className?: string;
}

export function AnimatedNumber({
  value,
  format = (n) => n.toLocaleString("en-US"),
  className = "",
}: AnimatedNumberProps) {
  const prefersReducedMotion = useReducedMotion();
  const [display, setDisplay] = useState(value);
  const previous = useRef(value);

  useEffect(() => {
    if (prefersReducedMotion) {
      setDisplay(value);
      previous.current = value;
      return;
    }

    const controls = animate(previous.current, value, {
      duration: 0.55,
      ease: [0.16, 1, 0.3, 1],
      onUpdate: (latest) => setDisplay(latest),
    });

    previous.current = value;
    return () => controls.stop();
  }, [value, prefersReducedMotion]);

  return <span className={className}>{format(display)}</span>;
}
