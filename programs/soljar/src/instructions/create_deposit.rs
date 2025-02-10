use anchor_lang::prelude::*;
use crate::state::*;

pub fn create_deposit(ctx: Context<CreateDeposit>, _tip_link_id: String, referrer: String, memo: String, amount: u64) -> Result<()> {
    let tip_link: &mut Account<'_, TipLink> = &mut ctx.accounts.tip_link;
    tip_link.deposit_count += 1;
    tip_link.updated_at = Clock::get()?.unix_timestamp;

    let meta = &mut ctx.accounts.meta;
    meta.jar = ctx.accounts.jar.key();
    meta.deposit = ctx.accounts.deposit.key();
    meta.referrer = referrer;
    meta.memo = memo;
    meta.created_at = Clock::get()?.unix_timestamp;
    meta.updated_at = Clock::get()?.unix_timestamp;

    let deposit = &mut ctx.accounts.deposit;
    deposit.signer = ctx.accounts.signer.key();
    deposit.jar = ctx.accounts.jar.key();
    deposit.meta = meta.key();
    deposit.tip_link = tip_link.key();
    // deposit.currency_mint = ctx.accounts.currency_mint.key(); will implement this later
    deposit.amount = amount;
    deposit.created_at = Clock::get()?.unix_timestamp;
    deposit.updated_at = Clock::get()?.unix_timestamp;

    let deposit_index = &mut ctx.accounts.deposit_index;
    
    deposit_index.total_items += 1;
    deposit_index.deposits.push(deposit.key());

    let index = &mut ctx.accounts.index;
    index.total_deposits += 1;

    Ok(())
}

// const TOTAL_ITEMS: u32 = 0;

#[derive(Accounts)]
#[instruction(tip_link_id: String)]
pub struct CreateDeposit<'info> {
    #[account(mut)]
    pub signer: Signer<'info>,

    #[account(
        mut,
        seeds = [b"tip_link", tip_link_id.as_bytes()],
        bump,
        has_one = jar
    )]
    pub tip_link: Account<'info, TipLink>,

    #[account(
        mut,
        has_one = index
    )]
    pub jar: Account<'info, Jar>,

    #[account(
        mut,
    )]
    pub index: Account<'info, Index>,

    #[account(
        mut,
        seeds = [b"deposit_index", index.key().as_ref(), &index.deposit_index_page.to_le_bytes()],
        bump,
    )]
    pub deposit_index: Account<'info, DepositIndex>,

    #[account(
        init,
        payer = signer,
        space = 8 + Deposit::INIT_SPACE,
        seeds = [b"deposit", deposit_index.key().as_ref(), &deposit_index.total_items.to_le_bytes()],
        bump,
    )]
    pub deposit: Account<'info,Deposit>,

    #[account(
        init,
        payer = signer,
        space = 8 + Meta::INIT_SPACE,
        seeds = [b"meta", deposit.key().as_ref()],
        bump,
    )]
    pub meta: Account<'info, Meta>,
    

    system_program: Program<'info, System>,
}

