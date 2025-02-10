use anchor_lang::prelude::*;

#[account]
#[derive(InitSpace)]
pub struct MetaIndex {
    pub index_key: Pubkey,
    pub index: u32,
    pub created_at: i64,
    pub updated_at: i64,
    pub total_items: u64,
    #[max_len(50)]
    pub metas: Vec<Pubkey>,
}
