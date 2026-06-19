use serde::Serialize;
use thiserror::Error;

#[derive(Debug, Error)]
pub enum AppError {
    #[error("IO error: {0}")]
    Io(#[from] std::io::Error),

    #[error("Database error: {0}")]
    Database(String),

    #[error("Git error: {0}")]
    Git(String),

    #[error("Serialization error: {0}")]
    Serialization(#[from] serde_json::Error),

    #[error("Tauri error: {0}")]
    Tauri(String),

    #[error("Terminal error: {0}")]
    Terminal(String),

    #[error("AI error: {0}")]
    Ai(String),

    #[error("Not found: {0}")]
    NotFound(String),

    #[error("Permission denied: {0}")]
    PermissionDenied(String),

    #[error("Internal error: {0}")]
    Internal(String),
}

impl Serialize for AppError {
    fn serialize<S>(&self, serializer: S) -> Result<S::Ok, S::Error>
    where
        S: serde::Serializer,
    {
        use serde::ser::SerializeStruct;
        let mut state = serializer.serialize_struct("AppError", 2)?;
        let variant = match self {
            AppError::Io(_) => "Io",
            AppError::Database(_) => "Database",
            AppError::Git(_) => "Git",
            AppError::Serialization(_) => "Serialization",
            AppError::Tauri(_) => "Tauri",
            AppError::Terminal(_) => "Terminal",
            AppError::Ai(_) => "Ai",
            AppError::NotFound(_) => "NotFound",
            AppError::PermissionDenied(_) => "PermissionDenied",
            AppError::Internal(_) => "Internal",
        };
        state.serialize_field("kind", variant)?;
        state.serialize_field("message", &self.to_string())?;
        state.end()
    }
}

impl From<rusqlite::Error> for AppError {
    fn from(e: rusqlite::Error) -> Self {
        AppError::Database(e.to_string())
    }
}

impl From<git2::Error> for AppError {
    fn from(e: git2::Error) -> Self {
        AppError::Git(e.to_string())
    }
}

impl From<reqwest::Error> for AppError {
    fn from(e: reqwest::Error) -> Self {
        AppError::Ai(e.to_string())
    }
}

impl From<tauri::Error> for AppError {
    fn from(e: tauri::Error) -> Self {
        AppError::Tauri(e.to_string())
    }
}

impl From<anyhow::Error> for AppError {
    fn from(e: anyhow::Error) -> Self {
        AppError::Internal(e.to_string())
    }
}

impl From<keyring::Error> for AppError {
    fn from(e: keyring::Error) -> Self {
        AppError::Internal(format!("Keyring error: {}", e))
    }
}

impl From<notify::Error> for AppError {
    fn from(e: notify::Error) -> Self {
        AppError::Internal(format!("File watcher error: {}", e))
    }
}

impl From<walkdir::Error> for AppError {
    fn from(e: walkdir::Error) -> Self {
        AppError::Io(std::io::Error::other(e.to_string()))
    }
}

pub type AppResult<T> = Result<T, AppError>;
