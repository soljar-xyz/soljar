use anchor_lang::prelude::*;
use crate::state::*;

pub fn init_indexes(ctx: Context<InitIndexes>, index_page: u32) -> Result<()> {
    let index = &mut ctx.accounts.index;

    // Initialize deposit index
    let deposit_index = &mut ctx.accounts.deposit_index;
    deposit_index.index = index.key();
    deposit_index.index_page = index_page;
    deposit_index.total_items = 0;

    // Initialize withdrawal index
    let withdrawl_index = &mut ctx.accounts.withdrawl_index;
    withdrawl_index.index = index.key();
    withdrawl_index.index_page = index_page;
    withdrawl_index.total_items = 0;

    // Initialize supporter index
    let supporter_index = &mut ctx.accounts.supporter_index;
    supporter_index.index = index.key();
    supporter_index.index_page = index_page;
    supporter_index.total_items = 0;

    Ok(())
}

#[derive(Accounts)]
#[instruction(index_page: u32)]
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
        seeds = [b"deposit_index", index.key().as_ref(), &index_page.to_le_bytes()],
        bump
    )]
    pub deposit_index: Box<Account<'info, DepositIndex>>,

    #[account(
        init,
        payer = signer,
        space = 8 + WithdrawlIndex::INIT_SPACE,
        seeds = [b"withdrawl_index", index.key().as_ref(), &index_page.to_le_bytes()],
        bump
    )]
    pub withdrawl_index: Box<Account<'info, WithdrawlIndex>>,

    #[account(
        init,
        payer = signer,
        space = 8 + SupporterIndex::INIT_SPACE,
        seeds = [b"supporter_index", index.key().as_ref(), &index_page.to_le_bytes()],
        bump
    )]
    pub supporter_index: Box<Account<'info, SupporterIndex>>,
    
    system_program: Program<'info, System>,
}

