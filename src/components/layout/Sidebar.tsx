import {
  Files,
  Search,
  GitBranch,
  Bot,
  MessageSquare,
  Settings,
  Sun,
  Moon,
} from "lucide-react";
import { useUIStore, type SidebarPanel } from "@/stores/ui";
import { Tooltip, TooltipTrigger, TooltipContent } from "@/components/ui/tooltip";

interface SidebarButtonProps {
  panel: SidebarPanel;
  icon: React.ReactNode;
  label: string;
}

export function Sidebar() {
  const currentPanel = useUIStore((s) => s.sidebarPanel);
  const setSidebarPanel = useUIStore((s) => s.setSidebarPanel);
  const theme = useUIStore((s) => s.theme);
  const toggleTheme = useUIStore((s) => s.toggleTheme);

  const SidebarButton = ({ panel, icon, label }: SidebarButtonProps) => {
    const isActive = currentPanel === panel;
    return (
      <Tooltip>
        <TooltipTrigger asChild>
          <button
            onClick={() => setSidebarPanel(panel)}
            className={`w-12 h-12 flex items-center justify-center relative transition ${
              isActive ? "text-indigo-400" : "text-zinc-500 hover:text-zinc-300"
            }`}
          >
            {isActive && (
              <div className="absolute left-0 top-0 bottom-0 w-[2px] bg-indigo-500 rounded-r" />
            )}
            {icon}
          </button>
        </TooltipTrigger>
        <TooltipContent side="right">
          <p>{label}</p>
        </TooltipContent>
      </Tooltip>
    );
  };

  return (
    <div className="w-12 bg-zinc-950 border-r border-zinc-900 flex flex-col justify-between items-center py-2 h-full">
      <div className="flex flex-col gap-1 w-full">
        <SidebarButton panel="explorer" icon={<Files size={20} />} label="Explorer" />
        <SidebarButton panel="search" icon={<Search size={20} />} label="Search" />
        <SidebarButton panel="git" icon={<GitBranch size={20} />} label="Source Control" />
        <SidebarButton panel="agents" icon={<Bot size={20} />} label="Agents" />
        <SidebarButton panel="chat" icon={<MessageSquare size={20} />} label="AI Chat" />
      </div>

      <div className="flex flex-col gap-2 items-center w-full">
        <button
          onClick={toggleTheme}
          className="w-10 h-10 flex items-center justify-center rounded-lg hover:bg-zinc-900 text-zinc-500 hover:text-zinc-300 transition"
        >
          {theme === "dark" ? <Sun size={18} /> : <Moon size={18} />}
        </button>
        
        <SidebarButton panel="settings" icon={<Settings size={20} />} label="Settings" />
      </div>
    </div>
  );
}
