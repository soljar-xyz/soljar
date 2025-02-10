use anchor_lang::prelude::*;

#[account]
pub struct Withdrawl {
    pub jar: Pubkey,
    pub amount: u64,
    pub created_at: i64,
    pub updated_at: i64,
}
