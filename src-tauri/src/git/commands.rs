use git2::{
    BranchType, DiffOptions, IndexAddOption, Repository, Signature, StatusOptions,
    StatusShow,
};
use std::path::Path;

use crate::error::{AppError, AppResult};

use super::{GitBranch, GitCommit, GitFileChange, GitStatus};

#[tauri::command]
pub async fn git_init(path: String) -> AppResult<()> {
    let p = path.clone();
    tokio::task::spawn_blocking(move || {
        Repository::init(&p)?;
        Ok(())
    })
    .await
    .map_err(|e| AppError::Internal(e.to_string()))?
}

#[tauri::command]
pub async fn git_status(path: String) -> AppResult<GitStatus> {
    let p = path.clone();
    tokio::task::spawn_blocking(move || {
        let repo = Repository::open(&p)?;
        let mut opts = StatusOptions::new();
        opts.include_untracked(true)
            .recurse_untracked_dirs(true)
            .show(StatusShow::IndexAndWorkdir);

        let statuses = repo.statuses(Some(&mut opts))?;

        let mut staged = Vec::new();
        let mut unstaged = Vec::new();
        let mut untracked = Vec::new();

        for entry in statuses.iter() {
            let file_path = entry.path().unwrap_or("").to_string();
            let status = entry.status();

            if status.is_index_new()
                || status.is_index_modified()
                || status.is_index_deleted()
                || status.is_index_renamed()
                || status.is_index_typechange()
            {
                let s = if status.is_index_new() {
                    "added"
                } else if status.is_index_modified() {
                    "modified"
                } else if status.is_index_deleted() {
                    "deleted"
                } else if status.is_index_renamed() {
                    "renamed"
                } else {
                    "typechange"
                };
                staged.push(GitFileChange {
                    path: file_path.clone(),
                    status: s.to_string(),
                });
            }

            if status.is_wt_modified()
                || status.is_wt_deleted()
                || status.is_wt_renamed()
                || status.is_wt_typechange()
            {
                let s = if status.is_wt_modified() {
                    "modified"
                } else if status.is_wt_deleted() {
                    "deleted"
                } else if status.is_wt_renamed() {
                    "renamed"
                } else {
                    "typechange"
                };
                unstaged.push(GitFileChange {
                    path: file_path.clone(),
                    status: s.to_string(),
                });
            }

            if status.is_wt_new() {
                untracked.push(file_path);
            }
        }

        Ok(GitStatus {
            staged,
            unstaged,
            untracked,
        })
    })
    .await
    .map_err(|e| AppError::Internal(e.to_string()))?
}

#[tauri::command]
pub async fn git_diff(path: String, file_path: Option<String>) -> AppResult<String> {
    let p = path.clone();
    tokio::task::spawn_blocking(move || {
        let repo = Repository::open(&p)?;
        let mut diff_opts = DiffOptions::new();

        if let Some(ref fp) = file_path {
            diff_opts.pathspec(fp);
        }

        let diff = repo.diff_index_to_workdir(None, Some(&mut diff_opts))?;

        let mut diff_text = String::new();
        diff.print(git2::DiffFormat::Patch, |_delta, _hunk, line| {
            let prefix = match line.origin() {
                '+' => "+",
                '-' => "-",
                ' ' => " ",
                _ => "",
            };
            if !prefix.is_empty() {
                diff_text.push_str(prefix);
            }
            diff_text.push_str(&String::from_utf8_lossy(line.content()));
            true
        })?;

        Ok(diff_text)
    })
    .await
    .map_err(|e| AppError::Internal(e.to_string()))?
}

#[tauri::command]
pub async fn git_stage(path: String, files: Vec<String>) -> AppResult<()> {
    let p = path.clone();
    tokio::task::spawn_blocking(move || {
        let repo = Repository::open(&p)?;
        let mut index = repo.index()?;

        if files.is_empty() || (files.len() == 1 && files[0] == ".") {
            index.add_all(["*"].iter(), IndexAddOption::DEFAULT, None)?;
        } else {
            for file in &files {
                let file_path = Path::new(file);
                let abs_path = Path::new(&p).join(file_path);
                if abs_path.exists() {
                    index.add_path(file_path)?;
                } else {
                    // File was deleted, remove from index
                    index.remove_path(file_path)?;
                }
            }
        }

        index.write()?;
        Ok(())
    })
    .await
    .map_err(|e| AppError::Internal(e.to_string()))?
}

#[tauri::command]
pub async fn git_unstage(path: String, files: Vec<String>) -> AppResult<()> {
    let p = path.clone();
    tokio::task::spawn_blocking(move || {
        let repo = Repository::open(&p)?;
        let head = repo.head();

        match head {
            Ok(head_ref) => {
                let target = head_ref.peel_to_commit()?;
                let tree = target.tree()?;
                repo.reset_default(Some(tree.as_object()), files.iter().map(|s| Path::new(s)))?;
            }
            Err(_) => {
                // No commits yet, remove from index
                let mut index = repo.index()?;
                for file in &files {
                    index.remove_path(Path::new(file))?;
                }
                index.write()?;
            }
        }

        Ok(())
    })
    .await
    .map_err(|e| AppError::Internal(e.to_string()))?
}

