use std::path::Path;
use serde::{Deserialize, Serialize};

#[derive(Debug, Serialize, Deserialize, Clone)]
pub struct CodeChunk {
    pub file_path: String,
    pub start_line: usize,
    pub end_line: usize,
    pub content: String,
}

pub fn chunk_file(path: &Path) -> std::io::Result<Vec<CodeChunk>> {
    let content = std::fs::read_to_string(path)?;
    let lines: Vec<&str> = content.lines().collect();
    let mut chunks = Vec::new();
    
    // Simple sliding window chunker for code semantic context
    let window_size = 50;
    let overlap = 10;
    
    let mut start = 0;
    while start < lines.len() {
        let end = std::cmp::min(start + window_size, lines.len());
        let chunk_lines = &lines[start..end];
        let chunk_content = chunk_lines.join("\n");
        
        chunks.push(CodeChunk {
            file_path: path.to_string_lossy().to_string(),
            start_line: start + 1,
            end_line: end,
            content: chunk_content,
        });
        
        if end == lines.len() {
            break;
        }
        start += window_size - overlap;
    }
    
    Ok(chunks)
}
