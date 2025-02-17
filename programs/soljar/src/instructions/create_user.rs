use anchor_lang::prelude::*;

use crate::state::*;
use crate::error::SoljarError;
use crate::utils::is_username_disallowed;

pub fn create_user(ctx: Context<CreateUser>, username: String) -> Result<()> {
    require!(username.len() <= 15, SoljarError::UsernameTooLong);
    require!(
        !ctx.accounts.user_by_name.username_taken,
        SoljarError::UsernameAlreadyTaken
    );

    require!(
        username == username.to_lowercase(),
        SoljarError::UsernameMustBeLowercase
    );
    
    require!(
        username.chars().all(|c| c.is_alphanumeric() || c == '_'),
        SoljarError::InvalidUsernameFormat
    );
    
    msg!("username: {}", username);
    require!(
        !is_username_disallowed(&username),
        SoljarError::UsernameNotAllowed
    );
    msg!("username is allowed");
    
    let user = &mut ctx.accounts.user;
    user.user = ctx.accounts.signer.key();
    user.username = username.clone();
    user.jar = ctx.accounts.jar.key();
    user.created_at = Clock::get()?.unix_timestamp;
    user.updated_at = Clock::get()?.unix_timestamp;

    let jar = &mut ctx.accounts.jar;
    jar.user = ctx.accounts.user.key();
    jar.created_at = Clock::get()?.unix_timestamp;
    jar.updated_at = Clock::get()?.unix_timestamp;
    jar.id = username.clone();
    jar.bump = ctx.bumps.jar;

    let tip_link = &mut ctx.accounts.tip_link;
    tip_link.user = ctx.accounts.user.key();
    tip_link.jar = ctx.accounts.jar.key();

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
        seeds = [b"jar", signer.key().as_ref()],
        bump
    )]
    pub jar: Box<Account<'info, Jar>>,

    #[account(
        init,
        payer = signer,
        space = 8 + TipLink::INIT_SPACE,
        seeds = [b"tip_link", username.as_bytes()],
        bump
    )]
    pub tip_link: Box<Account<'info, TipLink>>,

    system_program: Program<'info, System>,
}
