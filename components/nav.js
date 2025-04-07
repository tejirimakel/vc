'use client';
import { CiStreamOn } from "react-icons/ci";
import { BsFiletypePdf } from "react-icons/bs";
import { BiHomeAlt2 } from "react-icons/bi";
import { IoTvOutline } from "react-icons/io5";
import { usePathname } from "next/navigation"; // Use usePathname hook

export default function Navbar() {
  const menu = [
    { name: "Home", icon: BiHomeAlt2, link: "/mobile" },
    { name: "Ecopy", icon: BsFiletypePdf, link: "/ecopy" },
    { name: "TV", icon: IoTvOutline, link: "/video" },
    { name: "Live", icon: CiStreamOn, link: "/stream" },
  ];

  const pathname = usePathname(); // Get current pathname

  const handleLinkClick = (link) => {
    if (pathname === link) {
      // Prevent link from opening if it's the same as the current route
      return;
    }
    window.location.href = link; // Navigate to the new route
  };

  return (
    <nav className="fixed bottom-0 left-0 pb-6 px-2 w-full z-50 rounded-t-3xl shadow-md bg-gray-50 dark:bg-neutral-900">
      <div className="flex justify-between items-center p-4">
        {menu.map((item, index) => (
          <div key={index} className="flex items-center">
            <button
              onClick={() => handleLinkClick(item.link)} // Handle click event
              className={`flex items-center text-black dark:text-neutral-100 ${
                pathname === item.link ? "text-red-700 dark:text-red-700" : "text-gray-900"
              }`} // Set active color
            >
              <item.icon
                className={`w-6 h-6 ${
                  pathname === item.link
                    ? "text-red-700 dark:text-red-700"
                    : "text-gray-900 dark:text-neutral-400"
                }`}
                aria-hidden="true"
              />
            </button>
          </div>
        ))}
      </div>
    </nav>
  );
}
