use anchor_lang::prelude::*;

#[account]
#[derive(InitSpace)]
pub struct Withdrawl {
    pub jar: Pubkey,
    pub currency: u8,  // 0 = SOL, 1 = USDC, 2 = USDT
    pub amount: u64,
    pub created_at: i64,
}
