import React, { useEffect } from "react";
import { motion, useMotionValue, animate } from "framer-motion";

interface RollingNumberDigitProps {
  digit: number;
  digitHeight: number;
}

const RollingNumberDigit: React.FC<RollingNumberDigitProps> = ({
  digit,
  digitHeight,
}) => {
  const y = useMotionValue(0);

  useEffect(() => {
    const targetY = -digitHeight * digit;
    const controls = animate(y, targetY, {
      type: "spring",
      stiffness: 200,
      damping: 25,
      delay: 0.75,
    });

    return controls.stop;
  }, [digit, y, digitHeight]);

  // Render digits 0-9 repeated
  const digits = [...Array(20).keys()].map((i) => i % 10);

  return (
    <div
      style={{
        overflow: "hidden",
        height: digitHeight,
        width: 20,
        fontSize: 30,
        fontWeight: "bold",
        textAlign: "center",
        userSelect: "none",
      }}
    >
      <motion.div style={{ y }}>
        {digits.map((num, idx) => (
          <div
            key={idx}
            style={{
              height: digitHeight,
              lineHeight: `${digitHeight}px`,
            }}
          >
            {num}
          </div>
        ))}
      </motion.div>
    </div>
  );
};

interface RollingNumberProps {
  number: number;
  digitHeight?: number;
}

export const RollingNumber: React.FC<RollingNumberProps> = ({
  number,
  digitHeight = 40,
}) => {
  // Convert number to string then array of digits
  const digits = number.toString().split("").map(Number);

  return (
    <div style={{ display: "flex" }}>
      {digits.map((digit, idx) => (
        <RollingNumberDigit key={idx} digit={digit} digitHeight={digitHeight} />
      ))}
    </div>
  );
};