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
