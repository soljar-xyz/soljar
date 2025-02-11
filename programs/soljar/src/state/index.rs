use anchor_lang::prelude::*;

#[account]
#[derive(InitSpace)]
pub struct Index {
    pub user: Pubkey,
    pub jar: Pubkey,

    pub deposit_index_page: u32,
    pub withdrawl_index_page: u32,
    pub supporter_index_page: u32,

    pub total_deposits: u32,
    pub total_withdrawls: u32,
    pub total_supporters: u32,

    pub created_at: i64,
    pub updated_at: i64,
}