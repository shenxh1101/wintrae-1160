import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { User, ChevronDown, Palette, Building2 } from "lucide-react";
import { useProjectStore } from "../../store/useProjectStore";
import { cn } from "../../utils/helpers";
import type { User as UserType } from "../../types";

export function UserSwitcher() {
  const { currentUser, availableUsers, setCurrentUser } = useProjectStore();
  const [isOpen, setIsOpen] = useState(false);

  const handleSwitch = (user: UserType) => {
    setCurrentUser(user);
    setIsOpen(false);
  };

  return (
    <div className="relative">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-2 px-3 py-1.5 rounded-sm bg-paper-100 hover:bg-paper-200 transition-colors"
      >
        <img
          src={currentUser.avatar}
          alt={currentUser.name}
          className="w-6 h-6 rounded-full"
        />
        <div className="text-left">
          <p className="text-xs font-medium text-ink-300 leading-tight">
            {currentUser.name}
          </p>
          <p className="text-[10px] text-ink-50 font-mono flex items-center gap-1">
            {currentUser.role === "designer" ? (
              <>
                <Palette size={10} /> 设计师
              </>
            ) : (
              <>
                <Building2 size={10} /> 客户
              </>
            )}
          </p>
        </div>
        <ChevronDown
          size={14}
          className={cn(
            "text-ink-50 transition-transform",
            isOpen && "rotate-180"
          )}
        />
      </button>

      <AnimatePresence>
        {isOpen && (
          <>
            <div
              className="fixed inset-0 z-10"
              onClick={() => setIsOpen(false)}
            />
            <motion.div
              initial={{ opacity: 0, y: -5 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -5 }}
              className="absolute top-full right-0 mt-2 w-64 bg-white rounded-sm shadow-xl border border-paper-200 overflow-hidden z-20"
            >
              <div className="p-3 border-b border-paper-100">
                <p className="text-xs font-mono uppercase tracking-wider text-ink-50">
                  切换身份
                </p>
                <p className="text-xs text-ink-50 mt-1">
                  用于模拟不同角色的操作体验
                </p>
              </div>
              <div className="p-1">
                {availableUsers.map((user) => (
                  <button
                    key={user.id}
                    onClick={() => handleSwitch(user)}
                    className={cn(
                      "w-full flex items-center gap-3 p-3 rounded-sm transition-colors",
                      "hover:bg-paper-50",
                      currentUser.id === user.id && "bg-brand-orange/5"
                    )}
                  >
                    <img
                      src={user.avatar}
                      alt={user.name}
                      className="w-10 h-10 rounded-full"
                    />
                    <div className="flex-1 text-left">
                      <p className="text-sm font-medium text-ink-300">
                        {user.name}
                      </p>
                      <p className="text-xs text-ink-50 flex items-center gap-1">
                        {user.role === "designer" ? (
                          <>
                            <Palette size={12} /> 设计师
                          </>
                        ) : (
                          <>
                            <Building2 size={12} /> 客户（{user.name}）
                          </>
                        )}
                      </p>
                    </div>
                    {currentUser.id === user.id && (
                      <div className="w-2 h-2 rounded-full bg-brand-orange" />
                    )}
                  </button>
                ))}
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
}
