use anchor_lang::prelude::*;


#[account]
#[derive(InitSpace)]
pub struct Jar {
    pub user: Pubkey,
    pub index: Pubkey,
    pub created_at: i64,
    pub updated_at: i64,
}