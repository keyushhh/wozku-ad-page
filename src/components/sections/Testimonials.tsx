import { useState, useRef, useCallback } from "react";
import { motion, useMotionValue, useTransform, animate, useReducedMotion } from "framer-motion";
import { testimonials } from "../../data/testimonials";
import { SectionHeading } from "../ui/SectionHeading";

// ──────────────────────────────────────────────────────
// Sticky-note colour palette (one per testimonial index)
// ──────────────────────────────────────────────────────
const NOTE_COLORS = [
  { bg: "#fef9c3", shadow: "#fde68a", fold: "#fde047", backBg: "#fef08a" }, // yellow
  { bg: "#dcfce7", shadow: "#bbf7d0", fold: "#86efac", backBg: "#d1fae5" }, // green
  { bg: "#fce7f3", shadow: "#fbcfe8", fold: "#f9a8d4", backBg: "#fce7f3" }, // pink
];

const PEEL_SIZE = 80;        // px - side length of the peeled corner triangle
const DRAG_THRESHOLD = 120;  // px - drag distance to trigger advance

// ──────────────────────────────────────────────────────
// Types
// ──────────────────────────────────────────────────────
interface PeelCornerProps {
  color: typeof NOTE_COLORS[0];
  onPeelComplete: () => void;
}

// ──────────────────────────────────────────────────────
// Peel corner - the interactive lifting flap
// ──────────────────────────────────────────────────────
function PeelCorner({ color, onPeelComplete }: PeelCornerProps) {
  const dragX = useMotionValue(0);
  const dragY = useMotionValue(0);
  const isDragging = useRef(false);
  const prefersReducedMotion = useReducedMotion();

  // Peel progress: 0 = flat, 1 = fully peeled
  const progress = useTransform(
    [dragX, dragY],
    ([x, y]: number[]) => {
      const dist = Math.sqrt(x * x + y * y);
      return Math.min(dist / DRAG_THRESHOLD, 1);
    }
  );

  // The flap grows as you drag
  const flapSize = useTransform(progress, [0, 1], [PEEL_SIZE, PEEL_SIZE * 2.8]);

  // Fold shadow depth
  const shadowOpacity = useTransform(progress, [0, 0.5, 1], [0, 0.25, 0.45]);

  // The fold triangle's "curl" 3-D rotation
  const foldRotate = useTransform(progress, [0, 1], [0, -160]);

  const handleDragStart = useCallback(() => {
    isDragging.current = true;
  }, []);

  const handleDragEnd = useCallback(async () => {
    isDragging.current = false;
    const px = dragX.get();
    const py = dragY.get();
    const dist = Math.sqrt(px * px + py * py);

    if (dist >= DRAG_THRESHOLD * 0.55) {
      // Animate to fully peeled off
      if (!prefersReducedMotion) {
        await Promise.all([
          animate(dragX, -340, { duration: 0.45, ease: [0.4, 0, 0.2, 1] }),
          animate(dragY, 220, { duration: 0.45, ease: [0.4, 0, 0.2, 1] }),
        ]);
      }
      onPeelComplete();
      // Reset drag values
      dragX.set(0);
      dragY.set(0);
    } else {
      // Snap back
      await Promise.all([
        animate(dragX, 0, { type: "spring", stiffness: 400, damping: 30 }),
        animate(dragY, 0, { type: "spring", stiffness: 400, damping: 30 }),
      ]);
    }
  }, [dragX, dragY, onPeelComplete, prefersReducedMotion]);

  return (
    <div
      style={{
        position: "absolute",
        bottom: 0,
        right: 0,
        width: PEEL_SIZE * 3,
        height: PEEL_SIZE * 3,
        zIndex: 10,
        cursor: "grab",
      }}
    >
      {/* Shadow cast by the lifted flap */}
      <motion.div
        style={{
          position: "absolute",
          bottom: 0,
          right: 0,
          width: flapSize,
          height: flapSize,
          background: `linear-gradient(135deg, transparent 50%, rgba(0,0,0,0.18) 50%)`,
          filter: "blur(6px)",
          opacity: shadowOpacity,
          borderRadius: "0 0 4px 0",
          pointerEvents: "none",
        }}
      />

      {/* The curling flap itself */}
      <motion.div
        drag
        dragConstraints={{ left: -340, right: 0, top: -220, bottom: 0 }}
        dragElastic={0.08}
        onDragStart={handleDragStart}
        onDragEnd={handleDragEnd}
        style={{
          x: dragX,
          y: dragY,
          position: "absolute",
          bottom: 0,
          right: 0,
          width: flapSize,
          height: flapSize,
          cursor: "grab",
          transformOrigin: "bottom right",
          perspective: 600,
        }}
        whileTap={{ cursor: "grabbing" }}
      >
        {/* Outer triangle - the back face of the fold */}
        <motion.div
          style={{
            position: "absolute",
            bottom: 0,
            right: 0,
            width: "100%",
            height: "100%",
            clipPath: "polygon(100% 0, 100% 100%, 0 100%)",
            background: `linear-gradient(135deg, ${color.fold}99, ${color.backBg})`,
            transformOrigin: "bottom right",
            rotateY: foldRotate,
            boxShadow: `inset -3px -3px 6px rgba(0,0,0,0.1)`,
          }}
        />
        {/* Fold edge line - the shiny crease */}
        <motion.div
          style={{
            position: "absolute",
            bottom: 0,
            right: 0,
            width: "100%",
            height: "100%",
            clipPath: "polygon(100% 0, 100% 100%, 0 100%)",
            background:
              "linear-gradient(135deg, transparent 48%, rgba(255,255,255,0.6) 50%, transparent 52%)",
            pointerEvents: "none",
          }}
        />
      </motion.div>

      {/* Invisible drag-handle overlay in the corner (larger hit target) */}
      <motion.div
        drag
        dragConstraints={{ left: -340, right: 0, top: -220, bottom: 0 }}
        dragElastic={0.08}
        onDragStart={handleDragStart}
        onDragEnd={handleDragEnd}
        style={{
          x: dragX,
          y: dragY,
          position: "absolute",
          bottom: 0,
          right: 0,
          width: PEEL_SIZE,
          height: PEEL_SIZE,
          clipPath: "polygon(100% 0, 100% 100%, 0 100%)",
          opacity: 0,
          cursor: "grab",
        }}
        whileTap={{ cursor: "grabbing" }}
      />
    </div>
  );
}

