use anchor_lang::prelude::*;

use crate::state::*;

pub fn add_supporter(ctx: Context<AddSupporter>, _tip_link_id: String, currency_mint: Pubkey, amount: u64) -> Result<()> {
   
    let tip_link: &mut Account<'_, TipLink> = &mut ctx.accounts.tip_link;

    let supporter = &mut ctx.accounts.supporter;

    if supporter.signer == ctx.accounts.signer.key() {
        supporter.amount += amount;
        supporter.tip_count += 1;
        supporter.updated_at = Clock::get()?.unix_timestamp;
    } else {
        supporter.signer = ctx.accounts.signer.key();
        supporter.jar = ctx.accounts.jar.key();
        supporter.amount = amount;
        supporter.tip_count = 1;
        supporter.created_at = Clock::get()?.unix_timestamp;
        supporter.updated_at = Clock::get()?.unix_timestamp;
        supporter.mint = currency_mint;
        supporter.tip_link = tip_link.key();

        let supporter_index = &mut ctx.accounts.supporter_index;

        supporter_index.total_items += 1;
        supporter_index.supporters.push(supporter.key());

        let index = &mut ctx.accounts.index;

        if supporter_index.total_items == 49 {
            index.supporter_index_page += 1;
        }
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
        seeds = [b"supporter", jar.key().as_ref(), signer.key().as_ref(), currency_mint.as_ref()],
        bump,
    )]
    pub supporter: Account<'info, Supporter>,

    system_program: Program<'info, System>,
}

