#![allow(clippy::result_large_err)]

use anchor_lang::prelude::*;
use instructions::create_user::*;
use instructions::create_indexes::*;

declare_id!("APfu475CVFEop5CJbpRW9c2sbpbvvQmtixsTfe27pN7g");

pub mod error;
pub mod instructions;
pub mod state;

#[program]
pub mod soljar {

    use super::*;

    pub fn create_user(ctx: Context<CreateUser>, username: String) -> Result<()> {
        instructions::create_user::create_user(ctx, username)
    }


    pub fn create_indexes(ctx: Context<CreateIndexes>) -> Result<()> {
        instructions::create_indexes::create_indexes(ctx)
    }

}
