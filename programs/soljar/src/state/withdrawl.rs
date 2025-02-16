use anchor_lang::prelude::*;

#[account]
#[derive(InitSpace)]
pub struct Withdrawl {
    pub jar: Pubkey,
    #[max_len(4)]
    pub currency: String,
    pub amount: u64,
    pub created_at: i64,
}
