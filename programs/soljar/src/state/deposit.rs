use anchor_lang::prelude::*;

#[account]
pub struct Deposit {
    pub signer: Pubkey,
    pub jar_key: Pubkey,
    pub meta_key: Pubkey,
    pub currency_mint: Pubkey,
    pub amount: u64,
    pub created_at: i64,
    pub updated_at: i64,
}
