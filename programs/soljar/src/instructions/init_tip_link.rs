use anchor_lang::prelude::*;
use crate::state::*;

pub fn init_tip_link(
    ctx: Context<InitTipLink>,
    id: String,
    description: String,
    _index_page: u32,
) -> Result<()> {
    let tip_link = &mut ctx.accounts.tip_link;
    let user_info = &mut ctx.accounts.user_info;
    // Initialize tip link
    tip_link.user = ctx.accounts.user.key();
    tip_link.jar = ctx.accounts.jar.key();
    tip_link.id = id;
    tip_link.description = description;

    // Update user info
    user_info.tip_link_count += 1;
    user_info.tip_links.push(tip_link.key());

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
        init,
        payer = signer,
        space = 8 + UserInfo::INIT_SPACE,
        seeds = [b"user_info", user.key().as_ref()],
        bump
    )]
    pub user_info: Box<Account<'info, UserInfo>>,


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