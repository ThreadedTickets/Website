import React, { useEffect, useState, ReactNode } from "react";
import {
  useFloating,
  offset,
  flip,
  shift,
  autoUpdate,
} from "@floating-ui/react-dom";
import { createPortal } from "react-dom";
import { FaInfoCircle } from "react-icons/fa";

interface InfoTooltipProps {
  trigger?: ReactNode;
  children: ReactNode;
  className?: string;
  tooltipClassName?: string;
}

const InfoTooltip: React.FC<InfoTooltipProps> = ({
  trigger,
  children,
  className = "",
  tooltipClassName = "",
}) => {
  const [isOpen, setIsOpen] = useState(false);

  const { x, y, strategy, refs, update } = useFloating({
    placement: "top",
    middleware: [offset(8), flip(), shift({ padding: 8 })],
    whileElementsMounted: autoUpdate,
  });

  useEffect(() => {
    if (isOpen) update();
  }, [isOpen, update]);

  return (
    <>
      <span
        ref={refs.setReference}
        onMouseEnter={() => setIsOpen(true)}
        onMouseLeave={() => setIsOpen(false)}
        className={`inline-flex items-center cursor-pointer ${className}`}
      >
        {trigger ?? <FaInfoCircle className="text-accent" />}
      </span>

      {isOpen &&
        createPortal(
          <div
            ref={refs.setFloating}
            style={{
              position: strategy,
              top: y ?? 0,
              left: x ?? 0,
              zIndex: 9999,
            }}
            className={`bg-foreground text-text px-3 py-1 rounded text-sm shadow-[0_0_15px_3px_var(--color-accent)] ${tooltipClassName}`}
          >
            {children}
          </div>,
          document.body
        )}
    </>
  );
};

export default InfoTooltip;
