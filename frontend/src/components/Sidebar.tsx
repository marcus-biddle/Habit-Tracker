import React, { useState, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Menu, User, Undo2 } from 'lucide-react';
import { useActiveUser } from "../context/ActiveUserCotnext";
import { RollingNumber } from "./framer/RollingNumber";

// const items = [
//   { title: "Home", Icon: BiHomeSmile, href: "#" },
//   { title: "About", Icon: BiUser, href: "#" },
//   { title: "Contact", Icon: HiOutlineChatBubbleBottomCenterText, href: "#" },
//   { title: "Settings", Icon: FiSettings, href: "#" },
//   { title: "Shop", Icon: FiShoppingCart, href: "#" },
// ];

const sidebarBackground = {
  initial: { opacity: 0 },
  animate: { opacity: 1 },
  exit: { opacity: 0, transition: { delay: 0.2 } },
  transition: { duration: 0.3 },
};

const sidebarPanel = {
  initial: { x: "-100%" },
  animate: { x: 0 },
  exit: { x: "-100%" },
  transition: { duration: 0.3 },
};

const sidebarText = (delay: number) => ({
  initial: { opacity: 0, x: -50 },
  animate: { opacity: 1, x: 0 },
  transition: { delay: 0.5 + delay / 10 },
});

const sidebarIcon = {
  initial: { scale: 0 },
  animate: { scale: 1 },
  transition: { type: "spring" as const, stiffness: 260, damping: 20, delay: 1.5 },
};

export function Sidebar() {
    const { userList, setUser, totalUsers } = useActiveUser();
    console.log(userList)

  const [open, setOpen] = useState(false);
  const ref = useRef(null);

//   useClickAway(ref, () => setOpen(false));

  const toggleSidebar = () => setOpen((prev) => !prev);

  return (
    <>
      <button
        onClick={toggleSidebar}
        aria-label="toggle sidebar"
        className="p-3 border-2 border-zinc-800 rounded-xl"
      >
        <Menu />
      </button>

      <AnimatePresence mode="wait" initial={false}>
        {open && (
          <>
            <motion.div
              {...sidebarBackground}
              aria-hidden="true"
              className="fixed bottom-0 left-0 right-0 top-0 z-40 bg-[rgba(0,0,0,0.1)] backdrop-blur-sm"
            />

            <motion.div
              {...sidebarPanel}
              className="fixed top-0 bottom-0 left-0 z-50 w-full h-screen max-w-xs border-r-2 border-zinc-800 bg-zinc-900"
              ref={ref}
              aria-label="Sidebar"
            >
              <div className="flex items-center justify-between p-5 border-b-2 border-zinc-800">
                <span>Welcome</span>
                <button
                  onClick={toggleSidebar}
                  aria-label="close sidebar"
                  className="p-3 border-2 border-zinc-800 rounded-xl"
                >
                  <Undo2 />
                </button>
              </div>

              <div className="flex items-center justify-between p-5 border-b-2 border-zinc-800">
                <span>Active Users</span>
                <RollingNumber number={totalUsers ?? 0} />
              </div>

              <ul className="max-h-96 overflow-y-auto">
                {userList?.map((user, index) => (
                    <li key={index} className="flex items-center justify-between gap-5 p-5 transition-all border-b-2 hover:bg-zinc-900 border-zinc-800">
                        <motion.span {...sidebarText(index)}>{user}</motion.span>
                        <motion.button className="p-2 cursor-pointer border-2 border-zinc-800 rounded-xl" onClick={() => {
                            setUser(user);
                            toggleSidebar();
                            }} 
                            {...sidebarIcon}
                        >
                            <User className="text-2xl" />
                        </motion.button>
                    </li>
                ))}
              </ul>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </>
  );
}