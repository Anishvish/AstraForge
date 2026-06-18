import { useEffect } from 'react';
import { useUIStore } from '@/stores/ui';
import { useEditorStore } from '@/stores/editor';

export function useKeyboardShortcuts() {
  const toggleCommandPalette = useUIStore((s) => s.toggleCommandPalette);
  const toggleTerminal = useUIStore((s) => s.toggleTerminal);
  const toggleSidebar = useUIStore((s) => s.toggleSidebar);
  const saveFile = useEditorStore((s) => s.saveFile);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Ctrl+K -> Command Palette
      if ((e.ctrlKey || e.metaKey) && e.key === 'k') {
        e.preventDefault();
        toggleCommandPalette();
      }

      // Ctrl+` -> Toggle Terminal
      if ((e.ctrlKey || e.metaKey) && e.key === '`') {
        e.preventDefault();
        toggleTerminal();
      }

      // Ctrl+B -> Toggle Sidebar
      if ((e.ctrlKey || e.metaKey) && e.key === 'b') {
        e.preventDefault();
        toggleSidebar();
      }

      // Ctrl+S -> Save File
      if ((e.ctrlKey || e.metaKey) && e.key === 's') {
        e.preventDefault();
        saveFile().catch(console.error);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [toggleCommandPalette, toggleTerminal, toggleSidebar, saveFile]);
}
