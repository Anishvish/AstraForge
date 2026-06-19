use tauri::State;
use crate::error::AppResult;
use crate::state::AppState;
use std::collections::HashMap;

#[tauri::command]
pub async fn get_setting(state: State<'_, AppState>, key: String) -> AppResult<Option<String>> {
    let db = state.db.lock();
    let mut stmt = db.prepare("SELECT value FROM settings WHERE key = ?")?;
    let mut rows = stmt.query([key])?;
    if let Some(row) = rows.next()? {
        let val: String = row.get(0)?;
        Ok(Some(val))
    } else {
        Ok(None)
    }
}

#[tauri::command]
pub async fn set_setting(state: State<'_, AppState>, key: String, value: String) -> AppResult<()> {
    let db = state.db.lock();
    db.execute(
        "INSERT OR REPLACE INTO settings (key, value, updated_at) VALUES (?, ?, datetime('now'))",
        [key, value],
    )?;
    Ok(())
}

#[tauri::command]
pub async fn get_all_settings(state: State<'_, AppState>) -> AppResult<HashMap<String, String>> {
    let db = state.db.lock();
    let mut stmt = db.prepare("SELECT key, value FROM settings")?;
    let rows = stmt.query_map([], |row| {
        Ok((row.get::<_, String>(0)?, row.get::<_, String>(1)?))
    })?;

    let mut settings = HashMap::new();
    for (k, v) in rows.flatten() {
        settings.insert(k, v);
    }
    Ok(settings)
}
