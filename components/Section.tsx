import { clsx } from "clsx";

export function Section({
  id,
  className,
  children,
}: {
  id?: string;
  className?: string;
  children: React.ReactNode;
}) {
  return (
    <section
      id={id}
      className={clsx("relative px-6 py-20 md:py-28", className)}
    >
      <div className="mx-auto max-w-7xl">{children}</div>
    </section>
  );
}

export function SectionHeading({
  eyebrow,
  title,
  description,
  align = "center",
}: {
  eyebrow?: string;
  title: React.ReactNode;
  description?: string;
  align?: "center" | "left";
}) {
  return (
    <div
      className={clsx(
        "mx-auto mb-14 max-w-3xl",
        align === "center" ? "text-center" : "text-left mx-0"
      )}
    >
      {eyebrow && <span className="section-label mb-4">{eyebrow}</span>}
      <h2 className="mt-4 text-3xl font-bold tracking-tight text-white md:text-4xl lg:text-5xl">
        {title}
      </h2>
      {description && (
        <p className="mt-5 text-lg leading-relaxed text-white/60">
          {description}
        </p>
      )}
    </div>
  );
}
