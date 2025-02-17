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
    supporter: Account<'info, Supporter>,

    system_program: Program<'info, System>,
}

