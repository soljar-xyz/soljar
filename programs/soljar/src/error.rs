use anchor_lang::prelude::*;

#[error_code]
pub enum ErrorCode {
    #[msg("OVERFLOW")]
    Overflow,
    #[msg("NO_CHANGES_DETECTED")]
    NoChanges,
    #[msg("USERNAME_TOO_LONG")]
    UsernameTooLong,
    #[msg("username_already_exists")]
    UsernameAlreadyExists,
}
