use anchor_lang::prelude::*;

#[account]
#[derive(InitSpace)]
pub struct TipLink {
    pub jar_key: Pubkey,
    pub meta_key: Pubkey,
    pub created_at: i64,
    pub updated_at: i64,
    #[max_len(100)]
    pub name: String,
}
