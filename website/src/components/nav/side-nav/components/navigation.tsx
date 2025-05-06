"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
import {
  HomeIcon,
  FolderOpenIcon,
  BookOpenIcon,
  ChevronDownIcon,
} from "lucide-react";
import { navigations } from "@/config/site";
import { cn } from "@/lib/utils";

export default function Navigation() {
  const pathname = usePathname();
  const [openSection, setOpenSection] = useState<string | null>(null);

  const toggleSection = (name: string) => {
    setOpenSection((prev) => (prev === name ? null : name));
  };

  return (
    <nav className="flex flex-grow flex-col gap-y-1 p-2">
      {navigations.map((nav) => {
        const Icon = nav.icon;
        const isActive = pathname === nav.href;
        const hasSubNav = Array.isArray(nav.subNav) && nav.subNav.length > 0;
        const isOpen = openSection === nav.name;

        return (
          <div key={nav.name}>
            {hasSubNav ? (
              <button
                onClick={() => toggleSection(nav.name)}
                className={cn(
                  "flex items-center justify-between w-full rounded-md px-2 py-1.5 hover:bg-slate-200 dark:hover:bg-slate-800",
                  isActive ? "bg-slate-200 dark:bg-slate-800" : "bg-transparent"
                )}
              >
                <div className="flex items-center">
                  <Icon size={16} className="mr-2 text-slate-800 dark:text-slate-200" />
                  <span className="text-sm text-slate-700 dark:text-slate-300">{nav.name}</span>
                </div>
                <ChevronDownIcon
                  className={cn(
                    "h-4 w-4 transform transition-transform",
                    isOpen ? "rotate-180" : "rotate-0"
                  )}
                />
              </button>
            ) : (
              <Link
                href={nav.href}
                className={cn(
                  "flex items-center rounded-md px-2 py-1.5 hover:bg-slate-200 dark:hover:bg-slate-800",
                  isActive ? "bg-slate-200 dark:bg-slate-800" : "bg-transparent"
                )}
              >
                <Icon size={16} className="mr-2 text-slate-800 dark:text-slate-200" />
                <span className="text-sm text-slate-700 dark:text-slate-300">{nav.name}</span>
              </Link>
            )}

            {hasSubNav && isOpen && (
              <div className="flex flex-col ml-6 mt-1">
                {nav.subNav!.map((sub) => (
                  <Link
                    key={sub.name}
                    href={sub.href}
                    className={cn(
                      "flex items-center rounded-md px-2 py-1.5 hover:bg-slate-200 dark:hover:bg-slate-800",
                      pathname === sub.href
                        ? "bg-slate-200 dark:bg-slate-800"
                        : "bg-transparent"
                    )}
                  >
                    {sub.icon && (
                      <sub.icon
                        size={16}
                        className="mr-2 text-slate-800 dark:text-slate-200"
                      />
                    )}
                    <span className="text-sm text-slate-700 dark:text-slate-300">
                      {sub.name}
                    </span>
                  </Link>
                ))}
              </div>
            )}
          </div>
        );
      })}
    </nav>
  );
}
