use anchor_lang::prelude::*;

#[account]
#[derive(InitSpace)]
pub struct Supporter {
    pub signer: Pubkey,
    pub jar: Pubkey,
    pub mint: Pubkey,
    pub tip_link: Pubkey,
    pub amount: u64,
    pub created_at: i64,
    pub updated_at: i64,
    pub tip_count: u32,
}
    