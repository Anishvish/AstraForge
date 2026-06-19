use crate::error::AppResult;

use super::models::{AiResponse, ChatMessage, ChatOptions, StreamChunk};

pub mod nvidia;
pub mod ollama;
pub mod openai_compat;

/// Trait implemented by each AI provider.
#[async_trait::async_trait]
pub trait AiProvider: Send + Sync {
    /// Send a non-streaming chat completion request.
    async fn chat_completion(
        &self,
        messages: &[ChatMessage],
        model: &str,
        options: &ChatOptions,
        api_key: Option<&str>,
    ) -> AppResult<AiResponse>;

    /// Send a streaming chat completion request. Returns collected chunks via callback.
    async fn stream_completion(
        &self,
        messages: &[ChatMessage],
        model: &str,
        options: &ChatOptions,
        api_key: Option<&str>,
    ) -> AppResult<Vec<StreamChunk>>;

    /// List available models from this provider.
    async fn list_models(&self, api_key: Option<&str>) -> AppResult<Vec<super::models::ModelInfo>>;

    /// Test if the connection to this provider is working.
    async fn test_connection(&self, api_key: Option<&str>) -> AppResult<bool>;
}
