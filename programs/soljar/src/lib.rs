#![allow(clippy::result_large_err)]

use anchor_lang::prelude::*;
use instructions::create_user::*;
use instructions::create_deposit::*;
use instructions::add_supporter::*;
use instructions::create_withdrawl::*;
use instructions::withdraw_spl_tokens::*;
use instructions::create_spl_deposit::*;
use instructions::create_supporter_index::*;


declare_id!("JARSq9S9RgyynuAwcdWh2yEG6MbhfntWq7zjXjAo87uQ");

pub mod error;
pub mod instructions;
pub mod state;
pub mod constants;
pub mod utils;


#[cfg(not(feature = "no-entrypoint"))]
use solana_security_txt::security_txt;

#[cfg(not(feature = "no-entrypoint"))]
security_txt! {
    name: "Soljar",
    project_url: "https://soljar.xyz",
    contacts: "email:security@soljar.xyz",
    policy: "https://soljar.xyz/security-policy",

    // Optional Fields
    preferred_languages: "en",
    source_code: "https://github.com/soljar-xyz/soljar",
    source_release: "",
    encryption: ""
}

#[program]
pub mod soljar {

    use super::*;

    pub fn create_user(ctx: Context<CreateUser>, username: String) -> Result<()> {
        instructions::create_user::create_user(ctx, username)
    }

    pub fn create_deposit(ctx: Context<CreateDeposit>, tip_link_id: String, referrer: String, memo: String, amount: u64) -> Result<()> {
        instructions::create_deposit::create_deposit(ctx, tip_link_id, referrer, memo, amount)
    }

    pub fn add_supporter(ctx: Context<AddSupporter>, tip_link_id: String, currency_mint: Pubkey, amount: u64) -> Result<()> {
        instructions::add_supporter::add_supporter(ctx, tip_link_id, currency_mint, amount)
    }

    pub fn create_withdrawl(ctx: Context<CreateWithdrawl>, currency_mint: Pubkey, amount: u64) -> Result<()> {
        instructions::create_withdrawl::create_withdrawl(ctx, currency_mint, amount)
    }

    pub fn withdraw_spl_tokens(ctx: Context<WithdrawSplTokens>, amount: u64) -> Result<()> {
        instructions::withdraw_spl_tokens::withdraw_spl_tokens(ctx, amount)
    }

    pub fn create_spl_deposit(ctx: Context<CreateSplDeposit>, tip_link_id: String, referrer: String, memo: String, amount: u64) -> Result<()> {
        instructions::create_spl_deposit::create_spl_deposit(ctx, tip_link_id, referrer, memo, amount)
    }

    pub fn create_supporter_index(ctx: Context<CreateSupporterIndex>, index: u32) -> Result<()> {
        instructions::create_supporter_index::create_supporter_index(ctx, index)
    }
}
