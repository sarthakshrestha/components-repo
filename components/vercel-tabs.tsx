import * as React from "react";
import { useState, useRef, useEffect, useMemo } from "react";
import { cn } from "@/lib/utils";
import { AnimatePresence, MotionConfig, motion } from "framer-motion";
import useMeasure from "react-use-measure";

interface Tab {
  id: string;
  label: string | React.ReactNode;
  content?: React.ReactNode;
}

interface TabsProps extends React.HTMLAttributes<HTMLDivElement> {
  tabs: Tab[];
  activeTab?: string;
  onTabChange?: (tabId: string) => void;
}

const VercelTabs = React.forwardRef<HTMLDivElement, TabsProps>(
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  ({ className, tabs, activeTab, onTabChange, ...props }, ref) => {
    const [hoveredIndex, setHoveredIndex] = useState<number | null>(null);
    const [activeIndex, setActiveIndex] = useState(() => {
      if (activeTab) {
        const index = tabs.findIndex((t) => t.id === activeTab);
        return index !== -1 ? index : 0;
      }
      return 0;
    });
    const [direction, setDirection] = useState(0);
    const [isAnimating, setIsAnimating] = useState(false);
    const [hoverStyle, setHoverStyle] = useState({});
    const [activeStyle, setActiveStyle] = useState({
      left: "0px",
      width: "0px",
    });
    const tabRefs = useRef<(HTMLDivElement | null)[]>([]);
    const [contentRef, bounds] = useMeasure();

    const content = useMemo(() => {
      const activeTabContent = tabs[activeIndex]?.content;
      return activeTabContent || null;
    }, [activeIndex, tabs]);

    useEffect(() => {
      if (activeTab) {
        const index = tabs.findIndex((t) => t.id === activeTab);
        if (index !== -1 && index !== activeIndex) {
          const newDirection = index > activeIndex ? 1 : -1;
          setDirection(newDirection);
          setActiveIndex(index);
        }
      }
    }, [activeTab, tabs]);

    useEffect(() => {
      if (hoveredIndex !== null) {
        const hoveredElement = tabRefs.current[hoveredIndex];
        if (hoveredElement) {
          const { offsetLeft, offsetWidth } = hoveredElement;
          setHoverStyle({
            left: `${offsetLeft}px`,
            width: `${offsetWidth}px`,
          });
        }
      }
    }, [hoveredIndex]);

    useEffect(() => {
      const updateActiveBar = () => {
        const activeElement = tabRefs.current[activeIndex];
        if (activeElement) {
          const { offsetLeft, offsetWidth } = activeElement;
          setActiveStyle({
            left: `${offsetLeft}px`,
            width: `${offsetWidth}px`,
          });
        }
      };

      // Run immediately
      updateActiveBar();

      // Run after a small delay to ensure layout is stable
      const timeoutId = setTimeout(updateActiveBar, 50);

      // Also use requestAnimationFrame
      requestAnimationFrame(updateActiveBar);

      return () => clearTimeout(timeoutId);
    }, [activeIndex, tabs]);

    const handleTabClick = (index: number, tabId: string) => {
      if (index !== activeIndex && !isAnimating) {
        const newDirection = index > activeIndex ? 1 : -1;
        setDirection(newDirection);
        setActiveIndex(index);
        onTabChange?.(tabId);
      }
    };

    const variants = {
      initial: (direction: number) => ({
        x: 300 * direction,
        opacity: 0,
        filter: "blur(4px)",
      }),
      active: {
        x: 0,
        opacity: 1,
        filter: "blur(0px)",
      },
      exit: (direction: number) => ({
        x: -300 * direction,
        opacity: 0,
        filter: "blur(4px)",
      }),
    };

    return (
      <div ref={ref} className={cn("w-full", className)} {...props}>
        <div className="relative overflow-x-auto scrollbar-hide">
          {/* Hover Highlight */}
          <div
            className="absolute h-[30px] max-sm:h-[28px] transition-all duration-300 ease-out bg-[#0e0f1114] dark:bg-[#ffffff1a] rounded-[6px] flex items-center"
            style={{
              ...hoverStyle,
              opacity: hoveredIndex !== null ? 1 : 0,
            }}
          />

          {/* Active Indicator (bottom border) */}
          <div
            className="absolute bottom-0 h-[2px] bg-[#0e0f11] dark:bg-white transition-all duration-300 ease-out"
            style={activeStyle}
          />

          {/* Tabs */}
          <div className="relative flex space-x-[6px] max-sm:space-x-[4px] items-center min-w-max pb-2">
            {tabs.map((tab, index) => (
              <div
                key={tab.id}
                ref={(el) => {
                  tabRefs.current[index] = el;
                }}
                className={cn(
                  "px-3 max-sm:px-2 py-2 max-sm:py-1.5 cursor-pointer transition-colors duration-300 h-[30px] max-sm:h-[28px]",
                  index === activeIndex
                    ? "text-[#0e0e10] dark:text-white"
                    : "text-[#0e0f1199] dark:text-[#ffffff99]"
                )}
                onMouseEnter={() => setHoveredIndex(index)}
                onMouseLeave={() => setHoveredIndex(null)}
                onClick={() => handleTabClick(index, tab.id)}
              >
                <div className="text-sm max-sm:text-xs font-medium leading-5 max-sm:leading-4 whitespace-nowrap flex items-center justify-center h-full">
                  {tab.label}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Animated Content */}
        {content && (
          <MotionConfig
            transition={{ duration: 0.4, type: "spring", bounce: 0.2 }}
          >
            <motion.div
              className="relative w-full overflow-hidden"
              initial={false}
              animate={{ height: bounds.height }}
            >
              <div className="pt-4" ref={contentRef}>
                <AnimatePresence
                  custom={direction}
                  mode="popLayout"
                  onExitComplete={() => setIsAnimating(false)}
                >
                  <motion.div
                    key={activeIndex}
                    variants={variants}
                    initial="initial"
                    animate="active"
                    exit="exit"
                    custom={direction}
                    onAnimationStart={() => setIsAnimating(true)}
                    onAnimationComplete={() => setIsAnimating(false)}
                  >
                    {content}
                  </motion.div>
                </AnimatePresence>
              </div>
            </motion.div>
          </MotionConfig>
        )}
      </div>
    );
  }
);
VercelTabs.displayName = "Tabs";

export { VercelTabs };
