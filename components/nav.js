'use client';
import Link from 'next/link';
import { CiStreamOn } from "react-icons/ci";
import { BsFiletypePdf } from "react-icons/bs";
import { BiHomeAlt2 } from "react-icons/bi";
import { IoTvOutline } from "react-icons/io5";
import { usePathname } from "next/navigation";

const menu = [
  { name: "Home",  icon: BiHomeAlt2,     link: "/mobile" },
  { name: "Ecopy", icon: BsFiletypePdf,  link: "/ecopy"  },
  { name: "TV",    icon: IoTvOutline,    link: "/video"  },
  { name: "Live",  icon: CiStreamOn,     link: "/stream" },
];

export default function Navbar() {
  const pathname = usePathname();

  return (
    <nav className="fixed bottom-0 left-0 z-50 w-full border-t border-black/10 bg-white/95 px-3 pb-[calc(env(safe-area-inset-bottom)+0.75rem)] pt-2 shadow-[0_-14px_40px_rgba(15,23,42,0.10)] backdrop-blur dark:border-white/10 dark:bg-[#090b10]/95 dark:shadow-[0_-14px_40px_rgba(0,0,0,0.45)]">
      <div className="mx-auto grid max-w-md grid-cols-4 gap-1">
        {menu.map((item) => {
          const isActive = pathname === item.link || pathname?.startsWith(`${item.link}/`);
          return (
            <Link
              key={item.link}
              href={item.link}
              className={`flex min-h-14 flex-col items-center justify-center gap-1 rounded-lg text-[11px] font-semibold transition-colors ${
                isActive
                  ? " text-red-700"
                  : "text-neutral-500 hover:bg-neutral-100 hover:text-neutral-950 dark:text-neutral-400 dark:hover:bg-white/10 dark:hover:text-white"
              }`}
              aria-label={item.name}
            >
              <item.icon className="h-6 w-6" aria-hidden="true" />
              <span>{item.name}</span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
