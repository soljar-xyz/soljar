use anchor_lang::prelude::*;

#[derive(AnchorDeserialize, AnchorSerialize, Clone, InitSpace)]
pub struct TipInfo {
    #[max_len(4)]
    pub currency: String,
    pub amount: u64,
}

#[account]
#[derive(InitSpace)]
pub struct Supporter {
    pub signer: Pubkey,
    pub created_at: i64,
    pub updated_at: i64,
    pub tip_count: u16,
    // Vector to store multiple tip currencies and their info
    #[max_len(4)] // Set a reasonable maximum number of different currencies
    pub tips: Vec<TipInfo>,
}
    