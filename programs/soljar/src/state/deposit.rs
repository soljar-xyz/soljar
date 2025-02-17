use anchor_lang::prelude::*;

#[account]
#[derive(InitSpace)]
pub struct Deposit {
    pub signer: Pubkey,
    pub created_at: i64,
    pub amount: u64,
    #[max_len(15)]
    pub link_id: String,
    pub currency: u8,  // 0 = SOL, 1 = USDC, 2 = USDT
    #[max_len(25)]
    pub referrer: String,
    #[max_len(20)]
    pub memo: String,
}

impl Deposit {
    pub const MAX_REFERRER_LENGTH: usize = 50; // adjust as needed
    pub const MAX_MEMO_LENGTH: usize = 200; // adjust as needed
}
