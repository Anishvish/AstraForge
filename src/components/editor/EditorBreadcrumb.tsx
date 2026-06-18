import React from "react";
import { ChevronRight, Home, FileCode } from "lucide-react";

interface EditorBreadcrumbProps {
  filePath: string | null;
}

export function EditorBreadcrumb({ filePath }: EditorBreadcrumbProps) {
  if (!filePath) return null;

  // Split path into segments (works for Windows backslashes and Unix slashes)
  const segments = filePath.split(/[/\\]/).filter(Boolean);
  
  // Show last 3 segments to prevent overflow
  const visibleSegments = segments.slice(-3);

  return (
    <div className="h-7 bg-zinc-950 border-b border-zinc-900 px-3 flex items-center gap-1.5 text-zinc-500 text-[10px] font-medium select-none flex-shrink-0">
      <Home size={11} className="text-zinc-600" />
      <ChevronRight size={11} className="text-zinc-700" />
      
      {segments.length > visibleSegments.length && (
        <>
          <span>...</span>
          <ChevronRight size={11} className="text-zinc-700" />
        </>
      )}

      {visibleSegments.map((segment, index) => {
        const isLast = index === visibleSegments.length - 1;
        return (
          <React.Fragment key={index}>
            <div className={`flex items-center gap-1 ${isLast ? "text-zinc-300 font-semibold" : "hover:text-zinc-400"}`}>
              {isLast && <FileCode size={11} className="text-indigo-400" />}
              <span>{segment}</span>
            </div>
            {!isLast && <ChevronRight size={11} className="text-zinc-700" />}
          </React.Fragment>
        );
      })}
    </div>
  );
}