// ──────────────────────────────────────────────────────
// Sticky Note card
// ──────────────────────────────────────────────────────
interface StickyNoteProps {
  index: number;
  totalCount: number;
  isTop: boolean;
  colorIndex: number;
  quote: string;
  author: string;
  title: string;
  company: string;
  metric: string;
  onPeelComplete: () => void;
}

function StickyNote({
  index,
  totalCount,
  isTop,
  colorIndex,
  quote,
  author,
  title,
  company,
  metric,
  onPeelComplete,
}: StickyNoteProps) {
  const color = NOTE_COLORS[colorIndex % NOTE_COLORS.length];
  // Cards beneath the top are slightly rotated and offset to create a stack effect
  const stackOffset = totalCount - 1 - index;
  const rotate = isTop ? 0 : (stackOffset % 2 === 0 ? -1.8 : 1.8) * stackOffset * 0.6;
  const translateY = isTop ? 0 : stackOffset * 4;
  const scale = isTop ? 1 : 1 - stackOffset * 0.02;

  return (
    <motion.div
      initial={false}
      animate={{
        rotate,
        y: translateY,
        scale,
        zIndex: index,
      }}
      transition={{ type: "spring", stiffness: 300, damping: 28 }}
      style={{
        position: "absolute",
        inset: 0,
        background: color.bg,
        borderRadius: 16,
        boxShadow: isTop
          ? `0 8px 32px rgba(0,0,0,0.13), 0 2px 8px rgba(0,0,0,0.08)`
          : `0 2px 8px rgba(0,0,0,0.07)`,
        padding: "36px 36px 48px",
        display: "flex",
        flexDirection: "column",
        justifyContent: "space-between",
        overflow: "hidden",
      }}
    >
      {/* Ruled lines decoration */}
      <div
        style={{
          position: "absolute",
          inset: 0,
          backgroundImage: `repeating-linear-gradient(transparent, transparent 27px, ${color.shadow}55 28px)`,
          backgroundPositionY: 64,
          pointerEvents: "none",
          borderRadius: 16,
        }}
      />

      {/* Quote mark */}
      <div
        style={{
          position: "absolute",
          top: 18,
          left: 28,
          fontSize: 72,
          lineHeight: 1,
          fontFamily: "Georgia, serif",
          color: color.fold,
          opacity: 0.6,
          userSelect: "none",
          pointerEvents: "none",
        }}
      >
        "
      </div>

      {/* Content */}
      <div style={{ position: "relative", zIndex: 1 }}>
        <p
          style={{
            marginTop: 20,
            fontSize: "clamp(1rem, 2vw, 1.2rem)",
            lineHeight: 1.65,
            fontWeight: 500,
            color: "#1a1a1a",
            fontFamily: "inherit",
          }}
        >
          {quote}
        </p>
      </div>

      <div
        style={{
          position: "relative",
          zIndex: 1,
          borderTop: `1.5px solid ${color.shadow}`,
          paddingTop: 16,
          marginTop: 24,
        }}
      >
        <p style={{ fontWeight: 700, fontSize: "0.95rem", color: "#111" }}>{author}</p>
        <p style={{ fontSize: "0.8rem", color: "#555", marginTop: 2 }}>
          {title}, {company}
        </p>
        <p
          style={{
            marginTop: 8,
            fontFamily: "monospace",
            fontSize: "0.7rem",
            textTransform: "uppercase",
            letterSpacing: "0.08em",
            color: "#059669",
            fontWeight: 600,
          }}
        >
          {metric}
        </p>
      </div>

      {/* Peel corner - only on top card */}
      {isTop && <PeelCorner color={color} onPeelComplete={onPeelComplete} />}

      {/* Peel hint label */}
      {isTop && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.8, duration: 0.5 }}
          style={{
            position: "absolute",
            bottom: 10,
            right: PEEL_SIZE + 8,
            fontSize: "0.65rem",
            textTransform: "uppercase",
            letterSpacing: "0.1em",
            color: "#888",
            userSelect: "none",
            pointerEvents: "none",
          }}
        >
          peel →
        </motion.div>
      )}
    </motion.div>
  );
}

