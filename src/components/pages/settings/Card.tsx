import { cn } from "@/lib/utils";

/** A titled block of settings. */
export function Card({
  id,
  title,
  description,
  action,
  className,
  children,
}: {
  id?: string;
  title: string;
  description?: string;
  action?: React.ReactNode;
  className?: string;
  children: React.ReactNode;
}) {
  return (
    <section id={id} className={cn("scroll-mt-20 rounded-2xl border border-gray-200 bg-white p-5 sm:p-6", className)}>
      <div className="mb-5 flex flex-wrap items-start justify-between gap-3">
        <div>
          <h2 className="text-base font-semibold text-gray-900">{title}</h2>
          {description && <p className="mt-0.5 text-[13px] text-gray-500">{description}</p>}
        </div>
        {action}
      </div>
      {children}
    </section>
  );
}
