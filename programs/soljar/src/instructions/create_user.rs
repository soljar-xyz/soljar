use anchor_lang::prelude::*;

use crate::state::*;
use crate::error::ErrorCode;

pub fn create_user(ctx: Context<CreateUser>, username: String) -> Result<()> {
    require!(username.len() <= 15, ErrorCode::UsernameTooLong);
    
    let user = &mut ctx.accounts.user;
    user.username = username;
    user.receiver_wallet = ctx.accounts.signer.key();
    user.jar_key = ctx.accounts.jar.key();
    user.created_at = Clock::get()?.unix_timestamp;
    user.updated_at = Clock::get()?.unix_timestamp;

    let jar = &mut ctx.accounts.jar;
    jar.user_key = ctx.accounts.user.key();
    jar.created_at = Clock::get()?.unix_timestamp;
    jar.updated_at = Clock::get()?.unix_timestamp;
    jar.total_deposits = 0;
    jar.total_withdrawls = 0;
    jar.total_metas = 0;
    jar.balances = vec![];  // Will track SOL and USDC balances


    Ok(())
}

#[derive(Accounts)]
pub struct CreateUser<'info> {
    #[account(mut)]
    pub signer: Signer<'info>,

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
        space = 8 + Jar::INIT_SPACE,
        seeds = [b"jar", user.key().as_ref()],
        bump
    )]
    pub jar: Box<Account<'info, Jar>>,


    system_program: Program<'info, System>,
}
