use anchor_lang::prelude::*;

#[account]
#[derive(InitSpace)]
pub struct WithdrawlIndex {
    pub index: Pubkey,
    pub index_page: u32,
    pub total_items: u8,
    #[max_len(50)]
    pub withdrawls: Vec<Pubkey>,
}

impl WithdrawlIndex {
    pub const MAX_WITHDRAWLS: usize = 50; // matches your current logic
}
