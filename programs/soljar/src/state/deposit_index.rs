use anchor_lang::prelude::*;

#[account]
#[derive(InitSpace)]
pub struct DepositIndex {
    pub index: Pubkey,
    pub index_page: u32,
    pub total_items: u8,
    #[max_len(50)]
    pub deposits: Vec<Pubkey>,
}

impl DepositIndex {
    pub const MAX_DEPOSITS: usize = 50; // Changed from 49 to match the Vec max_len
}
