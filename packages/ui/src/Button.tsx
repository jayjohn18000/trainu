import * as React from "react";

type ButtonProps = React.ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: "default" | "outline";
};

export function Button({ variant = "default", className = "", ...props }: ButtonProps) {
  const base = "inline-flex items-center justify-center rounded-lg px-4 py-2 text-sm font-medium transition";
  const styles = variant === "outline"
    ? "border bg-white hover:bg-gray-50"
    : "border border-transparent bg-black text-white hover:bg-neutral-900";
  return <button className={`${base} ${styles} ${className}`} {...props} />;
}
