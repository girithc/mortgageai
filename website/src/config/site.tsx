 import { 
  Gauge,              
  MessagesSquare,     
  BookOpenIcon,       
  type LucideIcon     
} from "lucide-react";

export type SiteConfig = typeof siteConfig;

export type Navigation = {
  icon: LucideIcon;
  name: string;
  href: string;
  subNav?: Navigation[];
};

export const siteConfig = {
  title: "Mortgage AI",
  description: "A mortgage calculator and loan management system",
};

export const navigations: Navigation[] = [
  {
    icon: MessagesSquare,
    name: "Applications",
    href: "/applications",
    subNav: [
      {
        icon: BookOpenIcon,
        name: "Loan Details",
        href: "/loan-details",
      },
    ],
  },
  {
    icon: Gauge,
    name: "Rate Sheet",
    href: "/rate-sheet",
  },
  {
    icon: MessagesSquare,
    name: "Profile",
    href: "/profile",
  },
  {
    icon: MessagesSquare,
    name: "Authentication",
    href: "/auth",
  },
];
