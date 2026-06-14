import { Outlet } from "react-router-dom";
import { motion } from "framer-motion";
import { Navigation } from "./Navigation";
import { Lightbox } from "../features/Lightbox";

export function Layout() {
  return (
    <div className="min-h-screen bg-paper-50 noise-bg">
      <Navigation />
      <main className="pt-16">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -20 }}
          transition={{ duration: 0.4, ease: "easeOut" }}
        >
          <Outlet />
        </motion.div>
      </main>
      <Lightbox />
    </div>
  );
}
