use anchor_lang::prelude::*;

#[account]
#[derive(InitSpace)]
pub struct Deposit {
    pub signer: Pubkey,
    pub tip_link: Pubkey,
    #[max_len(4)]
    pub currency: String,
    pub amount: u64,
    pub created_at: i64,
    #[max_len(25)]
    pub referrer: String,
    #[max_len(20)]
    pub memo: String,
}

impl Deposit {
    pub const MAX_REFERRER_LENGTH: usize = 50; // adjust as needed
    pub const MAX_MEMO_LENGTH: usize = 200; // adjust as needed
}
