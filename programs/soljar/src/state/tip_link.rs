use anchor_lang::prelude::*;

#[account]
#[derive(InitSpace)]
pub struct TipLink {
    pub user_key: Pubkey,
    pub jar_key: Pubkey,
    pub created_at: i64,
    pub updated_at: i64,
    #[max_len(25)]
    pub id: String,
    #[max_len(100)]
    pub description: String,
}
