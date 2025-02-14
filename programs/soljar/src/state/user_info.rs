use anchor_lang::prelude::*;

#[account]
#[derive(InitSpace)]
pub struct UserInfo {
    pub user: Pubkey,
    #[max_len(10)]
    pub tip_links: Vec<Pubkey>,
}

impl UserInfo {
    pub const MAX_TIP_LINKS: u8 = 10; // adjust as needed
}
