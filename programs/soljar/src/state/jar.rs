use anchor_lang::prelude::*;


#[account]
#[derive(InitSpace)]
pub struct Jar {
    pub user: Pubkey,
    pub deposit_count: u32,
    pub withdrawl_count: u32,
    pub supporter_count: u32,
    pub supporter_index: u32,
    pub created_at: i64,
    pub updated_at: i64,
    #[max_len(25)]
    pub id: String,
    pub bump: u8,
}