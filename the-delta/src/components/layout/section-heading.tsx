interface SectionHeadingProps {
  number: string;
  title: string;
  subtitle?: string;
}

export function SectionHeading({
  number,
  title,
  subtitle,
}: SectionHeadingProps) {
  return (
    <div className="mb-6 flex items-baseline gap-3">
      <span className="font-mono text-sm font-semibold tracking-wider text-muted-foreground/50">
        {number}
      </span>
      <div>
        <h2 className="font-mono text-lg font-semibold uppercase tracking-wider">
          {title}
        </h2>
        {subtitle && (
          <p className="mt-0.5 text-sm text-muted-foreground">{subtitle}</p>
        )}
      </div>
    </div>
  );
}
