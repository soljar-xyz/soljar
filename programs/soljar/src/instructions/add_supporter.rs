use anchor_lang::prelude::*;

use crate::state::*;
use crate::error::SoljarError;
use crate::utils::get_currency_from_mint;

pub fn add_supporter(
    ctx: Context<AddSupporter>,
    _tip_link_id: String,
    currency_mint: Pubkey,
    amount: u64,
) -> Result<()> {
    let supporter = &mut ctx.accounts.supporter;
    let currency = get_currency_from_mint(currency_mint)?;

    let deposit = &mut ctx.accounts.deposit;
    msg!("deposit: {:?}", deposit.amount);
    let jar = &mut ctx.accounts.jar;


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
                currency,
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
            currency,
            amount,
        }];

        jar.supporter_count = jar.supporter_count.checked_add(1).unwrap();
        jar.updated_at = Clock::get()?.unix_timestamp;
    }

    jar.deposit_count = jar.deposit_count.checked_add(1).unwrap();
    jar.updated_at = Clock::get()?.unix_timestamp;

    Ok(())
}

#[derive(Accounts)]
#[instruction(tip_link_id: String, currency_mint: Pubkey)]
pub struct AddSupporter<'info> {
    #[account(mut)]
    pub signer: Signer<'info>,

    #[account(
        mut,
        seeds = [b"tip_link", tip_link_id.as_bytes()],
        bump,
        has_one = jar
    )]
    tip_link: Account<'info, TipLink>,

    #[account(
        mut,
    )]
    jar: Account<'info, Jar>,

    #[account(
        mut,
        seeds = [b"deposit", jar.key().as_ref(), &jar.deposit_count.to_le_bytes()],
        bump,
    )]
    deposit: Account<'info, Deposit>,

    #[account(
        init_if_needed,
        payer = signer,
        space = 8 + Supporter::INIT_SPACE,
        seeds = [b"supporter", jar.key().as_ref(), signer.key().as_ref()],
        bump,
    )]
    supporter: Account<'info, Supporter>,

    system_program: Program<'info, System>,
}

