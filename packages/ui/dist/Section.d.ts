import * as React from "react";
type SectionProps = React.HTMLAttributes<HTMLElement> & {
    title?: string;
    subtitle?: string;
};
export declare function Section({ title, subtitle, children, className, ...rest }: SectionProps): import("react/jsx-runtime").JSX.Element;
export {};
