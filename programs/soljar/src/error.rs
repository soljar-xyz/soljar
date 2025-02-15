use anchor_lang::prelude::*;

#[error_code]
pub enum SoljarError {
    #[msg("OVERFLOW")]
    Overflow,
    #[msg("NO_CHANGES_DETECTED")]
    NoChanges,
    #[msg("USERNAME_TOO_LONG")]
    UsernameTooLong,
    #[msg("USERNAME_ALREADY_TAKEN")]
    UsernameAlreadyTaken,
    #[msg("Amount overflow occurred")]
    AmountOverflow,
    #[msg("Tip count overflow occurred")]
    TipCountOverflow,
    #[msg("Index overflow occurred")]
    IndexOverflow,
    #[msg("Total supporters overflow occurred")]
    TotalSupportersOverflow,
    #[msg("Page number overflow occurred")]
    PageOverflow,
    #[msg("Supporter index is full")]
    SupporterIndexFull,
    #[msg("Amount must be greater than 0")]
    InvalidAmount,
    #[msg("User count overflow occurred")]
    UserCountOverflow,
    #[msg("Invalid index page")]
    InvalidIndexPage,
    #[msg("Too many tip links")]
    TooManyTipLinks,
    #[msg("Invalid ID length")]
    InvalidIdLength,
    #[msg("Invalid description length")]
    InvalidDescriptionLength,
    #[msg("Tip link count overflow")]
    TipLinkCountOverflow,
    #[msg("Referrer string too long")]
    ReferrerTooLong,
    #[msg("Memo string too long")]
    MemoTooLong,
    #[msg("Insufficient funds")]
    InsufficientFunds,
    #[msg("Too many deposits in index")]
    TooManyDeposits,
    #[msg("Insufficient funds in jar")]
    InsufficientFundsInJar,
    #[msg("Too many withdrawls in index")]
    TooManyWithdrawls,
    #[msg("Arithmetic overflow")]
    ArithmeticOverflow,
    #[msg("Insufficient token balance")]
    InsufficientTokenBalance,
    #[msg("Invalid token mint")]
    InvalidTokenMint,
    #[msg("Max currencies reached")]
    MaxCurrenciesReached,
    #[msg("Unsupported currency")]
    UnsupportedCurrency,
    #[msg("Invalid currency mint")]
    InvalidCurrencyMint,
}
