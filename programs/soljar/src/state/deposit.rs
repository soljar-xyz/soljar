use anchor_lang::prelude::*;

#[account]
#[derive(InitSpace)]
pub struct Deposit {
    pub signer: Pubkey,
    pub jar: Pubkey,
    pub meta: Pubkey,
    pub currency_mint: Pubkey,
    pub amount: u64,
    pub created_at: i64,
    pub updated_at: i64,
}
