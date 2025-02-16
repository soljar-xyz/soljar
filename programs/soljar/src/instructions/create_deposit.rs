use anchor_lang::prelude::*;
use anchor_lang::solana_program::program::invoke;
use anchor_lang::solana_program::system_instruction::transfer;

use crate::state::*;
use crate::error::SoljarError;


pub fn create_deposit(
    ctx: Context<CreateDeposit>, 
    _tip_link_id: String, 
    referrer: String, 
    memo: String, 
    amount: u64
) -> Result<()> {


    let currency ="SOL";

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

    let deposit = &mut ctx.accounts.deposit;
    deposit.signer = ctx.accounts.signer.key();
    deposit.currency = currency.to_string();
    deposit.link_id = jar.id.clone();
    deposit.amount = amount;
    deposit.created_at = Clock::get()?.unix_timestamp;
    deposit.referrer = referrer;
    deposit.memo = memo;

    let jar = &mut ctx.accounts.jar;
    jar.deposit_count = jar.deposit_count.checked_add(1).unwrap();
    jar.updated_at = Clock::get()?.unix_timestamp;

    let supporter = &mut ctx.accounts.supporter;

    if supporter.signer == ctx.accounts.signer.key() {
        // Find existing tip info for the currency
        if let Some(tip_info) = supporter.tips.iter_mut().find(|t| t.currency == currency) {
            // Update existing tip info
            tip_info.amount = tip_info.amount.checked_add(amount)
                .ok_or(SoljarError::AmountOverflow)?;
            supporter.tip_count = supporter.tip_count.checked_add(1)
                .ok_or(SoljarError::TipCountOverflow)?;
        } else {
            // Add new currency to tips vector
            require!(
                supporter.tips.len() < 10,
                SoljarError::MaxCurrenciesReached
            );
            supporter.tips.push(TipInfo {
                currency: currency.to_string(),
                amount,
            });
            supporter.tip_count = supporter.tip_count.checked_add(1)
                .ok_or(SoljarError::TipCountOverflow)?;
        }
        supporter.updated_at = Clock::get()?.unix_timestamp;
    } else {
        // Initialize new supporter
        require!(amount > 0, SoljarError::InvalidAmount);
        
        supporter.signer = ctx.accounts.signer.key();
        supporter.tip_count = 1;

        supporter.created_at = Clock::get()?.unix_timestamp;
        supporter.updated_at = Clock::get()?.unix_timestamp;
        supporter.tips = vec![TipInfo {
            currency: currency.to_string(),
            amount,
        }];

        let jar = &mut ctx.accounts.jar;


        let supporter_index = &mut ctx.accounts.supporter_index;

        // Check if we're about to hit the limit (one before MAX_SUPPORTERS)
        if supporter_index.total_items >= (SupporterIndex::MAX_SUPPORTERS - 1) as u8 {
            jar.supporter_index = jar.supporter_index
                .checked_add(1)
                .ok_or(SoljarError::PageOverflow)?;
        }

        // Check for overflow before incrementing total_items
        supporter_index.total_items = supporter_index.total_items
            .checked_add(1)
            .ok_or(SoljarError::IndexOverflow)?;
            
        // Verify we're not exceeding vector capacity
        require!(
            supporter_index.supporters.len() < SupporterIndex::MAX_SUPPORTERS as usize,
            SoljarError::SupporterIndexFull
        );

        supporter_index.supporters.push(supporter.key());

        jar.supporter_count = jar.supporter_count.checked_add(1).unwrap();
        jar.updated_at = Clock::get()?.unix_timestamp;
    }

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
        has_one = jar,

    )]
    pub tip_link: Box<Account<'info, TipLink>>,

    #[account(
        mut,
    )]
    pub jar: Box<Account<'info, Jar>>,

    #[account(
        init,
        payer = signer,
        space = 8 + Deposit::INIT_SPACE,
        seeds = [b"deposit", jar.key().as_ref(), &jar.deposit_count.to_le_bytes()],
        bump,
    )]
    pub deposit: Box<Account<'info,Deposit>>,

    #[account(
        init_if_needed,
        payer = signer,
        space = 8 + SupporterIndex::INIT_SPACE,
        seeds = [b"supporter_index", jar.key().as_ref(), &jar.supporter_index.to_le_bytes()],
        bump,
    )]
    pub supporter_index: Box<Account<'info, SupporterIndex>>,

    #[account(
        init_if_needed,
        payer = signer,
        space = 8 + Supporter::INIT_SPACE,
        seeds = [b"supporter", jar.key().as_ref(), signer.key().as_ref()],
        bump,
    )]
    pub supporter: Box<Account<'info, Supporter>>,

    system_program: Program<'info, System>,
}

