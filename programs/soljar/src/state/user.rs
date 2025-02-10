use anchor_lang::prelude::*;

#[account]
#[derive(InitSpace)]
pub struct User {
    pub user: Pubkey,
    pub platform: Pubkey,
    #[max_len(15)]
    pub username: String,
    pub receiver_wallet: Pubkey,
    pub jar: Pubkey,
    pub created_at: i64,
    pub updated_at: i64,
}
