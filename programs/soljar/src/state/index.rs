use anchor_lang::prelude::*;

#[account]
#[derive(InitSpace)]
pub struct Index {
    pub user_key: Pubkey,
    pub jar_key: Pubkey,

    pub deposit_index_page: u32,
    pub withdrawl_index_page: u32,
    pub meta_index_page: u32,
    pub tip_link_index_page: u32,

    pub total_deposits: u32,
    pub total_withdrawls: u32,
    pub total_metas: u32,
    pub total_tip_links: u32,

    pub created_at: i64,
    pub updated_at: i64,
}