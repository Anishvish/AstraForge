import React from "react";
import { Folder, FolderOpen, File, ChevronRight, ChevronDown } from "lucide-react";
import type { FileTreeNode } from "@/lib/tauri";
import { useWorkspaceStore } from "@/stores/workspace";
import { useEditorStore } from "@/stores/editor";

interface FileTreeItemProps {
  item: FileTreeNode;
  depth: number;
}

export function FileTreeItem({ item, depth }: FileTreeItemProps) {
  const expandedDirs = useWorkspaceStore((s) => s.expandedDirs);
  const toggleDir = useWorkspaceStore((s) => s.toggleDir);
  const selectedFile = useWorkspaceStore((s) => s.selectedFile);
  const selectFile = useWorkspaceStore((s) => s.selectFile);
  const openFile = useEditorStore((s) => s.openFile);

  const isExpanded = expandedDirs.has(item.path);
  const isSelected = selectedFile === item.path;

  const handleClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (item.is_dir) {
      toggleDir(item.path);
    } else {
      selectFile(item.path);
      openFile(item.path, item.name);
    }
  };

  return (
    <div className="flex flex-col">
      <div
        onClick={handleClick}
        style={{ paddingLeft: `${depth * 12 + 6}px` }}
        className={`group flex items-center h-7 hover:bg-zinc-800/60 cursor-pointer text-xs transition-colors duration-150 ${
          isSelected ? "bg-zinc-800 text-indigo-400 font-medium border-r-[2px] border-indigo-500" : "text-zinc-400 hover:text-zinc-200"
        }`}
      >
        <div className="w-4 h-4 flex items-center justify-center mr-0.5 text-zinc-500">
          {item.is_dir ? (
            isExpanded ? <ChevronDown size={14} /> : <ChevronRight size={14} />
          ) : null}
        </div>

        <div className="mr-1.5 flex-shrink-0">
          {item.is_dir ? (
            isExpanded ? (
              <FolderOpen size={15} className="text-indigo-400" />
            ) : (
              <Folder size={15} className="text-zinc-500" />
            )
          ) : (
            <File size={15} className="text-zinc-400 group-hover:text-zinc-300" />
          )}
        </div>

        <span className="truncate flex-1">{item.name}</span>
      </div>

      {item.is_dir && isExpanded && item.children && (
        <div className="flex flex-col">
          {item.children.map((child) => (
            <FileTreeItem key={child.path} item={child} depth={depth + 1} />
          ))}
        </div>
      )}
    </div>
  );
}
