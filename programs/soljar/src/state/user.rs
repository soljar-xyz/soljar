use anchor_lang::prelude::*;

#[account]
#[derive(InitSpace)]
pub struct User {
    pub user: Pubkey,
    pub jar: Pubkey,
    #[max_len(15)]
    pub username: String,
    pub created_at: i64,
    pub updated_at: i64,
}
