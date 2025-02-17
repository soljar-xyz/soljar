use anchor_lang::prelude::*;

#[derive(AnchorDeserialize, AnchorSerialize, Clone, InitSpace)]
pub struct TipInfo {
    pub currency: u8,  // 0 = SOL, 1 = USDC, 2 = USDT
    pub amount: u64,
}

#[account]
#[derive(InitSpace)]
pub struct Supporter {
    pub signer: Pubkey,
    pub created_at: i64,
    pub tip_count: u16,
    pub tips: [TipInfo; 4],
    pub active_tips: u8,
}
    