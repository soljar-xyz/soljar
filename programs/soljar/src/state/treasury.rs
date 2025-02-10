use anchor_lang::prelude::*;

#[account]
#[derive(InitSpace)]
pub struct Treasury {
    pub jar: Pubkey,
    pub created_at: i64,
    pub updated_at: i64,
    pub bump: u8,
}