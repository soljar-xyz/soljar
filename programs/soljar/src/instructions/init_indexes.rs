use anchor_lang::prelude::*;
use crate::state::*;

pub fn init_indexes(ctx: Context<InitIndexes>) -> Result<()> {
    let index = &mut ctx.accounts.index;

    // Initialize deposit index
    let deposit_index = &mut ctx.accounts.deposit_index;
    deposit_index.index = index.key();
    deposit_index.index_page = 0;
    deposit_index.total_items = 0;
    deposit_index.created_at = Clock::get()?.unix_timestamp;
    deposit_index.updated_at = Clock::get()?.unix_timestamp;

    // Initialize withdrawal index
    let withdrawl_index = &mut ctx.accounts.withdrawl_index;
    withdrawl_index.index = index.key();
    withdrawl_index.index_page = 0;
    withdrawl_index.total_items = 0;
    withdrawl_index.created_at = Clock::get()?.unix_timestamp;
    withdrawl_index.updated_at = Clock::get()?.unix_timestamp;

    // Initialize meta index
    let meta_index = &mut ctx.accounts.meta_index;
    meta_index.index = index.key();
    meta_index.index_page = 0;
    meta_index.total_items = 0;
    meta_index.created_at = Clock::get()?.unix_timestamp;
    meta_index.updated_at = Clock::get()?.unix_timestamp;

    // Initialize tip link index
    let tip_link_index = &mut ctx.accounts.tip_link_index;
    tip_link_index.index = index.key();
    tip_link_index.index_page = 0;
    tip_link_index.total_items = 0;
    tip_link_index.created_at = Clock::get()?.unix_timestamp;
    tip_link_index.updated_at = Clock::get()?.unix_timestamp;

    Ok(())
}

#[derive(Accounts)]
pub struct InitIndexes<'info> {
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
        init,
        payer = signer,
        space = 8 + DepositIndex::INIT_SPACE,
        seeds = [b"deposit_index", index.key().as_ref(), b"0"],
        bump
    )]
    pub deposit_index: Box<Account<'info, DepositIndex>>,

    #[account(
        init,
        payer = signer,
        space = 8 + WithdrawlIndex::INIT_SPACE,
        seeds = [b"withdrawl_index", index.key().as_ref(), b"0"],
        bump
    )]
    pub withdrawl_index: Box<Account<'info, WithdrawlIndex>>,

    #[account(
        init,
        payer = signer,
        space = 8 + MetaIndex::INIT_SPACE,
        seeds = [b"meta_index", index.key().as_ref(), b"0"],
        bump
    )]
    pub meta_index: Box<Account<'info, MetaIndex>>,

    #[account(
        init,
        payer = signer,
        space = 8 + TipLinkIndex::INIT_SPACE,
        seeds = [b"tip_link_index", index.key().as_ref(), b"0"],
        bump
    )]
    pub tip_link_index: Box<Account<'info, TipLinkIndex>>,

    system_program: Program<'info, System>,
}

