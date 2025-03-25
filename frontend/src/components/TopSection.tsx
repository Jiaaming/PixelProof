// src/components/TopSection.tsx
import React from "react";

interface TopSectionProps {
  height: string;
  onHover: (section: "top" | "none") => void;
}

export default function TopSection({ height, onHover }: TopSectionProps) {
  return (
    <section
      style={{ height, backgroundImage: `url('/bg2.jpeg')` }}
      className="transition-all duration-500 ease-in-out relative bg-cover bg-center"
      onMouseEnter={() => onHover("top")}
      onMouseLeave={() => onHover("none")}
    >
      <div className="absolute inset-0 bg-black/20" />
    </section>
  );
}
