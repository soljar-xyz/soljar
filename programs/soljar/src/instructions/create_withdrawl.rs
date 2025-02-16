use anchor_lang::prelude::*;
use crate::state::*;
use crate::error::SoljarError;
pub fn create_withdrawl(ctx: Context<CreateWithdrawl>, currency_mint: Pubkey, amount: u64) -> Result<()> {
    // Validate amount
    require!(amount > 0, SoljarError::InvalidAmount);

    if currency_mint == Pubkey::default() {
        msg!("TRANSFERING SOL");
        // Get the PDA's current balance
        let jar_balance = ctx.accounts.jar.to_account_info().lamports();
        require!(jar_balance >= amount, SoljarError::InsufficientFunds);

        msg!("TRANSFERING SOL: {} lamports", amount);
        // Transfer SOL using transfer_lamports with checked arithmetic
        **ctx.accounts.jar.to_account_info().try_borrow_mut_lamports()? = jar_balance
            .checked_sub(amount)
            .ok_or(SoljarError::Overflow)?;
            
        let recipient_balance = ctx.accounts.signer.to_account_info().lamports();
        **ctx.accounts.signer.to_account_info().try_borrow_mut_lamports()? = recipient_balance
            .checked_add(amount)
            .ok_or(SoljarError::Overflow)?;
        
        msg!("TRANSFERED SOL: {} lamports", amount);
    }

    let withdrawl = &mut ctx.accounts.withdrawl;
    withdrawl.jar = ctx.accounts.jar.key();
    withdrawl.amount = amount;
    withdrawl.created_at = Clock::get()?.unix_timestamp;

    let jar = &mut ctx.accounts.jar;
    jar.withdrawl_count = jar.withdrawl_count.checked_add(1).unwrap();
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

#[error_code]
pub enum CustomError {
    #[msg("Insufficient funds in jar")]
    InsufficientFunds,
}