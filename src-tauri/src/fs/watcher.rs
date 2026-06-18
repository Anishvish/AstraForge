use notify::{Config, Event, EventKind, RecommendedWatcher, RecursiveMode, Watcher};
use serde::Serialize;
use std::path::Path;
use std::sync::mpsc;
use std::sync::Arc;
use parking_lot::Mutex;
use tauri::{AppHandle, Emitter};
use tracing::{error, info};

use crate::error::AppResult;

#[derive(Debug, Serialize, Clone)]
pub struct FsChangeEvent {
    pub event_type: String,
    pub paths: Vec<String>,
}

pub struct FileWatcher {
    _watcher: RecommendedWatcher,
}

impl FileWatcher {
    pub fn start_watching(path: &str, app_handle: AppHandle) -> AppResult<Arc<Mutex<Self>>> {
        let (tx, rx) = mpsc::channel::<notify::Result<Event>>();

        let mut watcher = RecommendedWatcher::new(tx, Config::default())?;
        watcher.watch(Path::new(path), RecursiveMode::Recursive)?;

        info!("Started file watcher for: {}", path);

        // Spawn a thread to process filesystem events
        let handle = app_handle.clone();
        std::thread::spawn(move || {
            for res in rx {
                match res {
                    Ok(event) => {
                        let event_type = match event.kind {
                            EventKind::Create(_) => "create",
                            EventKind::Modify(_) => "modify",
                            EventKind::Remove(_) => "delete",
                            _ => continue,
                        };

                        let paths: Vec<String> = event
                            .paths
                            .iter()
                            .map(|p| p.to_string_lossy().to_string())
                            .collect();

                        let fs_event = FsChangeEvent {
                            event_type: event_type.to_string(),
                            paths,
                        };

                        if let Err(e) = handle.emit("fs://change", &fs_event) {
                            error!("Failed to emit fs event: {}", e);
                        }
                    }
                    Err(e) => {
                        error!("File watcher error: {}", e);
                    }
                }
            }
        });

        Ok(Arc::new(Mutex::new(FileWatcher {
            _watcher: watcher,
        })))
    }
}
