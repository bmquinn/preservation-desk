pub fn compute_sha256(bytes: &[u8], path: &str) -> String {
    use data_encoding::HEXLOWER;
    use ring::digest;
    let sha256_digest = digest::digest(&digest::SHA256, bytes);
    let sha256 = HEXLOWER.encode(&sha256_digest.as_ref());
    println!("{} SHA256: {}", path, sha256);
    sha256
}

pub fn compute_sha512(bytes: &[u8], path: &str) -> String {
    use data_encoding::HEXLOWER;
    use ring::digest;
    let sha512_digest = digest::digest(&digest::SHA512, bytes);
    let sha512 = HEXLOWER.encode(&sha512_digest.as_ref());
    println!("{} SHA512: {}", path, sha512);
    sha512
}

pub fn compute_blake3(bytes: &[u8], path: &str) -> String {
    let blake3 = blake3::hash(bytes).to_hex().to_string();
    println!("{} BLAKE3: {}", path, blake3);
    blake3
}

pub fn compute_md5(bytes: &[u8], path: &str) -> String {
    let md5 = format!("{:x}", md5::compute(bytes));
    println!("{} MD5: {}", path, md5);
    md5
}
