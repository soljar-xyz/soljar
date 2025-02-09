use anchor_lang::prelude::*;

#[derive(AnchorSerialize, AnchorDeserialize, Clone)]
pub struct Balance {
    pub jar_key: Pubkey,
    pub mint: Pubkey,
    pub amount: u64,
}

#[account]
#[derive(InitSpace)]
pub struct Jar {
    pub user_key: Pubkey,
    pub deposit_index_key: Pubkey,
    pub withdrawl_index_key: Pubkey,
    pub meta_index_key: Pubkey,
    pub tip_link_index_key: Pubkey,
    pub created_at: i64,
    pub updated_at: i64,
    pub total_deposits: u64,
    pub total_withdrawls: u64,
    pub total_metas: u64,
    #[max_len(50)]
    pub balances: Vec<Pubkey>,
}