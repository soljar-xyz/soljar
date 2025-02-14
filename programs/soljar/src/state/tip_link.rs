use anchor_lang::prelude::*;

#[account]
#[derive(InitSpace)]
pub struct TipLink {
    pub user: Pubkey,
    pub jar: Pubkey,
    pub deposit_count: u64,
    pub created_at: i64,
    pub updated_at: i64,
    #[max_len(25)]
    pub id: String,
    #[max_len(100)]
    pub description: String,
}

impl TipLink {
    pub const MAX_ID_LENGTH: usize = 25; // adjust as needed
    pub const MAX_DESCRIPTION_LENGTH: usize = 100; // adjust as needed
}