#[tauri::command]
pub async fn git_commit(path: String, message: String) -> AppResult<String> {
    let p = path.clone();
    tokio::task::spawn_blocking(move || {
        let repo = Repository::open(&p)?;
        let mut index = repo.index()?;
        let oid = index.write_tree()?;
        let tree = repo.find_tree(oid)?;
        let sig = repo
            .signature()
            .unwrap_or_else(|_| Signature::now("AstraForge", "user@astraforge.dev").unwrap());

        let parent_commit = match repo.head() {
            Ok(head) => Some(head.peel_to_commit()?),
            Err(_) => None,
        };

        let parents: Vec<&git2::Commit> = parent_commit.iter().collect();

        let commit_oid = repo.commit(Some("HEAD"), &sig, &sig, &message, &tree, &parents)?;

        Ok(commit_oid.to_string())
    })
    .await
    .map_err(|e| AppError::Internal(e.to_string()))?
}

#[tauri::command]
pub async fn git_log(path: String, count: Option<usize>) -> AppResult<Vec<GitCommit>> {
    let p = path.clone();
    let limit = count.unwrap_or(50);

    tokio::task::spawn_blocking(move || {
        let repo = Repository::open(&p)?;
        let mut revwalk = repo.revwalk()?;
        revwalk.push_head()?;
        revwalk.set_sorting(git2::Sort::TIME)?;

        let mut commits = Vec::new();
        for oid in revwalk.take(limit).flatten() {
            let commit = repo.find_commit(oid)?;
            let author = commit.author();
            let time = commit.time();
            let datetime = chrono::DateTime::from_timestamp(time.seconds(), 0)
                .map(|dt| dt.format("%Y-%m-%d %H:%M:%S").to_string())
                .unwrap_or_else(|| "unknown".to_string());

            commits.push(GitCommit {
                hash: oid.to_string(),
                message: commit.message().unwrap_or("").to_string(),
                author: author.name().unwrap_or("Unknown").to_string(),
                date: datetime,
            });
        }
        Ok(commits)
    })
    .await
    .map_err(|e| AppError::Internal(e.to_string()))?
}

#[tauri::command]
pub async fn git_branches(path: String) -> AppResult<Vec<GitBranch>> {
    let p = path.clone();
    tokio::task::spawn_blocking(move || {
        let repo = Repository::open(&p)?;
        let mut branches_list = Vec::new();

        let head_ref = repo.head().ok();
        let current_branch_name = head_ref
            .as_ref()
            .and_then(|h| h.shorthand().map(|s| s.to_string()));

        // Local branches
        let branches = repo.branches(Some(BranchType::Local))?;
        for branch_result in branches {
            let (branch, _) = branch_result?;
            let name = branch.name()?.unwrap_or("").to_string();
            let is_current = current_branch_name.as_deref() == Some(&name);
            branches_list.push(GitBranch {
                name,
                is_current,
                is_remote: false,
            });
        }

        // Remote branches
        let remote_branches = repo.branches(Some(BranchType::Remote))?;
        for branch_result in remote_branches {
            let (branch, _) = branch_result?;
            let name = branch.name()?.unwrap_or("").to_string();
            branches_list.push(GitBranch {
                name,
                is_current: false,
                is_remote: true,
            });
        }

        Ok(branches_list)
    })
    .await
    .map_err(|e| AppError::Internal(e.to_string()))?
}

#[tauri::command]
pub async fn git_checkout(path: String, branch: String) -> AppResult<()> {
    let p = path.clone();
    tokio::task::spawn_blocking(move || {
        let repo = Repository::open(&p)?;

        let (object, reference) = repo.revparse_ext(&branch)?;
        repo.checkout_tree(&object, None)?;

        match reference {
            Some(gref) => {
                let refname_str = gref.name().map(|n| n.to_string()).unwrap_or_else(|| format!("refs/heads/{}", branch));
                repo.set_head(&refname_str)?;
            }
            None => {
                repo.set_head_detached(object.id())?;
            }
        }

        Ok(())
    })
    .await
    .map_err(|e| AppError::Internal(e.to_string()))?
}

#[tauri::command]
pub async fn git_create_branch(path: String, name: String) -> AppResult<()> {
    let p = path.clone();
    tokio::task::spawn_blocking(move || {
        let repo = Repository::open(&p)?;
        let head = repo.head()?;
        let commit = head.peel_to_commit()?;
        repo.branch(&name, &commit, false)?;
        Ok(())
    })
    .await
    .map_err(|e| AppError::Internal(e.to_string()))?
}

#[tauri::command]
pub async fn git_current_branch(path: String) -> AppResult<String> {
    let p = path.clone();
    tokio::task::spawn_blocking(move || {
        let repo = Repository::open(&p)?;
        let head = repo.head()?;
        let name = head.shorthand().unwrap_or("HEAD").to_string();
        Ok(name)
    })
    .await
    .map_err(|e| AppError::Internal(e.to_string()))?
}
