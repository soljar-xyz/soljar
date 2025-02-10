use anchor_lang::prelude::*;
use crate::state::*;

pub fn init_tip_link(
    ctx: Context<InitTipLink>,
    id: String,
    description: String,
    _index_page: u32,
) -> Result<()> {
    let tip_link = &mut ctx.accounts.tip_link;
    let tip_link_index = &mut ctx.accounts.tip_link_index;
    let index = &mut ctx.accounts.index;
    // Initialize tip link
    tip_link.user = ctx.accounts.user.key();
    tip_link.jar = ctx.accounts.jar.key();
    tip_link.id = id;
    tip_link.description = description;
    tip_link.created_at = Clock::get()?.unix_timestamp;
    tip_link.updated_at = Clock::get()?.unix_timestamp;

    // Update index
    index.total_tip_links += 1;
    tip_link_index.total_items += 1;
    tip_link_index.updated_at = Clock::get()?.unix_timestamp;

    Ok(())
}

#[derive(Accounts)]
#[instruction(id: String, description: String, index_page: u32)]
pub struct InitTipLink<'info> {
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
        bump,
    )]
    pub user: Box<Account<'info, User>>,

    #[account(
        mut,
        seeds = [b"index", jar.key().as_ref()],
        bump
    )]
    pub index: Box<Account<'info, Index>>,

    #[account(
        mut,
        seeds = [b"tip_link_index", index.key().as_ref(), &index_page.to_le_bytes()],
        bump
    )]
    pub tip_link_index: Box<Account<'info, TipLinkIndex>>,

    #[account(
        init,
        payer = signer,
        space = 8 + TipLink::INIT_SPACE,
        seeds = [b"tip_link", id.as_bytes()],
        bump
    )]
    pub tip_link: Box<Account<'info, TipLink>>,

    system_program: Program<'info, System>,
} 