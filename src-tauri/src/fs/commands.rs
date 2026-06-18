use serde::{Deserialize, Serialize};
use std::path::Path;
use walkdir::WalkDir;

use crate::error::{AppError, AppResult};

#[derive(Debug, Serialize, Deserialize, Clone)]
pub struct FileEntry {
    pub name: String,
    pub path: String,
    pub is_dir: bool,
    pub size: u64,
    pub extension: Option<String>,
    pub children_count: Option<usize>,
}

#[derive(Debug, Serialize, Deserialize, Clone)]
pub struct FileTreeNode {
    pub name: String,
    pub path: String,
    pub is_dir: bool,
    pub extension: Option<String>,
    pub size: u64,
    pub children: Option<Vec<FileTreeNode>>,
}

#[derive(Debug, Serialize, Deserialize, Clone)]
pub struct SearchResult {
    pub path: String,
    pub name: String,
    pub is_dir: bool,
    pub line_number: Option<usize>,
    pub line_content: Option<String>,
}

const IGNORED_DIRS: &[&str] = &[
    "node_modules",
    ".git",
    "target",
    "dist",
    ".next",
    "__pycache__",
    ".venv",
    "venv",
    ".idea",
    ".vscode",
    "build",
    ".turbo",
    ".cache",
];

fn should_ignore(name: &str) -> bool {
    IGNORED_DIRS.contains(&name)
}

#[tauri::command]
pub async fn read_file_content(path: String) -> AppResult<String> {
    let p = Path::new(&path);
    if !p.exists() {
        return Err(AppError::NotFound(format!("File not found: {}", path)));
    }
    tokio::fs::read_to_string(p)
        .await
        .map_err(AppError::Io)
}

#[tauri::command]
pub async fn write_file_content(path: String, content: String) -> AppResult<()> {
    let p = Path::new(&path);
    if let Some(parent) = p.parent() {
        tokio::fs::create_dir_all(parent).await?;
    }
    tokio::fs::write(p, content).await.map_err(AppError::Io)
}

#[tauri::command]
pub async fn create_file(path: String, content: Option<String>) -> AppResult<()> {
    let p = Path::new(&path);
    if p.exists() {
        return Err(AppError::Internal(format!("File already exists: {}", path)));
    }
    if let Some(parent) = p.parent() {
        tokio::fs::create_dir_all(parent).await?;
    }
    let data = content.unwrap_or_default();
    tokio::fs::write(p, data).await.map_err(AppError::Io)
}

#[tauri::command]
pub async fn create_directory(path: String) -> AppResult<()> {
    tokio::fs::create_dir_all(&path).await.map_err(AppError::Io)
}

#[tauri::command]
pub async fn delete_path(path: String) -> AppResult<()> {
    let p = Path::new(&path);
    if !p.exists() {
        return Err(AppError::NotFound(format!("Path not found: {}", path)));
    }
    if p.is_dir() {
        tokio::fs::remove_dir_all(p).await.map_err(AppError::Io)
    } else {
        tokio::fs::remove_file(p).await.map_err(AppError::Io)
    }
}

#[tauri::command]
pub async fn rename_path(old_path: String, new_path: String) -> AppResult<()> {
    let old = Path::new(&old_path);
    if !old.exists() {
        return Err(AppError::NotFound(format!("Path not found: {}", old_path)));
    }
    let new = Path::new(&new_path);
    if let Some(parent) = new.parent() {
        tokio::fs::create_dir_all(parent).await?;
    }
    tokio::fs::rename(old, new).await.map_err(AppError::Io)
}

#[tauri::command]
pub async fn list_directory(path: String) -> AppResult<Vec<FileEntry>> {
    let p = Path::new(&path);
    if !p.exists() {
        return Err(AppError::NotFound(format!("Directory not found: {}", path)));
    }
    if !p.is_dir() {
        return Err(AppError::Internal(format!("Not a directory: {}", path)));
    }

    let path_clone = path.clone();
    tokio::task::spawn_blocking(move || {
        let mut entries = Vec::new();
        let read_dir = std::fs::read_dir(&path_clone)
            .map_err(AppError::Io)?;

        for entry in read_dir.flatten() {
            let metadata = entry.metadata();
            let name = entry.file_name().to_string_lossy().to_string();

            if should_ignore(&name) {
                continue;
            }

            let (size, is_dir) = match &metadata {
                Ok(m) => (m.len(), m.is_dir()),
                Err(_) => (0, false),
            };

            let children_count = if is_dir {
                std::fs::read_dir(entry.path())
                    .map(|rd| rd.count())
                    .ok()
            } else {
                None
            };

            let extension = if !is_dir {
                entry
                    .path()
                    .extension()
                    .map(|e| e.to_string_lossy().to_string())
            } else {
                None
            };

            entries.push(FileEntry {
                name,
                path: entry.path().to_string_lossy().to_string(),
                is_dir,
                size,
                extension,
                children_count,
            });
        }

        // Sort: directories first, then by name
        entries.sort_by(|a, b| {
            b.is_dir.cmp(&a.is_dir).then(a.name.to_lowercase().cmp(&b.name.to_lowercase()))
        });

        Ok(entries)
    })
    .await
    .map_err(|e| AppError::Internal(e.to_string()))?
}

