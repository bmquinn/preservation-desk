pub fn extract_mime_type(path: &str) -> String {
    let mime_type = match infer::get_from_path(&path) {
        Ok(option) => match option {
            Some(infer_type) => infer_type.mime_type(),
            None => "unkown",
        },
        Err(_) => "unkown",
    };
    println!("{} mime type is {}", path, mime_type);
    mime_type.to_string()
}

pub fn size(path: &str, metadata: &std::fs::Metadata) -> String {
    let len = metadata.len().to_string();
    println!("{} size is {} bytes", path, &len);
    len
}

pub fn is_dir(path: &str, metadata: &std::fs::Metadata) -> String {
    let is_dir = metadata.is_dir().to_string();
    println!("{} size is {} bytes", path, &is_dir);
    is_dir
}