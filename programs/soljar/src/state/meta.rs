use anchor_lang::prelude::*;

#[account]
#[derive(InitSpace)]
pub struct Meta {
    pub jar: Pubkey,
    pub deposit: Pubkey,
    #[max_len(100)]
    pub referrer: String,
    pub created_at: i64,
    pub updated_at: i64,
}
