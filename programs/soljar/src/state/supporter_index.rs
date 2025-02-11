use anchor_lang::prelude::*;

#[account]
#[derive(InitSpace)]
pub struct SupporterIndex {
    pub index: Pubkey,
    pub index_page: u32,
    pub total_items: u8,
    #[max_len(50)]
    pub supporters: Vec<Pubkey>,
}
