use anchor_lang::prelude::*;
use anchor_spl::token_interface::{transfer_checked, Mint, TokenAccount, TokenInterface, TransferChecked};

use crate::state::*;


pub fn transfer_tokens(ctx: Context<TransferTokens>, _tip_link_id: String, amount: u64) -> Result<()> {

    let mint = ctx.accounts.mint.key();
    msg!("Mint: {}", mint);
    if mint == Pubkey::default() {
        return Ok(());
    }

    let transfer_cpi_accounts = TransferChecked {
        from: ctx.accounts.source_token_account.to_account_info(),
        mint: ctx.accounts.mint.to_account_info(),
        to: ctx.accounts.token_account.to_account_info(),
        authority: ctx.accounts.signer.to_account_info(),
    };

    let cpi_ctx = CpiContext::new(
        ctx.accounts.token_program.to_account_info(),
        transfer_cpi_accounts,
    );

    transfer_checked(cpi_ctx, amount, ctx.accounts.mint.decimals)?;

    Ok(())
}

#[derive(Accounts)]
#[instruction(tip_link_id: String)]
pub struct TransferTokens<'info> {
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
        has_one = treasury
    )]
    pub jar: Account<'info, Jar>,

    #[account(
        mut,
    )]
    pub treasury: Account<'info, Treasury>,

    pub mint: InterfaceAccount<'info, Mint>,

    #[account(
        init_if_needed,
        payer = signer,
        token::mint = mint,
        token::authority = treasury,
        seeds = [b"token_account", treasury.key().as_ref(), mint.key().as_ref()],
        bump,
    )]
    pub token_account: InterfaceAccount<'info, TokenAccount>,


    #[account(
        mut,
        token::mint = mint,
        token::authority = signer,
    )]
    pub source_token_account: InterfaceAccount<'info, TokenAccount>,

    system_program: Program<'info, System>,
    token_program: Interface<'info, TokenInterface>,
}