#[tauri::command]
pub async fn get_file_tree(root_path: String, max_depth: Option<usize>) -> AppResult<FileTreeNode> {
    let depth = max_depth.unwrap_or(4);
    let root = root_path.clone();

    tokio::task::spawn_blocking(move || build_tree_node(Path::new(&root), depth))
        .await
        .map_err(|e| AppError::Internal(e.to_string()))?
}

fn build_tree_node(path: &Path, remaining_depth: usize) -> AppResult<FileTreeNode> {
    let name = path
        .file_name()
        .map(|n| n.to_string_lossy().to_string())
        .unwrap_or_else(|| path.to_string_lossy().to_string());

    let metadata = std::fs::metadata(path).map_err(AppError::Io)?;
    let is_dir = metadata.is_dir();
    let size = if is_dir { 0 } else { metadata.len() };
    let extension = if !is_dir {
        path.extension().map(|e| e.to_string_lossy().to_string())
    } else {
        None
    };

    let children = if is_dir && remaining_depth > 0 {
        let mut child_nodes = Vec::new();
        if let Ok(read_dir) = std::fs::read_dir(path) {
            for entry in read_dir.flatten() {
                let child_name = entry.file_name().to_string_lossy().to_string();
                if should_ignore(&child_name) {
                    continue;
                }
                if let Ok(node) = build_tree_node(&entry.path(), remaining_depth - 1) {
                    child_nodes.push(node);
                }
            }
        }
        child_nodes.sort_by(|a, b| {
            b.is_dir
                .cmp(&a.is_dir)
                .then(a.name.to_lowercase().cmp(&b.name.to_lowercase()))
        });
        Some(child_nodes)
    } else if is_dir {
        Some(Vec::new())
    } else {
        None
    };

    Ok(FileTreeNode {
        name,
        path: path.to_string_lossy().to_string(),
        is_dir,
        extension,
        size,
        children,
    })
}

#[tauri::command]
pub async fn search_files(
    root_path: String,
    query: String,
    max_results: Option<usize>,
) -> AppResult<Vec<SearchResult>> {
    let limit = max_results.unwrap_or(100);
    let root = root_path.clone();
    let q = query.clone();

    tokio::task::spawn_blocking(move || {
        let mut results = Vec::new();
        let query_lower = q.to_lowercase();
        let re = regex::RegexBuilder::new(&regex::escape(&q))
            .case_insensitive(true)
            .build()
            .ok();

        for entry in WalkDir::new(&root)
            .max_depth(10)
            .into_iter()
            .filter_entry(|e| {
                let name = e.file_name().to_string_lossy();
                !should_ignore(&name)
            })
            .flatten()
        {
            if results.len() >= limit {
                break;
            }

            let name = entry.file_name().to_string_lossy().to_string();
            let entry_path = entry.path().to_string_lossy().to_string();

            // Match filename
            if name.to_lowercase().contains(&query_lower) {
                results.push(SearchResult {
                    path: entry_path.clone(),
                    name: name.clone(),
                    is_dir: entry.file_type().is_dir(),
                    line_number: None,
                    line_content: None,
                });
                continue;
            }

            // Search inside files for content matches
            if entry.file_type().is_file() {
                if let Some(ref re) = re {
                    if let Ok(content) = std::fs::read_to_string(entry.path()) {
                        for (idx, line) in content.lines().enumerate() {
                            if results.len() >= limit {
                                break;
                            }
                            if re.is_match(line) {
                                results.push(SearchResult {
                                    path: entry_path.clone(),
                                    name: name.clone(),
                                    is_dir: false,
                                    line_number: Some(idx + 1),
                                    line_content: Some(line.trim().to_string()),
                                });
                            }
                        }
                    }
                }
            }
        }
        Ok(results)
    })
    .await
    .map_err(|e| AppError::Internal(e.to_string()))?
}
