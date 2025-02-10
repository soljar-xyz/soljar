use anchor_lang::prelude::*;

use crate::state::*;
use crate::error::ErrorCode;

pub fn create_user(ctx: Context<CreateUser>, username: String) -> Result<()> {
    require!(username.len() <= 15, ErrorCode::UsernameTooLong);
    require!(
        !ctx.accounts.user_by_name.username_taken,
        ErrorCode::UsernameAlreadyTaken
    );

    let platform = &mut ctx.accounts.platform;
    platform.user_count += 1;
    platform.updated_at = Clock::get()?.unix_timestamp;
    
    let user = &mut ctx.accounts.user;
    user.username = username;
    user.receiver_wallet = ctx.accounts.signer.key();
    user.jar = ctx.accounts.jar.key();
    user.created_at = Clock::get()?.unix_timestamp;
    user.updated_at = Clock::get()?.unix_timestamp;

    let jar = &mut ctx.accounts.jar;
    jar.user = ctx.accounts.user.key();
    jar.index = ctx.accounts.index.key();
    jar.created_at = Clock::get()?.unix_timestamp;
    jar.updated_at = Clock::get()?.unix_timestamp;
    jar.balances = vec![];  // Will track SOL and USDC balances

    let index = &mut ctx.accounts.index;
    index.user = ctx.accounts.user.key();
    index.jar = ctx.accounts.jar.key();
    index.deposit_index_page = 0;
    index.withdrawl_index_page = 0;
    index.meta_index_page = 0;
    index.tip_link_index_page = 0;
    index.total_deposits = 0;
    index.total_withdrawls = 0;
    index.total_metas = 0;
    index.total_tip_links = 0;
    index.created_at = Clock::get()?.unix_timestamp;
    index.updated_at = Clock::get()?.unix_timestamp;

    // Set the username as taken in the username tracker account
    let username_tracker = &mut ctx.accounts.user_by_name;
    username_tracker.username_taken = true;

    Ok(())
}

#[derive(Accounts)]
#[instruction(username: String)]
pub struct CreateUser<'info> {
    #[account(mut)]
    pub signer: Signer<'info>,

    #[account(
        mut,
        seeds = [b"platform"],
        bump
    )]
    pub platform: Account<'info, Platform>,
    
    #[account(
        init,
        payer = signer,
        space = 8 + User::INIT_SPACE,
        seeds = [b"user", signer.key().as_ref()],
        bump
    )]
    pub user: Box<Account<'info, User>>,

    #[account(
        init,
        payer = signer,
        space = 8 + UserByName::INIT_SPACE,
        seeds = [b"username", username.as_bytes()],
        bump
    )]
    pub user_by_name: Box<Account<'info, UserByName>>,

    #[account(
        init,
        payer = signer,
        space = 8 + Jar::INIT_SPACE,
        seeds = [b"jar", user.key().as_ref()],
        bump
    )]
    pub jar: Box<Account<'info, Jar>>,

    #[account(
        init,
        payer = signer,
        space = 8 + Index::INIT_SPACE,
        seeds = [b"index", jar.key().as_ref()],
        bump
    )]
    pub index: Box<Account<'info, Index>>,


    system_program: Program<'info, System>,
}
