use tauri::{AppHandle, State};
use crate::error::AppResult;
use crate::state::AppState;
use crate::ai::models::{AiResponse, ChatMessage, ChatOptions, ModelInfo, ProviderConfig};
use crate::ai::gateway::AiGateway;

#[tauri::command]
pub async fn ai_chat(
    _messages: Vec<ChatMessage>,
    model_id: String,
    provider_id: String,
) -> AppResult<AiResponse> {
    let gateway = AiGateway::new();
    gateway.chat(&provider_id, &model_id, &_messages, &ChatOptions::default(), None).await
}

#[tauri::command]
pub async fn ai_stream_chat(
    _app: AppHandle,
    _messages: Vec<ChatMessage>,
    _model_id: String,
    _provider_id: String,
) -> AppResult<String> {
    // Return a dummy stream request id or similar
    Ok("stream_id_123".to_string())
}

#[tauri::command]
pub async fn ai_list_models(provider_id: String) -> AppResult<Vec<ModelInfo>> {
    let gateway = AiGateway::new();
    if let Some(prov) = gateway.providers.get(&provider_id) {
        prov.list_models(None).await
    } else {
        Ok(vec![])
    }
}

#[tauri::command]
pub async fn ai_test_connection(provider_id: String) -> AppResult<bool> {
    let gateway = AiGateway::new();
    if let Some(prov) = gateway.providers.get(&provider_id) {
        prov.test_connection(None).await
    } else {
        Ok(false)
    }
}

#[tauri::command]
pub async fn save_provider_config(state: State<'_, AppState>, config: ProviderConfig) -> AppResult<()> {
    let db = state.db.lock();
    db.execute(
        "INSERT OR REPLACE INTO provider_configs (id, provider_type, name, base_url, is_active) VALUES (?, ?, ?, ?, ?)",
        (&config.id, &config.provider_type, &config.name, &config.base_url, if config.is_active { 1 } else { 0 }),
    )?;
    Ok(())
}

#[tauri::command]
pub async fn get_provider_configs(state: State<'_, AppState>) -> AppResult<Vec<ProviderConfig>> {
    let db = state.db.lock();
    let mut stmt = db.prepare("SELECT id, provider_type, name, base_url, is_active FROM provider_configs")?;
    
    let rows = stmt.query_map([], |row| {
        let is_active_int: i32 = row.get(4)?;
        Ok(ProviderConfig {
            id: row.get(0)?,
            provider_type: row.get(1)?,
            name: row.get(2)?,
            base_url: row.get(3)?,
            is_active: is_active_int != 0,
        })
    })?;
    
    let mut list = Vec::new();
    for row in rows {
        if let Ok(c) = row {
            list.push(c);
        }
    }
    Ok(list)
}

#[tauri::command]
pub async fn save_api_key(provider_id: String, api_key: String) -> AppResult<()> {
    // Keyring integration would save this securely. For now, keep it simple.
    let entry = keyring::Entry::new("astraforge", &provider_id)?;
    entry.set_password(&api_key)?;
    Ok(())
}
