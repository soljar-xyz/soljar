use anchor_lang::prelude::*;
use crate::state::*;

pub fn init_platform(ctx: Context<InitPlatform>) -> Result<()> {
    let platform = &mut ctx.accounts.platform;
    platform.user_count = 0;
    platform.jar_count = 0;
    platform.tip_link_count = 0;
    platform.deposit_count = 0;
    platform.withdrawl_count = 0;
    platform.created_at = Clock::get()?.unix_timestamp;
    platform.updated_at = Clock::get()?.unix_timestamp;
    Ok(())
}



#[derive(Accounts)]
pub struct InitPlatform<'info> {
    #[account(mut)]
    pub signer: Signer<'info>,

    #[account(
        init,
        payer = signer,
        space = 8 + Platform::INIT_SPACE,
        seeds = [b"platform"],
        bump
    )]
    pub platform: Account<'info, Platform>,

    system_program: Program<'info, System>,
}
