use serde::{Deserialize, Serialize};

#[derive(Debug, Serialize, Deserialize, Clone)]
#[serde(tag = "type", content = "args")]
pub enum Tool {
    ReadFile { path: String },
    WriteFile { path: String, content: String },
    CreateFile { path: String, content: Option<String> },
    DeleteFile { path: String },
    ListDirectory { path: String },
    SearchFiles { path: String, query: String },
    RunCommand { cwd: String, command: String, args: Vec<String> },
    GitCommit { message: String },
    GitDiff,
}
