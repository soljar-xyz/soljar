use anchor_lang::prelude::*;
use crate::utils::get_currency_from_mint;

use anchor_spl::token_interface::{transfer_checked, Mint, TokenAccount, TokenInterface, TransferChecked};

use crate::state::*;
use crate::error::SoljarError;

pub fn create_spl_deposit(
    ctx: Context<CreateSplDeposit>, 
    tip_link_id: String, 
    referrer: String, 
    memo: String, 
    amount: u64
) -> Result<()> {
    let currency_mint = ctx.accounts.mint.key();
    let currency = get_currency_from_mint(currency_mint)?;
    // Validate input lengths

    if tip_link_id != tip_link_id.to_lowercase() {
        return Err(SoljarError::TipLinkIdMustBeLowercase.into());
    }

    require!(
        referrer.len() <= Deposit::MAX_REFERRER_LENGTH,
        SoljarError::ReferrerTooLong
    );
    require!(
        memo.len() <= Deposit::MAX_MEMO_LENGTH,
        SoljarError::MemoTooLong
    );
    require!(amount > 0, SoljarError::InvalidAmount);


    let jar = &mut ctx.accounts.jar;



    // Verify source account has sufficient balance
    require!(
        ctx.accounts.source_token_account.amount >= amount,
        SoljarError::InsufficientTokenBalance
    );

    // Verify token accounts belong to the correct mint
    require!(
        ctx.accounts.source_token_account.mint == ctx.accounts.mint.key(),
        SoljarError::InvalidTokenMint
    );
    require!(
        ctx.accounts.token_account.mint == ctx.accounts.mint.key(),
        SoljarError::InvalidTokenMint
    );

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

    // transfer_checked already handles decimal place validation
    transfer_checked(cpi_ctx, amount, ctx.accounts.mint.decimals)?;




    let deposit = &mut ctx.accounts.deposit;
    deposit.link_id = jar.id.clone();
    deposit.currency = currency;
    deposit.amount = amount;
    deposit.created_at = Clock::get()?.unix_timestamp;
    deposit.memo = memo;


    jar.deposit_count = jar.deposit_count.checked_add(1).ok_or(SoljarError::DepositCountOverflow)?;
    jar.updated_at = Clock::get()?.unix_timestamp;

    Ok(())
}

// const TOTAL_ITEMS: u32 = 0;


#[derive(Accounts)]
#[instruction(tip_link_id: String)]
pub struct CreateSplDeposit<'info> {
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

    pub mint: Box<InterfaceAccount<'info, Mint>>,

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
        mut,
        token::mint = mint,
        token::authority = signer,
    )]
    pub source_token_account: Box<InterfaceAccount<'info, TokenAccount>>,

    system_program: Program<'info, System>,
    token_program: Interface<'info, TokenInterface>,
}

