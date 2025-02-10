use anchor_lang::prelude::*;
use crate::state::*;

pub fn create_deposit_index(ctx: Context<CreateDepositIndex>) -> Result<()> {
    let index = &mut ctx.accounts.index;

    // Initialize deposit index
    let deposit_index = &mut ctx.accounts.deposit_index;
    deposit_index.index_key = index.key();
    deposit_index.total_items = 0;
    deposit_index.created_at = Clock::get()?.unix_timestamp;
    deposit_index.updated_at = Clock::get()?.unix_timestamp;


    Ok(())
}

#[derive(Accounts)]
pub struct CreateDepositIndex<'info> {
    #[account(mut)]
    pub signer: Signer<'info>,

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

    #[account(
        mut,
        seeds = [b"index", jar.key().as_ref()],
        bump
    )]
    pub index: Box<Account<'info, Index>>,

    #[account(
        init_if_needed,
        payer = signer,
        space = 8 + DepositIndex::INIT_SPACE,
        seeds = [b"deposit_index", index.key().as_ref(), &index.deposit_index_page.to_le_bytes()],
        bump
    )]
    pub deposit_index: Box<Account<'info, DepositIndex>>,

    system_program: Program<'info, System>,
}

