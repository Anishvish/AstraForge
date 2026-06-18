use serde::{Deserialize, Serialize};
use crate::error::AppResult;
use crate::ai::gateway::AiGateway;
use crate::ai::models::{ChatMessage, ChatOptions};

#[derive(Debug, Serialize, Deserialize, Clone)]
pub struct ReviewFinding {
    pub line_number: usize,
    pub severity: String, // "info" | "warning" | "critical"
    pub category: String, // "security" | "bug" | "performance" | "style"
    pub message: String,
    pub suggestion: String,
}

pub struct CodeAnalyzer;

impl CodeAnalyzer {
    pub async fn analyze_code(
        code: &str,
        file_name: &str,
    ) -> AppResult<Vec<ReviewFinding>> {
        // 1. Static Scan: Regex checks for hardcoded credentials
        let mut findings = Vec::new();
        
        let api_key_pattern = regex::Regex::new(r#"(?i)(api_key|password|secret|token|passwd)\s*=\s*['"][a-zA-Z0-9_\-]{8,}['"]"#).unwrap();
        for (idx, line) in code.lines().enumerate() {
            if api_key_pattern.is_match(line) {
                findings.push(ReviewFinding {
                    line_number: idx + 1,
                    severity: "critical".to_string(),
                    category: "security".to_string(),
                    message: "Hardcoded API Key / Secret detected in file.".to_string(),
                    suggestion: "Store secrets securely using keyring API or environment configurations.".to_string(),
                });
            }
        }

        // 2. Query AI Gateway for advanced logical analysis
        let gateway = AiGateway::new();
        let prompt = format!(
            "Review the following code file '{}' for logical bugs, memory leaks, performance bottlenecks, and security vulnerabilities.\n\nCode:\n```\n{}\n```\n\nReturn findings in JSON array format: [{{ \"line_number\": number, \"severity\": \"info\"|\"warning\"|\"critical\", \"category\": \"security\"|\"bug\"|\"performance\"|\"style\", \"message\": \"description\", \"suggestion\": \"fix\" }}]",
            file_name, code
        );

        let messages = vec![
            ChatMessage {
                role: "system".to_string(),
                content: "You are an elite static code analyzer. Return valid JSON only.".to_string(),
            },
            ChatMessage {
                role: "user".to_string(),
                content: prompt,
            }
        ];

        if let Ok(ai_res) = gateway.chat("nvidia", "nvidia/llama-3.1-nemotron-70b-instruct", &messages, &ChatOptions::default(), None).await {
            // Attempt to parse AI findings
            if let Ok(mut parsed_findings) = serde_json::from_str::<Vec<ReviewFinding>>(&ai_res.content) {
                findings.append(&mut parsed_findings);
            }
        }

        Ok(findings)
    }
}
