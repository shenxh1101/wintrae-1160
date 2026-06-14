import { NavLink } from "react-router-dom";
import {
  Home,
  Image,
  MessageSquare,
  GitCompare,
  Package,
} from "lucide-react";
import { useProjectStore } from "../../store/useProjectStore";
import { cn } from "../../utils/helpers";

const navItems = [
  { path: "/", label: "项目首页", icon: Home },
  { path: "/browse", label: "方案浏览", icon: Image },
  { path: "/comments", label: "批注讨论", icon: MessageSquare },
  { path: "/compare", label: "版本对比", icon: GitCompare },
  { path: "/delivery", label: "交付确认", icon: Package },
];

export function Navigation() {
  const project = useProjectStore((state) => state.project);
  const openCount = useProjectStore((state) => state.getOpenAnnotationsCount());

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 bg-white/80 backdrop-blur-md border-b border-paper-200">
      <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
        <div className="flex items-center gap-8">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 bg-brand-charcoal flex items-center justify-center">
              <span className="text-white font-display text-lg font-bold">D</span>
            </div>
            <div>
              <h1 className="text-sm font-semibold text-ink-300 leading-tight">
                {project.title}
              </h1>
              <p className="text-xs text-ink-50 font-mono">{project.client}</p>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-1">
          {navItems.map((item) => (
            <NavLink
              key={item.path}
              to={item.path}
              end={item.path === "/"}
              className={({ isActive }) =>
                cn(
                  "flex items-center gap-2 px-4 py-2 text-sm transition-all duration-200 relative group",
                  isActive
                    ? "text-brand-charcoal"
                    : "text-ink-50 hover:text-ink-300"
                )
              }
            >
              <item.icon size={16} />
              <span>{item.label}</span>
              {item.path === "/comments" && openCount > 0 && (
                <span className="w-5 h-5 rounded-full bg-brand-coral text-white text-xs flex items-center justify-center font-medium">
                  {openCount}
                </span>
              )}
              <span
                className={cn(
                  "absolute bottom-0 left-0 right-0 h-0.5 bg-brand-orange transition-all duration-300",
                  "opacity-0 group-hover:opacity-100",
                  "data-[active=true]:opacity-100"
                )}
                data-active={
                  navItems.find((n) => n.path === item.path)?.path === "/"
                    ? location.pathname === "/"
                    : location.pathname.startsWith(item.path)
                }
              />
            </NavLink>
          ))}
        </div>

        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2">
            <span
              className={cn(
                "label-tag",
                project.status === "review" && "bg-brand-yellow/20 text-ink-300",
                project.status === "approved" && "bg-brand-mint/20 text-brand-mint",
                project.status === "delivered" && "bg-brand-mint/20 text-brand-mint",
                project.status === "revision" && "bg-brand-coral/20 text-brand-coral"
              )}
            >
              {project.status === "draft" && "草稿"}
              {project.status === "review" && "审核中"}
              {project.status === "revision" && "修改中"}
              {project.status === "approved" && "已通过"}
              {project.status === "delivered" && "已交付"}
            </span>
          </div>
          <div className="w-8 h-8 rounded-full bg-paper-200 flex items-center justify-center">
            <img
              src="https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=100&h=100&fit=crop&crop=face"
              alt="用户头像"
              className="w-6 h-6 rounded-full object-cover"
            />
          </div>
        </div>
      </div>
    </nav>
  );
}
