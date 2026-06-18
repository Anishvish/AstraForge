use parking_lot::{Mutex, RwLock};
use rusqlite::Connection;
use std::collections::HashMap;
use std::path::PathBuf;
use tauri::AppHandle;

use crate::terminal::TerminalSession;

pub struct AppState {
    pub db: Mutex<Connection>,
    pub project_path: RwLock<Option<PathBuf>>,
    pub terminal_sessions: Mutex<HashMap<String, TerminalSession>>,
    pub app_handle: RwLock<Option<AppHandle>>,
}

impl AppState {
    pub fn new(db: Connection) -> Self {
        Self {
            db: Mutex::new(db),
            project_path: RwLock::new(None),
            terminal_sessions: Mutex::new(HashMap::new()),
            app_handle: RwLock::new(None),
        }
    }

    pub fn set_app_handle(&self, handle: AppHandle) {
        let mut h = self.app_handle.write();
        *h = Some(handle);
    }

    pub fn get_app_handle(&self) -> Option<AppHandle> {
        self.app_handle.read().clone()
    }

    pub fn set_project_path(&self, path: PathBuf) {
        let mut p = self.project_path.write();
        *p = Some(path);
    }

    pub fn get_project_path(&self) -> Option<PathBuf> {
        self.project_path.read().clone()
    }
}
