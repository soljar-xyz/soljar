use anchor_lang::prelude::*;
use crate::state::*;

pub fn init_treasury(ctx: Context<InitTreasury>) -> Result<()> {
    let jar = &mut ctx.accounts.jar;


    let treasury = &mut ctx.accounts.treasury;
    treasury.jar = jar.key();
    treasury.created_at = Clock::get()?.unix_timestamp;
    treasury.updated_at = Clock::get()?.unix_timestamp;
    treasury.bump = ctx.bumps.treasury;

    jar.treasury = treasury.key();
    Ok(())
}


#[derive(Accounts)]
pub struct InitTreasury<'info> {
    #[account(mut)]
    pub signer: Signer<'info>,

    #[account(init, payer = signer, space = 8 + Treasury::INIT_SPACE, seeds = [b"treasury", jar.key().as_ref()], bump)]
    pub treasury: Account<'info, Treasury>,


    #[account(
        mut,
        seeds = [b"jar", user.key().as_ref()],
        bump
    )]
    pub jar: Box<Account<'info, Jar>>,

    #[account(
        mut,
        seeds = [b"user", signer.key().as_ref()],
        bump
    )]
    pub user: Box<Account<'info, User>>,

    system_program: Program<'info, System>,
}