"use client";

import { Toaster as Sonner, ToasterProps } from "sonner";

const Toaster = ({ ...props }: ToasterProps) => {
  return (
    <Sonner
      theme="light"
      className="toaster group"
      style={
        {
          "--normal-bg": "hsl(var(--popover))",
          "--normal-text": "hsl(var(--popover-foreground))",
          "--normal-border": "hsl(var(--border))",
          "--success-bg": "hsl(173 58% 39%)",
          "--success-text": "hsl(210 40% 98%)",
          "--error-bg": "hsl(var(--destructive))",
          "--error-text": "hsl(var(--destructive-foreground))",
          "--warning-bg": "hsl(43 74% 66%)",
          "--warning-text": "hsl(222.2 84% 4.9%)",
        } as React.CSSProperties
      }
      {...props}
    />
  );
};

export { Toaster };
