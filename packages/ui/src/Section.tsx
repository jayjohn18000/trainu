import * as React from "react";

type SectionProps = React.HTMLAttributes<HTMLElement> & { title?: string; subtitle?: string };

export function Section({ title, subtitle, children, className = "", ...rest }: SectionProps) {
  return (
    <section className={`space-y-2 ${className}`} {...rest}>
      {title && <h2 className="text-xl font-semibold">{title}</h2>}
      {subtitle && <p className="text-muted-foreground">{subtitle}</p>}
      {children}
    </section>
  );
}
