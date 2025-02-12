use anchor_lang::prelude::*;

#[account]
#[derive(InitSpace)]
pub struct Deposit {
    pub signer: Pubkey,
    pub jar: Pubkey,
    pub tip_link: Pubkey,
    pub currency_mint: Pubkey,
    pub amount: u64,
    pub created_at: i64,
    #[max_len(25)]
    pub referrer: String,
    #[max_len(20)]
    pub memo: String,
}
