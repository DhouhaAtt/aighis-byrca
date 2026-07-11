"use client";

import { useState, useEffect, useCallback } from "react";
import { useRouter, usePathname } from "next/navigation";
import Link from "next/link";
import { LayoutDashboard, Package, ShoppingBag, LogOut, Menu, X, Tags } from "lucide-react";
import { useAdminAuth } from "../../context/AdminAuthContext";
import styles from "./AdminLayout.module.css";

const navLinks = [
  { href: "/admin/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { href: "/admin/dashboard/products", label: "Products", icon: Package },
  { href: "/admin/dashboard/categories", label: "Categories", icon: Tags },
  { href: "/admin/dashboard/orders", label: "Orders", icon: ShoppingBag },
];

export default function AdminDashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const router = useRouter();
  const pathname = usePathname();
  const { isAuthenticated, logout } = useAdminAuth();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  useEffect(() => {
    if (!isAuthenticated) {
      router.replace("/admin/login");
    }
  }, [isAuthenticated, router]);

  const handleLogout = useCallback(() => {
    logout();
    router.replace("/admin/login");
  }, [logout, router]);

  const getPageTitle = useCallback(() => {
    if (pathname === "/admin/dashboard") return "Dashboard";
    if (pathname.includes("/products")) return "Products";
    if (pathname.includes("/categories")) return "Categories";
    if (pathname.includes("/orders")) return "Orders";
    return "Dashboard";
  }, [pathname]);

  if (!isAuthenticated) return null;

  return (
    <div className={styles.layout}>
      {sidebarOpen && (
        <div
          className={styles.sidebarOverlay}
          onClick={() => setSidebarOpen(false)}
        />
      )}

      <aside className={`${styles.sidebar} ${sidebarOpen ? styles.sidebarOpen : ""}`}>
        <div className={styles.sidebarBrand}>
          <Link href="/admin/dashboard" className={styles.sidebarLogo}>
            Aighis Byrca
          </Link>
          <div className={styles.sidebarTagline}>Administration</div>
        </div>

        <nav className={styles.sidebarNav}>
          {navLinks.map(({ href, label, icon: Icon }) => (
            <Link
              key={href}
              href={href}
              className={`${styles.navItem} ${pathname === href ? styles.navItemActive : ""}`}
              onClick={() => setSidebarOpen(false)}
            >
              <span className={styles.navIcon}>
                <Icon size={18} strokeWidth={1.5} />
              </span>
              {label}
            </Link>
          ))}
        </nav>

        <div className={styles.sidebarFooter}>
          <button className={styles.logoutBtn} onClick={handleLogout}>
            <span className={styles.navIcon}>
              <LogOut size={18} strokeWidth={1.5} />
            </span>
            Sign Out
          </button>
        </div>
      </aside>

      <div className={styles.main}>
        <header className={styles.topBar}>
          <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
            <button
              className={styles.mobileToggle}
              onClick={() => setSidebarOpen(!sidebarOpen)}
            >
              {sidebarOpen ? <X size={22} /> : <Menu size={22} />}
            </button>
            <h1 className={styles.pageTitle}>{getPageTitle()}</h1>
          </div>
          <span className={styles.adminBadge}>Administrator</span>
        </header>

        <div className={styles.content}>{children}</div>
      </div>
    </div>
  );
}
