use anchor_lang::prelude::*;
use anchor_lang::solana_program::program::invoke;
use anchor_lang::solana_program::system_instruction::transfer;
use crate::constants::*;

use crate::state::*;
use crate::error::SoljarError;
pub fn create_deposit(
    ctx: Context<CreateDeposit>, 
    _tip_link_id: String, 
    currency_mint: Pubkey, 
    referrer: String, 
    memo: String, 
    amount: u64
) -> Result<()> {

    let currency = match currency_mint {
        mint if mint == Pubkey::default() => "SOL".to_string(),
        mint if mint == USDC_MINT => "USDC".to_string(),
        mint if mint == USDT_MINT => "USDT".to_string(),
        _ => "USDC".to_string(),
    };
    // Validate input lengths
    require!(
        referrer.len() <= Deposit::MAX_REFERRER_LENGTH,
        SoljarError::ReferrerTooLong
    );
    require!(
        memo.len() <= Deposit::MAX_MEMO_LENGTH,
        SoljarError::MemoTooLong
    );
    require!(amount > 0, SoljarError::InvalidAmount);

    if currency_mint == Pubkey::default() {
        msg!("TRANSFERING SOL");
        let jar = &mut ctx.accounts.jar;

        // Verify signer has enough SOL
        require!(
            ctx.accounts.signer.lamports() >= amount,
            SoljarError::InsufficientFunds
        );

        // Transfer SOL from signer to treasury
        let transfer_seed_ix = transfer(
            &ctx.accounts.signer.key(),
            jar.to_account_info().key,
            amount,
        );

        invoke(
            &transfer_seed_ix,
            &[
                ctx.accounts.signer.to_account_info(),
                jar.to_account_info(),
                ctx.accounts.system_program.to_account_info(),
            ],
        )?;
    }

    let tip_link = &mut ctx.accounts.tip_link;
    // Check for overflow before incrementing
    tip_link.deposit_count = tip_link.deposit_count
        .checked_add(1)
        .ok_or(SoljarError::Overflow)?;
    tip_link.updated_at = Clock::get()?.unix_timestamp;

    let deposit = &mut ctx.accounts.deposit;
    deposit.signer = ctx.accounts.signer.key();
    deposit.tip_link = tip_link.id.clone();
    deposit.currency = currency;
    deposit.amount = amount;
    deposit.created_at = Clock::get()?.unix_timestamp;
    deposit.referrer = referrer;
    deposit.memo = memo;

    let deposit_index = &mut ctx.accounts.deposit_index;
    
    // Check if we're about to hit the limit (one before MAX_DEPOSITS)
    if deposit_index.total_items >= (DepositIndex::MAX_DEPOSITS - 1) as u8 {
        ctx.accounts.index.deposit_index_page = ctx.accounts.index.deposit_index_page
            .checked_add(1)
            .ok_or(SoljarError::Overflow)?;
    }

    // Check for overflow before incrementing
    deposit_index.total_items = deposit_index.total_items
        .checked_add(1)
        .ok_or(SoljarError::Overflow)?;

    // Verify we're not exceeding vector capacity
    require!(
        deposit_index.deposits.len() < DepositIndex::MAX_DEPOSITS,
        SoljarError::TooManyDeposits
    );
    deposit_index.deposits.push(deposit.key());

    let index = &mut ctx.accounts.index;
    // Check for overflow before incrementing
    index.total_deposits = index.total_deposits
        .checked_add(1)
        .ok_or(SoljarError::Overflow)?;

    Ok(())
}

// const TOTAL_ITEMS: u32 = 0;


#[derive(Accounts)]
#[instruction(tip_link_id: String, currency_mint: Pubkey)]
pub struct CreateDeposit<'info> {
    #[account(mut)]
    pub signer: Signer<'info>,

    #[account(
        mut,
        seeds = [b"tip_link", tip_link_id.as_bytes()],
        bump,
        has_one = jar,

    )]
    pub tip_link: Account<'info, TipLink>,
    #[account(
        mut,
        has_one = index,
    )]
    pub jar: Account<'info, Jar>,


    #[account(
        mut,
    )]
    pub index: Account<'info, Index>,

    #[account(
        init_if_needed,
        payer = signer,
        space = 8 + DepositIndex::INIT_SPACE,
        seeds = [
            b"deposit_index", 
            index.key().as_ref(), 
            &index.deposit_index_page.to_le_bytes()
        ],
        bump,
    )]
    pub deposit_index: Account<'info, DepositIndex>,

    #[account(
        init,
        payer = signer,
        space = 8 + Deposit::INIT_SPACE,
        seeds = [b"deposit", deposit_index.key().as_ref(), &index.total_deposits.to_le_bytes()],
        bump,
    )]
    pub deposit: Account<'info,Deposit>,



    system_program: Program<'info, System>,
}

