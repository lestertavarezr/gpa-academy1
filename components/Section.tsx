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
  align = "left",
}: {
  eyebrow?: string;
  title: React.ReactNode;
  description?: string;
  align?: "center" | "left";
}) {
  const centered = align === "center";

  return (
    <div
      className={clsx(
        "mb-14 max-w-2xl",
        centered ? "mx-auto text-center" : "text-left"
      )}
    >
      {eyebrow && (
        <span
          className={clsx("kicker", centered && "justify-center")}
        >
          {eyebrow}
        </span>
      )}
      <h2 className="mt-4 text-balance font-display text-3xl font-semibold leading-[1.12] tracking-tight text-white md:text-4xl lg:text-[2.75rem]">
        {title}
      </h2>
      {description && (
        <p className="mt-5 max-w-xl text-[15.5px] leading-relaxed text-white/55">
          {description}
        </p>
      )}
    </div>
  );
}
