#![allow(clippy::result_large_err)]

use anchor_lang::prelude::*;

declare_id!("coUnmi3oBUtwtd9fjeAvSsJssXh5A5xyPbhpewyzRVF");

#[program]
pub mod soljar {
    use super::*;

  pub fn close(_ctx: Context<CloseSoljar>) -> Result<()> {
    Ok(())
  }

  pub fn decrement(ctx: Context<Update>) -> Result<()> {
    ctx.accounts.soljar.count = ctx.accounts.soljar.count.checked_sub(1).unwrap();
    Ok(())
  }

  pub fn increment(ctx: Context<Update>) -> Result<()> {
    ctx.accounts.soljar.count = ctx.accounts.soljar.count.checked_add(1).unwrap();
    Ok(())
  }

  pub fn initialize(_ctx: Context<InitializeSoljar>) -> Result<()> {
    Ok(())
  }

  pub fn set(ctx: Context<Update>, value: u8) -> Result<()> {
    ctx.accounts.soljar.count = value.clone();
    Ok(())
  }
}

#[derive(Accounts)]
pub struct InitializeSoljar<'info> {
  #[account(mut)]
  pub payer: Signer<'info>,

  #[account(
  init,
  space = 8 + Soljar::INIT_SPACE,
  payer = payer
  )]
  pub soljar: Account<'info, Soljar>,
  pub system_program: Program<'info, System>,
}
#[derive(Accounts)]
pub struct CloseSoljar<'info> {
  #[account(mut)]
  pub payer: Signer<'info>,

  #[account(
  mut,
  close = payer, // close account and return lamports to payer
  )]
  pub soljar: Account<'info, Soljar>,
}

#[derive(Accounts)]
pub struct Update<'info> {
  #[account(mut)]
  pub soljar: Account<'info, Soljar>,
}

#[account]
#[derive(InitSpace)]
pub struct Soljar {
  count: u8,
}
