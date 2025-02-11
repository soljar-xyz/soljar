use anchor_lang::prelude::*;

#[account]
#[derive(InitSpace)]
pub struct Withdrawl {
    pub jar: Pubkey,
    pub currency_mint: Pubkey,
    pub amount: u64,
    pub created_at: i64,
}
