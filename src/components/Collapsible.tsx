import { useRef, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ChevronRight } from "lucide-react";

export default function CollapsibleSection({
  title,
  children,
  defaultOpen = false,
}: {
  title: string;
  children: React.ReactNode;
  defaultOpen?: boolean;
}) {
  const [isOpen, setIsOpen] = useState(defaultOpen);
  const containerRef = useRef<HTMLDivElement>(null);

  const handleScrollIntoView = () => {
    if (!containerRef.current) return;
    const rect = containerRef.current.getBoundingClientRect();
    if (rect.bottom > window.innerHeight) {
      containerRef.current.scrollIntoView({ behavior: "smooth", block: "end" });
    }
  };

  return (
    <motion.div
      ref={containerRef}
      layout
      transition={{ layout: { duration: 0.4, ease: "easeInOut" } }}
      className="border border-foreground rounded-lg overflow-hidden"
    >
      <motion.button
        layout
        onClick={() => setIsOpen((prev) => !prev)}
        className="w-full flex items-center justify-between px-4 py-2 bg-foreground text-text transition-colors cursor-pointer"
        style={{
          borderBottomRightRadius: isOpen ? 0 : "var(--radius-lg)",
          borderBottomLeftRadius: isOpen ? 0 : "var(--radius-lg)",
        }}
      >
        <motion.span className="font-semibold text-left truncate">
          {title}
        </motion.span>
        <motion.div
          animate={{ rotate: isOpen ? 90 : 0 }}
          transition={{ duration: 0.3 }}
        >
          <ChevronRight size={20} />
        </motion.div>
      </motion.button>

      <AnimatePresence initial={false}>
        {isOpen && (
          <motion.div
            key="content"
            initial={{ height: 0, opacity: 0, y: -4 }}
            animate={{ height: "auto", opacity: 1, y: 0 }}
            exit={{ height: 0, opacity: 0, y: -4 }}
            transition={{ duration: 0.15, ease: "easeInOut" }}
            onAnimationComplete={handleScrollIntoView}
            className="overflow-hidden"
          >
            <div className="p-4">{children}</div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}
