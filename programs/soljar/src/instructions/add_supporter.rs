use anchor_lang::prelude::*;

use crate::state::*;
use crate::error::SoljarError;
use crate::utils::get_currency_from_mint;

pub fn add_supporter(ctx: Context<AddSupporter>, _tip_link_id: String, currency_mint: Pubkey, amount: u64) -> Result<()> {
    let supporter = &mut ctx.accounts.supporter;
    let currency = get_currency_from_mint(currency_mint)?;

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

        let supporter_index = &mut ctx.accounts.supporter_index;
        let index = &mut ctx.accounts.index;

        // Check if we're about to hit the limit (one before MAX_SUPPORTERS)
        if supporter_index.total_items >= (SupporterIndex::MAX_SUPPORTERS - 1) as u8 {
            index.supporter_index_page = index.supporter_index_page
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

        // Check for overflow before incrementing total_supporters
        index.total_supporters = index.total_supporters
            .checked_add(1)
            .ok_or(SoljarError::TotalSupportersOverflow)?;
    }

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
        space = 8 + SupporterIndex::INIT_SPACE,
        seeds = [b"supporter_index", index.key().as_ref(), &index.supporter_index_page.to_le_bytes()],
        bump,
    )]
    pub supporter_index: Account<'info, SupporterIndex>,

    #[account(
        init_if_needed,
        payer = signer,
        space = 8 + Supporter::INIT_SPACE,
        seeds = [b"supporter", jar.key().as_ref(), signer.key().as_ref()],
        bump,
    )]
    pub supporter: Account<'info, Supporter>,

    system_program: Program<'info, System>,
}

