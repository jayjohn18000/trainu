import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
export function Section({ title, subtitle, children, className = "", ...rest }) {
    return (_jsxs("section", { className: `space-y-2 ${className}`, ...rest, children: [title && _jsx("h2", { className: "text-xl font-semibold", children: title }), subtitle && _jsx("p", { className: "text-muted-foreground", children: subtitle }), children] }));
}
