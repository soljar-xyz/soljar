use anchor_lang::prelude::*;

#[account]
#[derive(InitSpace)]
pub struct Deposit {
    pub signer: Pubkey,
    pub jar: Pubkey,
    pub meta: Pubkey,
    pub tip_link: Pubkey,
    pub currency_mint: Pubkey,
    pub amount: u64,
    pub created_at: i64,
}
