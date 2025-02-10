#![allow(clippy::result_large_err)]

use anchor_lang::prelude::*;
use instructions::init_platform::*;
use instructions::create_user::*;
use instructions::init_indexes::*;
use instructions::create_deposit_index::*;
use instructions::init_tip_link::*;

declare_id!("APfu475CVFEop5CJbpRW9c2sbpbvvQmtixsTfe27pN7g");

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


    pub fn create_deposit_index(ctx: Context<CreateDepositIndex>) -> Result<()> {
        instructions::create_deposit_index::create_deposit_index(ctx)
    }

    pub fn init_indexes(ctx: Context<InitIndexes>) -> Result<()> {
        instructions::init_indexes::init_indexes(ctx)
    }

    pub fn init_tip_link(ctx: Context<InitTipLink>, id: String, description: String) -> Result<()> {
        instructions::init_tip_link::init_tip_link(ctx, id, description)
    }
}
