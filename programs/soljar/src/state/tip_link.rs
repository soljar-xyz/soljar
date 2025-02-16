use anchor_lang::prelude::*;

#[account]
#[derive(InitSpace)]
pub struct TipLink {
    pub user: Pubkey,
    pub jar: Pubkey,
}