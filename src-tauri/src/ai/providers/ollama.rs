use crate::error::AppResult;
use crate::ai::models::{AiResponse, ChatMessage, ChatOptions, ModelInfo};
use super::AiProvider;

pub struct OllamaProvider;

impl Default for OllamaProvider {
    fn default() -> Self {
        Self::new()
    }
}

impl OllamaProvider {
    pub fn new() -> Self {
        Self
    }
}

#[async_trait::async_trait]
impl AiProvider for OllamaProvider {
    async fn chat_completion(
        &self,
        _messages: &[ChatMessage],
        _model: &str,
        _options: &ChatOptions,
        _api_key: Option<&str>,
    ) -> AppResult<AiResponse> {
        Ok(AiResponse {
            content: "Ollama mock response".to_string(),
            model: "ollama".to_string(),
            usage: Default::default(),
        })
    }

    async fn stream_completion(
        &self,
        _messages: &[ChatMessage],
        _model: &str,
        _options: &ChatOptions,
        _api_key: Option<&str>,
    ) -> AppResult<Vec<super::super::models::StreamChunk>> {
        Ok(vec![])
    }

    async fn list_models(&self, _api_key: Option<&str>) -> AppResult<Vec<ModelInfo>> {
        Ok(vec![])
    }

    async fn test_connection(&self, _api_key: Option<&str>) -> AppResult<bool> {
        Ok(true)
    }
}