// ──────────────────────────────────────────────────────
// Main Testimonials section
// ──────────────────────────────────────────────────────
export function Testimonials() {
  const [activeIndex, setActiveIndex] = useState(0);
  const [peeling, setPeeling] = useState(false);

  const handlePeelComplete = useCallback(() => {
    if (peeling) return;
    setPeeling(true);
    setActiveIndex((prev) => (prev + 1) % testimonials.length);
    setTimeout(() => setPeeling(false), 600);
  }, [peeling]);

  // Build a visible window of 3 cards (top + 2 beneath)
  const count = testimonials.length;
  const visibleCards = [0, 1, 2].map((offset) => ({
    testimonialIndex: (activeIndex + offset) % count,
    stackIndex: 2 - offset, // 2 = furthest back, 0 = front
    isTop: offset === 0,
  }));

  return (
    <section id="testimonials" className="py-20 sm:py-24">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <SectionHeading
          eyebrow="Testimonials"
          title="What teams say in demo reviews"
          description="Placeholder quotes structured for easy replacement with verified customer stories."
        />

        {/* Stack container */}
        <div
          style={{
            position: "relative",
            margin: "56px auto 0",
            maxWidth: 560,
            height: 380,
          }}
        >
          {visibleCards.map(({ testimonialIndex, stackIndex, isTop }) => {
            const t = testimonials[testimonialIndex];
            return (
              <StickyNote
                key={`${activeIndex}-${stackIndex}`}
                index={stackIndex}
                totalCount={3}
                isTop={isTop}
                colorIndex={testimonialIndex}
                quote={t.quote}
                author={t.author}
                title={t.title}
                company={t.company}
                metric={t.metric}
                onPeelComplete={handlePeelComplete}
              />
            );
          })}
        </div>

        {/* Dot navigation */}
        <div
          style={{
            display: "flex",
            justifyContent: "center",
            gap: 10,
            marginTop: 56,
          }}
        >
          {testimonials.map((_, i) => (
            <button
              key={i}
              type="button"
              aria-label={`Go to testimonial ${i + 1}`}
              onClick={() => setActiveIndex(i)}
              style={{
                width: i === activeIndex ? 24 : 8,
                height: 8,
                borderRadius: 4,
                border: "none",
                background: i === activeIndex ? "#059669" : "#d1d5db",
                cursor: "pointer",
                transition: "all 0.3s ease",
                padding: 0,
              }}
            />
          ))}
        </div>
      </div>
    </section>
  );
}
