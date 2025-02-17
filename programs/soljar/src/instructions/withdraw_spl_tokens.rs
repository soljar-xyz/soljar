use anchor_lang::prelude::*;
use anchor_spl::{
    associated_token::AssociatedToken,
    token_interface::{transfer_checked, Mint, TokenAccount, TokenInterface, TransferChecked},
};
use crate::{state::*, utils::get_currency_from_mint};
use crate::error::SoljarError;

pub fn withdraw_spl_tokens(ctx: Context<WithdrawSplTokens>, amount: u64) -> Result<()> {
    require!(amount > 0, SoljarError::InvalidAmount);
    let currency = get_currency_from_mint(ctx.accounts.mint.key())?;

    let mint = ctx.accounts.mint.key();
    msg!("Mint: {}", mint);
    if mint == Pubkey::default() {
        return Ok(());
    }

    // Verify source account has sufficient balance
    require!(
        ctx.accounts.token_account.amount >= amount,
        SoljarError::InsufficientTokenBalance
    );

    // Verify token accounts belong to the correct mint
    require!(
        ctx.accounts.token_account.mint == ctx.accounts.mint.key(),
        SoljarError::InvalidTokenMint
    );
    require!(
        ctx.accounts.associated_token_account.mint == ctx.accounts.mint.key(),
        SoljarError::InvalidTokenMint
    );

    let transfer_cpi_accounts = TransferChecked {
        from: ctx.accounts.token_account.to_account_info(),
        mint: ctx.accounts.mint.to_account_info(),
        to: ctx.accounts.associated_token_account.to_account_info(),
        authority: ctx.accounts.jar.to_account_info(),
    };

    let cpi_program = ctx.accounts.token_program.to_account_info();

    let user_key = ctx.accounts.signer.key();
    let jar_bump = ctx.accounts.jar.bump;
    
    msg!("User key: {}", user_key);
    msg!("Jar bump: {}", jar_bump);
    msg!("Expected jar address: {}", ctx.accounts.jar.key());
    
    let signer_seeds: &[&[&[u8]]] = &[&[
        b"jar",
        user_key.as_ref(),
        &[jar_bump],
    ]];

    let cpi_context = CpiContext::new(cpi_program, transfer_cpi_accounts)
        .with_signer(signer_seeds);

    // transfer_checked already handles decimal place validation
    transfer_checked(cpi_context, amount, ctx.accounts.mint.decimals)?;

    let withdrawl = &mut ctx.accounts.withdrawl;
    withdrawl.jar = ctx.accounts.jar.key();
    withdrawl.amount = amount;
    withdrawl.currency = currency;
    withdrawl.created_at = Clock::get()?.unix_timestamp;

    let jar = &mut ctx.accounts.jar;
    jar.withdrawl_count = jar.withdrawl_count.checked_add(1).unwrap();
    jar.updated_at = Clock::get()?.unix_timestamp;
    Ok(())
}

#[derive(Accounts)]
pub struct WithdrawSplTokens<'info> {
    #[account(mut)]
    pub signer: Signer<'info>,

    #[account(
        mut,
        seeds = [b"jar", signer.key().as_ref()],
        bump,
    )]
    pub jar: Box<Account<'info, Jar>>,


    #[account(
        init,
        payer = signer,
        space = 8 + Withdrawl::INIT_SPACE,
        seeds = [b"withdrawl", jar.key().as_ref(), &jar.withdrawl_count.to_le_bytes()],
        bump,
    )]
    pub withdrawl: Box<Account<'info, Withdrawl>>,


    pub mint: InterfaceAccount<'info, Mint>,

    #[account(
        mut,
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
