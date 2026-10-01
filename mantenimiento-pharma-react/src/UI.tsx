import type { ButtonHTMLAttributes, ReactNode } from "react";

export interface ButtonProps {
  children: ReactNode;
  variant?: "primary" | "secondary" | "link";
  onClick?: () => void;
  type?: ButtonHTMLAttributes<HTMLButtonElement>["type"];
  disabled?: boolean;
}

export interface CardProps {
  title?: string;
  action?: ReactNode;
  children: ReactNode;
  className?: string;
}

export interface FieldProps {
  label: string;
  value?: string | number;
  placeholder?: string;
  type?: string;
  onChange?: (value: string) => void;
  children?: ReactNode;
}

export interface PageHeaderProps {
  title: string;
  subtitle?: string;
  actions?: ReactNode;
}

export function Icon({ name }: { name: string }) {
  const icons: Record<string, string> = {
    home: "⌂", stock: "▣", alert: "⚠", wrench: "🔧", cart: "🛒", machine: "⚙",
    report: "▤", settings: "⚙", scan: "▦", incident: "!", camera: "▧", user: "●",
    search: "⌕", plus: "+", close: "×", mail: "✉", calendar: "▣"
  };
  return <span className="icon" aria-hidden="true">{icons[name] ?? "•"}</span>;
}

export function Badge({ children, tone = "neutral" }: { children: ReactNode; tone?: string }) {
  return <span className={`badge ${tone}`}>{children}</span>;
}

export function Button({ children, variant = "primary", onClick, type = "button", disabled = false }: ButtonProps) {
  return <button type={type} className={`btn ${variant}`} onClick={onClick} disabled={disabled}>{children}</button>;
}

export function Card({ title, action, children, className = "" }: CardProps) {
  return <section className={`card ${className}`}>
    {(title || action) && <div className="card-head"><h3>{title}</h3>{action}</div>}
    {children}
  </section>;
}

export function Field({ label, value, placeholder, type = "text", onChange, children }: FieldProps) {
  return <label className="field"><span>{label}</span>{children || <input type={type} value={value ?? ""} placeholder={placeholder} onChange={event => onChange?.(event.target.value)} />}</label>;
}

export function PageHeader({ title, subtitle, actions }: PageHeaderProps) {
  return <div className="page-header"><div><h1>{title}</h1>{subtitle && <p>{subtitle}</p>}</div><div className="page-actions">{actions}</div></div>;
}

export function KPI({ label, value, icon, tone = "" }: { label: string; value: ReactNode; icon?: ReactNode; tone?: string }) {
  return <div className={`kpi ${tone}`}><div className="kpi-icon">{icon}</div><div><small>{label}</small><strong>{value}</strong></div></div>;
}