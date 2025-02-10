use anchor_lang::prelude::*;

#[account]
#[derive(InitSpace)]
pub struct TipLinkIndex {
    pub index: Pubkey,
    pub index_page: u32,
    pub created_at: i64,
    pub updated_at: i64,
    pub total_items: u8,
    #[max_len(50)]
    pub tip_links: Vec<Pubkey>,
}
