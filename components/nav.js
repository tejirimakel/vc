'use client';
import { CiStreamOn } from "react-icons/ci";
import { BsFiletypePdf } from "react-icons/bs";
import { BiHomeAlt2 } from "react-icons/bi";
import { IoTvOutline } from "react-icons/io5";
import { usePathname, useRouter } from "next/navigation";

export default function Navbar() {
  const router = useRouter();
  const pathname = usePathname();

  const menu = [
    { name: "Home", icon: BiHomeAlt2, link: "/mobile" },
    { name: "Ecopy", icon: BsFiletypePdf, link: "/ecopy" },
    { name: "TV", icon: IoTvOutline, link: "/video" },
    { name: "Live", icon: CiStreamOn, link: "/stream" },
  ];

  return (
    <nav className="fixed bottom-0 left-0 pb-6 px-2 w-full z-50 rounded-t-3xl shadow-md bg-white dark:bg-neutral-900">
      <div className="flex justify-between items-center p-4">
        {menu.map((item, index) => {
          const isActive = pathname === item.link;
          return (
            <button
              key={index}
              onClick={() => router.push(item.link)}
              className={`flex flex-col items-center ${
                isActive ? "text-red-700 dark:text-red-700" : "text-neutral-900 dark:text-neutral-400"
              }`}
            >
              <item.icon className="w-6 h-6" aria-hidden="true" />
              <span className="text-xs mt-1">{item.name}</span>
            </button>
          );
        })}
      </div>
    </nav>
  );
}
