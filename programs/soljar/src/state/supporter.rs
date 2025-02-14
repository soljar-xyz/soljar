use anchor_lang::prelude::*;

#[derive(AnchorDeserialize, AnchorSerialize, Clone, InitSpace)]
pub struct TipInfo {
    pub mint: Pubkey,
    pub tip_link: Pubkey,
    pub amount: u64,
    pub tip_count: u32,
}

#[account]
#[derive(InitSpace)]
pub struct Supporter {
    pub signer: Pubkey,
    pub jar: Pubkey,
    pub created_at: i64,
    pub updated_at: i64,
    // Vector to store multiple tip currencies and their info
    #[max_len(6)] // Set a reasonable maximum number of different currencies
    pub tips: Vec<TipInfo>,
}
    