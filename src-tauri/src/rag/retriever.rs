use std::path::Path;
use walkdir::WalkDir;
use serde::{Deserialize, Serialize};
use crate::error::AppResult;
use super::indexer::CodeChunk;

#[derive(Debug, Serialize, Deserialize, Clone)]
pub struct RAGSearchResult {
    pub file_path: String,
    pub start_line: usize,
    pub end_line: usize,
    pub content: String,
    pub relevance_score: f32,
}

pub struct CodeRetriever;

impl CodeRetriever {
    pub async fn retrieve(
        project_path: &str,
        query: &str,
        limit: usize,
    ) -> AppResult<Vec<RAGSearchResult>> {
        // Hybrid Retrieval logic (Fuzzy search matching key tokens)
        let query_tokens: Vec<&str> = query.split_whitespace().collect();
        let mut results = Vec::new();
        
        for entry in WalkDir::new(project_path)
            .max_depth(5)
            .into_iter()
            .flatten()
        {
            if entry.file_type().is_file() {
                let path = entry.path();
                let filename = path.file_name().unwrap_or_default().to_string_lossy().to_string();
                if filename.ends_with(".rs") || filename.ends_with(".ts") || filename.ends_with(".tsx") {
                    if let Ok(chunks) = super::indexer::chunk_file(path) {
                        for chunk in chunks {
                            let mut match_count = 0;
                            for token in &query_tokens {
                                if chunk.content.to_lowercase().contains(&token.to_lowercase()) {
                                    match_count += 1;
                                }
                            }
                            if match_count > 0 {
                                results.push(RAGSearchResult {
                                    file_path: chunk.file_path,
                                    start_line: chunk.start_line,
                                    end_line: chunk.end_line,
                                    content: chunk.content,
                                    relevance_score: (match_count as f32) / (query_tokens.len() as f32),
                                });
                            }
                        }
                    }
                }
            }
        }
        
        results.sort_by(|a, b| b.relevance_score.partial_cmp(&a.relevance_score).unwrap());
        results.truncate(limit);
        Ok(results)
    }
}
