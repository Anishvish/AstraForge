use std::sync::Arc;
use crate::error::{AppError, AppResult};
use super::models::{AiResponse, ChatMessage, ChatOptions};
use super::providers::{AiProvider, nvidia::NvidiaProvider, ollama::OllamaProvider, openai_compat::OpenaiCompatProvider};

pub struct AiGateway {
    pub providers: std::collections::HashMap<String, Arc<dyn AiProvider>>,
}

impl Default for AiGateway {
    fn default() -> Self {
        Self::new()
    }
}

impl AiGateway {
    pub fn new() -> Self {
        let mut providers: std::collections::HashMap<String, Arc<dyn AiProvider>> = std::collections::HashMap::new();
        providers.insert("nvidia".to_string(), Arc::new(NvidiaProvider::new()));
        providers.insert("ollama".to_string(), Arc::new(OllamaProvider::new()));
        providers.insert("openai".to_string(), Arc::new(OpenaiCompatProvider::new()));
        Self { providers }
    }

    pub async fn chat(
        &self,
        provider_id: &str,
        model: &str,
        messages: &[ChatMessage],
        options: &ChatOptions,
        api_key: Option<&str>,
    ) -> AppResult<AiResponse> {
        let provider = self.providers.get(provider_id)
            .ok_or_else(|| AppError::NotFound(format!("AI provider not found: {}", provider_id)))?;
        provider.chat_completion(messages, model, options, api_key).await
    }
}
