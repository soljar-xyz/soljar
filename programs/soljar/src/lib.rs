#![allow(clippy::result_large_err)]

use anchor_lang::prelude::*;
use instructions::init_platform::*;
use instructions::create_user::*;
use instructions::init_indexes::*;
use instructions::init_tip_link::*;
use instructions::create_deposit::*;
use instructions::transfer_tokens::*;
use instructions::add_supporter::*;
use instructions::create_withdrawl::*;
use instructions::withdraw_tokens::*;


declare_id!("GpY6HvGukU7zzDkkPLP4UTUVcJJsSdPfrGq1PV1Xain7");

pub mod error;
pub mod instructions;
pub mod state;

#[program]
pub mod soljar {

    use super::*;

    pub fn init_platform(ctx: Context<InitPlatform>) -> Result<()> {
        instructions::init_platform::init_platform(ctx)
    }

    pub fn create_user(ctx: Context<CreateUser>, username: String) -> Result<()> {
        instructions::create_user::create_user(ctx, username)
    }

    pub fn init_indexes(ctx: Context<InitIndexes>, index_page: u32) -> Result<()> {
        instructions::init_indexes::init_indexes(ctx, index_page)
    }

    pub fn init_tip_link(ctx: Context<InitTipLink>, id: String, description: String, index_page: u32) -> Result<()> {
        instructions::init_tip_link::init_tip_link(ctx, id, description, index_page)
    }

    pub fn create_deposit(ctx: Context<CreateDeposit>, tip_link_id: String, currency_mint: Pubkey, referrer: String, memo: String, amount: u64) -> Result<()> {
        instructions::create_deposit::create_deposit(ctx, tip_link_id, currency_mint, referrer, memo, amount)
    }

    pub fn transfer_tokens(ctx: Context<TransferTokens>, tip_link_id: String, amount: u64) -> Result<()> {
        instructions::transfer_tokens::transfer_tokens(ctx, tip_link_id, amount)
    }

    pub fn add_supporter(ctx: Context<AddSupporter>, tip_link_id: String, currency_mint: Pubkey, amount: u64) -> Result<()> {
        instructions::add_supporter::add_supporter(ctx, tip_link_id, currency_mint, amount)
    }

    pub fn create_withdrawl(ctx: Context<CreateWithdrawl>, currency_mint: Pubkey, amount: u64) -> Result<()> {
        instructions::create_withdrawl::create_withdrawl(ctx, currency_mint, amount)
    }

    pub fn withdraw_tokens(ctx: Context<WithdrawTokens>, amount: u64) -> Result<()> {
        instructions::withdraw_tokens::withdraw_tokens(ctx, amount)
    }
    
}
