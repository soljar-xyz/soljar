use anchor_lang::prelude::*;

#[account]
#[derive(InitSpace)]
pub struct SupporterIndex {
    pub total_items: u8,
    #[max_len(50)]
    pub supporters: Vec<Pubkey>,
}

impl SupporterIndex {
    pub const MAX_SUPPORTERS: u8 = 50;
}