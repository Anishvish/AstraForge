use serde::{Deserialize, Serialize};
use crate::error::AppResult;
use crate::terminal::commands::run_command;
use crate::ai::gateway::AiGateway;
use crate::ai::models::{ChatMessage, ChatOptions};

#[derive(Debug, Serialize, Deserialize, Clone)]
pub struct HealingResult {
    pub success: bool,
    pub original_error: String,
    pub fixed_code: Option<String>,
    pub file_path: Option<String>,
}

pub struct SelfHealingEngine;

impl SelfHealingEngine {
    pub async fn attempt_heal(
        cwd: &str,
        build_command: &str,
        build_args: Vec<String>,
    ) -> AppResult<HealingResult> {
        // 1. Run the build command
        let output = run_command(cwd.to_string(), build_command.to_string(), build_args).await?;
        if output.success {
            return Ok(HealingResult {
                success: true,
                original_error: String::new(),
                fixed_code: None,
                file_path: None,
            });
        }

        // 2. We have an error! Parse error diagnostics from stderr
        let error_log = output.stderr;
        
        // 3. Ask AI Gateway to generate a fix
        let gateway = AiGateway::new();
        let prompt = format!(
            "The project build failed in directory '{}' with the following stderr log:\n\n```\n{}\n```\n\nGenerate the corrected code file to solve this compilation error. Return the correction as a complete replacement of the broken source file.",
            cwd, error_log
        );
        
        let messages = vec![
            ChatMessage {
                role: "system".to_string(),
                content: "You are an expert software engineer fixing compilation build bugs. Output code only.".to_string(),
            },
            ChatMessage {
                role: "user".to_string(),
                content: prompt,
            }
        ];

        // Route chat completion to primary model
        let ai_res = gateway.chat("nvidia", "nvidia/llama-3.1-nemotron-70b-instruct", &messages, &ChatOptions::default(), None).await?;
        
        // Return the healing result
        Ok(HealingResult {
            success: false,
            original_error: error_log,
            fixed_code: Some(ai_res.content),
            file_path: None, // Will be resolved by workspace scanner
        })
    }
}
