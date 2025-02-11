use anchor_lang::prelude::*;

#[account]
#[derive(InitSpace)]
pub struct UserInfo {
    pub user: Pubkey,
    pub tip_link_count: u32,
    #[max_len(10)]
    pub tip_links: Vec<Pubkey>,
}
