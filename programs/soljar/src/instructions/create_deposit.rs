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


    let currency: u8 = 0; // SOL = 0

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
            SoljarError::InsufficientSolBalance
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
    deposit.currency = currency;
    deposit.link_id = jar.id.clone();
    deposit.amount = amount;
    deposit.created_at = Clock::get()?.unix_timestamp;
    deposit.memo = memo;

    let jar = &mut ctx.accounts.jar;
    jar.deposit_count = jar.deposit_count.checked_add(1).ok_or(SoljarError::DepositCountOverflow)?;
    jar.updated_at = Clock::get()?.unix_timestamp;

    let supporter = &mut ctx.accounts.supporter;

    if supporter.signer == ctx.accounts.signer.key() {
        let mut found = false;
        
        for i in 0..supporter.active_tips as usize {
            if supporter.tips[i].currency == currency {
                supporter.tips[i].amount = supporter.tips[i].amount
                    .checked_add(amount)
                    .ok_or(SoljarError::AmountOverflow)?;
                supporter.tip_count = supporter.tip_count
                    .checked_add(1)
                    .ok_or(SoljarError::TipCountOverflow)?;
                found = true;
                break;
            }
        }

        if !found {
            require!(
                supporter.active_tips < 4,
                SoljarError::MaxCurrenciesReached
            );
            
            let idx = supporter.active_tips as usize;
            supporter.tips[idx] = TipInfo {
                currency,
                amount,
            };
            supporter.active_tips += 1;
            supporter.tip_count = supporter.tip_count
                .checked_add(1)
                .ok_or(SoljarError::TipCountOverflow)?;
        }
        supporter.updated_at = Clock::get()?.unix_timestamp;
    } else {
        supporter.signer = ctx.accounts.signer.key();
        supporter.tip_count = 1;
        supporter.active_tips = 1;
        supporter.created_at = Clock::get()?.unix_timestamp;
        supporter.updated_at = Clock::get()?.unix_timestamp;
        
        supporter.tips[0] = TipInfo {
            currency,
            amount,
        };
        // Zero out the rest of the array
        for i in 1..4 {
            supporter.tips[i] = TipInfo {
                currency: 0,
                amount: 0,
            };
        }

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

        jar.supporter_count = jar.supporter_count.checked_add(1).ok_or(SoljarError::SupporterCountOverflow)?;
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

