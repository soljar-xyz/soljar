use anchor_lang::prelude::*;

#[account]
#[derive(InitSpace)]
pub struct Platform {
    pub user_count: u64,
    pub jar_count: u64,
    pub tip_link_count: u64,
    pub deposit_count: u64,
    pub withdrawl_count: u64,
    pub created_at: i64,
    pub updated_at: i64,
}
