import React from "react";

interface AvatarProps {
  src?: string;
  name: string;
  size?: "sm" | "md" | "lg";
  className?: string;
}

export default function Avatar({ src, name, size = "md", className = "" }: AvatarProps) {
  const getInitials = (nameStr: string) => {
    return nameStr
      .split(" ")
      .map((part) => part[0])
      .join("")
      .substring(0, 2)
      .toUpperCase();
  };

  const sizes = {
    sm: "w-8 h-8 text-xs",
    md: "w-10 h-10 text-sm",
    lg: "w-16 h-16 text-xl",
  };

  const baseStyle = "relative flex shrink-0 items-center justify-center rounded-full overflow-hidden border border-[#3a494b]/30 bg-[#1f2022] font-semibold text-[#b9cacb]";

  if (src) {
    return (
      <img
        src={src}
        alt={name}
        className={`${baseStyle} ${sizes[size]} object-cover ${className}`}
        referrerPolicy="no-referrer"
      />
    );
  }

  return (
    <div className={`${baseStyle} ${sizes[size]} ${className}`}>
      {getInitials(name)}
    </div>
  );
}
