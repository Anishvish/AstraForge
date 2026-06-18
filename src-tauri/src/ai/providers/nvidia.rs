use crate::error::{AppError, AppResult};
use crate::ai::models::{AiResponse, ChatMessage, ChatOptions, ModelInfo};
use super::AiProvider;

pub struct NvidiaProvider;

impl NvidiaProvider {
    pub fn new() -> Self {
        Self
    }
}

#[async_trait::async_trait]
impl AiProvider for NvidiaProvider {
    async fn chat_completion(
        &self,
        _messages: &[ChatMessage],
        _model: &str,
        _options: &ChatOptions,
        _api_key: Option<&str>,
    ) -> AppResult<AiResponse> {
        Ok(AiResponse {
            content: "NVIDIA mock response".to_string(),
            model: "nvidia".to_string(),
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
