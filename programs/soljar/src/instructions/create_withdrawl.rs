use anchor_lang::prelude::*;
use crate::state::*;
use crate::error::SoljarError;
use crate::utils::get_currency_from_mint;
pub fn create_withdrawl(ctx: Context<CreateWithdrawl>, currency_mint: Pubkey, amount: u64) -> Result<()> {
    require!(amount > 0, SoljarError::InvalidAmount);
    let currency = get_currency_from_mint(currency_mint)?;

    if currency_mint == Pubkey::default() {
        msg!("TRANSFERING SOL");
        let jar_balance = ctx.accounts.jar.to_account_info().lamports();
        require!(jar_balance >= amount, SoljarError::InsufficientSolBalance);

        **ctx.accounts.jar.to_account_info().try_borrow_mut_lamports()? = jar_balance
            .checked_sub(amount)
            .ok_or(SoljarError::Overflow)?;
            
        let recipient_balance = ctx.accounts.signer.to_account_info().lamports();
        **ctx.accounts.signer.to_account_info().try_borrow_mut_lamports()? = recipient_balance
            .checked_add(amount)
            .ok_or(SoljarError::Overflow)?;
    }

    let withdrawl = &mut ctx.accounts.withdrawl;
    withdrawl.jar = ctx.accounts.jar.key();
    withdrawl.amount = amount;
    withdrawl.created_at = Clock::get()?.unix_timestamp;
    withdrawl.currency = currency;

    let jar = &mut ctx.accounts.jar;
    jar.withdrawl_count = jar.withdrawl_count.checked_add(1).ok_or(SoljarError::WithdrawlCountOverflow)?;
    jar.updated_at = Clock::get()?.unix_timestamp;

    Ok(())
}


#[derive(Accounts)]
pub struct CreateWithdrawl<'info> {
    #[account(mut)]
    pub signer: Signer<'info>,


    #[account(mut, seeds = [b"jar", signer.key().as_ref()], bump)]
    pub jar: Account<'info, Jar>,

    #[account(
        init_if_needed,
        payer = signer,
        space = 8 + Withdrawl::INIT_SPACE,
        seeds = [b"withdrawl", jar.key().as_ref(), &jar.withdrawl_count.to_le_bytes()],
        bump,
    )]
    pub withdrawl: Account<'info, Withdrawl>,

    system_program: Program<'info, System>,
}
