#![cfg_attr(
    all(not(debug_assertions), target_os = "windows"),
    windows_subsystem = "windows"
)]

mod checksum;
mod file_info;

use serde::Serialize;

#[derive(Serialize)]
struct FileInfo {
    is_dir: String,
    size: String,
    mime_type: String,
}

#[derive(Serialize)]
struct Checksum {
    sha256: String,
    sha512: String,
    blake3: String,
    md5: String,
}

#[tauri::command]
async fn checksum(path: &str) -> Result<Checksum, String> {
    println!("file_info command invoked from JS: {}", path);
    let bytes = std::fs::read(path).map_err(|err| {
        println!("{} error: {}", path, err);
        err.to_string()
    })?;

    use rayon::prelude::*;
    let hashes: Vec<String> = (0..4)
        .into_par_iter()
        .map(|i| {
            let result = match i {
                0 => checksum::compute_sha256(&bytes, &path),
                1 => checksum::compute_sha512(&bytes, &path),
                2 => checksum::compute_blake3(&bytes, &path),
                3 => checksum::compute_md5(&bytes, &path),
                _ => unreachable!(),
            };
            result.to_string()
        })
        .collect();

    let [sha256, sha512, blake3, md5] = [
        hashes[0].clone(),
        hashes[1].clone(),
        hashes[2].clone(),
        hashes[3].clone(),
    ];
    Ok(Checksum {
        sha256,
        sha512,
        blake3,
        md5,
    })
}

#[tauri::command]
async fn file_info(path: &str) -> Result<FileInfo, String> {
    let mime_type = file_info::extract_mime_type(&path);
    
    let metadata = std::fs::metadata(path).map_err(|err| {
        println!("{} error: {}", path, err);
        err.to_string()
    })?;
    let size = file_info::size(&path, &metadata);
    let is_dir = file_info::is_dir(&path, &metadata);

    Ok(FileInfo { mime_type, size, is_dir })
}

fn main() {
    tauri::Builder::default()
        .invoke_handler(tauri::generate_handler![checksum, file_info])
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}
