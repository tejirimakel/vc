import { FaNewspaper, FaHouse, FaTv, FaRegFilePdf } from "react-icons/fa6";
import { CiStreamOn } from "react-icons/ci";
import { BsFiletypePdf } from "react-icons/bs";
import { BiHomeAlt2 } from "react-icons/bi";
import { IoTvOutline } from "react-icons/io5";

export default function Navbar() {
  const menu = [
    { name: "Home", icon: BiHomeAlt2, link: "/mobile" },
    { name: "Ecopy", icon: BsFiletypePdf, link: "/ecopy" },
    { name: "TV", icon: IoTvOutline, link: "/video" },
    { name: "Live", icon: CiStreamOn, link: "/stream" },
  ];

  return (
    <nav className="fixed bottom-0 left-0 pb-6 px-2 w-full z-50 rounded-t-3xl shadow-md bg-gray-50 dark:bg-neutral-900">
      <div className="flex justify-between items-center p-4">
        {menu.map((item, index) => (
          <div key={index} className="flex items-center">
            <a
              href={item.link}
              className="flex items-center text-black dark:text-neutral-100"
            >
              <item.icon
                className="w-6 h-6 text-gray-900 dark:text-neutral-400"
                aria-hidden="true"
              />
            </a>
          </div>
        ))}
      </div>
    </nav>
  );
}
