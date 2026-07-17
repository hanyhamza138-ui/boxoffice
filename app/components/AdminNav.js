"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

export default function AdminNav() {
  const pathname = usePathname();

  const links = [
    { href: "/admin", label: "🏠 Admin" },
    { href: "/admin/dashboard", label: "📊 Dashboard" },
    { href: "/admin/analytics", label: "📈 Analytics" },
    { href: "/admin/work-day", label: "📅 Work Day" },
    { href: "/admin/reports", label: "📑 Reports" },
    { href: "/admin/cinemas", label: "🏢 Cinemas" },
  ];

  return (
    <div
      style={{
        display: "flex",
        gap: 12,
        flexWrap: "wrap",
        marginBottom: 25,
        padding: 16,
        background: "#0f172a",
        border: "1px solid #334155",
        borderRadius: 16,
      }}
    >
      {links.map((link) => {
        const active = pathname === link.href;

        return (
          <Link
            key={link.href}
            href={link.href}
            style={{
              textDecoration: "none",
            }}
          >
            <div
              style={{
                padding: "10px 18px",
                borderRadius: 10,
                fontWeight: 700,
                transition: "0.2s",
                background: active ? "#FFD54A" : "#1e293b",
                color: active ? "#111" : "#fff",
                border: active
                  ? "1px solid #FFD54A"
                  : "1px solid #334155",
              }}
            >
              {link.label}
            </div>
          </Link>
        );
      })}
    </div>
  );
}