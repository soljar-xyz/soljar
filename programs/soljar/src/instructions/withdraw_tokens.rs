use anchor_lang::prelude::*;
use anchor_spl::{
    associated_token::AssociatedToken,
    token_interface::{transfer_checked, Mint, TokenAccount, TokenInterface, TransferChecked},
};
use crate::state::*;


pub fn withdraw_tokens(ctx: Context<WithdrawTokens>, amount: u64) -> Result<()> {


    let mint = ctx.accounts.mint.key();
    msg!("Mint: {}", mint);
    if mint == Pubkey::default() {
        return Ok(());
    }

    let transfer_cpi_accounts = TransferChecked {
        from: ctx.accounts.token_account.to_account_info(),
        mint: ctx.accounts.mint.to_account_info(),
        to: ctx.accounts.associated_token_account.to_account_info(),
        authority: ctx.accounts.jar.to_account_info(),
    };

    let cpi_program = ctx.accounts.token_program.to_account_info();

    let user_key = ctx.accounts.user.key();
    let jar_bump = ctx.accounts.jar.bump;
    
    msg!("User key: {}", user_key);
    msg!("Jar bump: {}", jar_bump);
    msg!("Expected jar address: {}", ctx.accounts.jar.key());
    
    let signer_seeds: &[&[&[u8]]] = &[&[
        b"jar",
        user_key.as_ref(),
        &[jar_bump],
    ]];

    let cpi_context =
        CpiContext::new(cpi_program, transfer_cpi_accounts).with_signer(signer_seeds);

    transfer_checked(cpi_context, amount, ctx.accounts.mint.decimals)?;

    Ok(())
}

#[derive(Accounts)]
pub struct WithdrawTokens<'info> {
    #[account(mut)]
    pub signer: Signer<'info>,

    #[account(
        mut, 
        seeds = [b"user", signer.key().as_ref()],
        bump,
        has_one = jar)]
    pub user: Box<Account<'info, User>>,

    #[account(
        mut,
        seeds = [b"jar", user.key().as_ref()],
        bump,
    )]
    pub jar: Box<Account<'info, Jar>>,


    pub mint: InterfaceAccount<'info, Mint>,

    #[account(
        init_if_needed,
        payer = signer,
        token::mint = mint,
        token::authority = jar,
        seeds = [b"token_account", jar.key().as_ref(), mint.key().as_ref()],
        bump,
    )]
    pub token_account: Box<InterfaceAccount<'info, TokenAccount>>,


    #[account(
        init_if_needed,
        payer = signer,
        associated_token::mint = mint,
        associated_token::authority = signer,
        associated_token::token_program = token_program,
    )]
    pub associated_token_account: Box<InterfaceAccount<'info, TokenAccount>>,

    system_program: Program<'info, System>,
    token_program: Interface<'info, TokenInterface>,

    associated_token_program: Program<'info, AssociatedToken>,
}
