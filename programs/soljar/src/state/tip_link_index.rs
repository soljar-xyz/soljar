use anchor_lang::prelude::*;

#[account]
#[derive(InitSpace)]
pub struct TipLinkIndex {
    pub jar_key: Pubkey,
    pub index: u64,
    pub created_at: i64,
    pub updated_at: i64,
    pub total_items: u64,
    #[max_len(50)]
    pub tip_links: Vec<Pubkey>,
}
