interface EditorialRuleProps {
  variant?: "thick" | "thin" | "section";
  label?: string;
  className?: string;
}

export default function EditorialRule({
  variant = "thick",
  label,
  className = "",
}: EditorialRuleProps) {
  if (variant === "section" && label) {
    return (
      <div className={`relative ${className}`}>
        <hr className="editorial-rule" />
        <span className="absolute -top-3 left-0 bg-bg-primary px-2 font-mono text-xs tracking-widest uppercase text-text-tertiary">
          {label}
        </span>
      </div>
    );
  }

  return (
    <hr
      className={`${
        variant === "thick" ? "editorial-rule" : "editorial-rule-thin"
      } ${className}`}
    />
  );
}
