import type { ButtonHTMLAttributes, InputHTMLAttributes, ReactNode, SelectHTMLAttributes, TextareaHTMLAttributes } from 'react';
import { cx } from '../lib/styles';

type Tone = 'default' | 'primary' | 'success' | 'warning' | 'danger';

const toneClasses: Record<Tone, string> = {
  default: 'border-slate-800 bg-slate-900 text-slate-200',
  primary: 'border-blue-400/30 bg-blue-500/15 text-blue-100',
  success: 'border-emerald-400/30 bg-emerald-500/15 text-emerald-100',
  warning: 'border-amber-400/30 bg-amber-500/15 text-amber-100',
  danger: 'border-red-400/30 bg-red-500/15 text-red-100',
};

export function Card({
  children,
  className,
}: {
  children: ReactNode;
  className?: string;
}) {
  return (
    <section className={cx('rounded-xl border border-slate-800/80 bg-slate-900/80 p-3 shadow-md shadow-slate-950/10 backdrop-blur', className)}>
      {children}
    </section>
  );
}

export function Button({
  children,
  className,
  variant = 'primary',
  ...props
}: ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: 'primary' | 'secondary' | 'ghost' | 'danger' | 'success';
}) {
  const variants = {
    primary: 'bg-blue-600 text-white hover:bg-blue-500',
    secondary: 'border border-slate-700 bg-slate-900 text-slate-100 hover:bg-slate-800',
    ghost: 'text-slate-300 hover:bg-slate-900 hover:text-white',
    danger: 'border border-red-400/40 bg-red-500/10 text-red-100 hover:bg-red-500/20',
    success: 'bg-emerald-600 text-white hover:bg-emerald-500',
  };

  return (
    <button
      className={cx('inline-flex items-center justify-center gap-1.5 rounded-lg px-3 py-2 text-[11px] font-bold transition disabled:cursor-not-allowed disabled:opacity-50', variants[variant], className)}
      {...props}
    >
      {children}
    </button>
  );
}

export function Badge({
  children,
  tone = 'default',
  className,
}: {
  children: ReactNode;
  tone?: Tone;
  className?: string;
}) {
  return (
    <span className={cx('inline-flex items-center gap-1 rounded-full border px-2 py-0.5 text-[10px] font-bold', toneClasses[tone], className)}>
      {children}
    </span>
  );
}

export function PageHeader({
  eyebrow,
  title,
  description,
  action,
}: {
  eyebrow?: ReactNode;
  title: string;
  description: string;
  action?: ReactNode;
}) {
  return (
    <header className="overflow-hidden rounded-[2rem] border border-white/10 bg-[radial-gradient(circle_at_top_left,rgba(59,130,246,0.28),transparent_34%),linear-gradient(135deg,rgba(15,23,42,0.98),rgba(15,23,42,0.78))] p-6 shadow-2xl shadow-slate-950/40">
      <div className="flex flex-col justify-between gap-5 lg:flex-row lg:items-end">
        <div>
          {eyebrow && <div className="mb-3">{eyebrow}</div>}
          <h1 className="text-3xl font-black tracking-tight text-white sm:text-4xl">{title}</h1>
          <p className="mt-3 max-w-3xl text-sm leading-6 text-slate-300 sm:text-base">{description}</p>
        </div>
        {action}
      </div>
    </header>
  );
}

export function StatCard({
  icon,
  label,
  value,
  helper,
  tone = 'primary',
}: {
  icon: ReactNode;
  label: string;
  value: ReactNode;
  helper?: string;
  tone?: Tone;
}) {
  return (
    <Card>
      <div className={cx('mb-2 flex h-8 w-8 items-center justify-center rounded-lg border text-sm', toneClasses[tone])}>
        {icon}
      </div>
      <p className="text-xl font-black text-white">{value}</p>
      <p className="mt-0.5 text-[11px] font-medium text-slate-300">{label}</p>
      {helper && <p className="mt-1.5 text-[10px] text-slate-500">{helper}</p>}
    </Card>
  );
}

export function EmptyState({
  icon,
  title,
  description,
  action,
}: {
  icon?: ReactNode;
  title: string;
  description: string;
  action?: ReactNode;
}) {
  return (
    <div className="rounded-xl border border-dashed border-slate-700 bg-slate-950/50 p-4 text-center">
      {icon && <div className="mx-auto mb-2 flex h-8 w-8 items-center justify-center rounded-lg bg-slate-900 text-base text-slate-400">{icon}</div>}
      <h3 className="text-sm font-bold text-slate-100">{title}</h3>
      <p className="mx-auto mt-1.5 max-w-md text-xs leading-5 text-slate-400">{description}</p>
      {action && <div className="mt-5">{action}</div>}
    </div>
  );
}

export function Field({
  label,
  hint,
  children,
}: {
  label: string;
  hint?: string;
  children: ReactNode;
}) {
  return (
    <label className="block space-y-1">
      <span className="text-[11px] font-bold text-slate-300">{label}</span>
      {children}
      {hint && <span className="block text-[10px] text-slate-500">{hint}</span>}
    </label>
  );
}

const inputClassName =
  'w-full rounded-lg border border-slate-700 bg-slate-950/80 px-3 py-2 text-xs text-white outline-none transition placeholder:text-slate-600 focus:border-blue-400 focus:ring-4 focus:ring-blue-500/10';

export function Input({ className, ...props }: InputHTMLAttributes<HTMLInputElement>) {
  return <input className={cx(inputClassName, className)} {...props} />;
}

export function Textarea({ className, ...props }: TextareaHTMLAttributes<HTMLTextAreaElement>) {
  return <textarea className={cx(inputClassName, className)} {...props} />;
}

export function Select({ className, ...props }: SelectHTMLAttributes<HTMLSelectElement>) {
  return <select className={cx(inputClassName, className)} {...props} />;
}
