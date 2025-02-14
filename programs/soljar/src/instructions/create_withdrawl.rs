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

    let withdrawl_index = &mut ctx.accounts.withdrawl_index;
    
    // Check if we're about to hit the limit (one before MAX_WITHDRAWLS)
    if withdrawl_index.total_items >= (WithdrawlIndex::MAX_WITHDRAWLS - 1) as u8 {
        let index = &mut ctx.accounts.index;
        index.withdrawl_index_page = index.withdrawl_index_page
            .checked_add(1)
            .ok_or(SoljarError::Overflow)?;
    }

    // Check for overflow before incrementing
    withdrawl_index.total_items = withdrawl_index.total_items
        .checked_add(1)
        .ok_or(SoljarError::Overflow)?;

    // Verify we're not exceeding vector capacity
    require!(
        withdrawl_index.withdrawls.len() < WithdrawlIndex::MAX_WITHDRAWLS,
        SoljarError::TooManyWithdrawls
    );
    withdrawl_index.withdrawls.push(withdrawl.key());

    let index = &mut ctx.accounts.index;
    // Check for overflow before incrementing
    index.total_withdrawls = index.total_withdrawls
        .checked_add(1)
        .ok_or(SoljarError::Overflow)?;

    Ok(())
}


#[derive(Accounts)]
pub struct CreateWithdrawl<'info> {
    #[account(mut)]
    pub signer: Signer<'info>,

    #[account(
        mut,
        seeds = [b"user", signer.key().as_ref()],
        bump,
        has_one = jar
    )]
    pub user: Account<'info, User>,

    #[account(mut, seeds = [b"jar", user.key().as_ref()], bump)]
    pub jar: Account<'info, Jar>,

    #[account(
        mut,
        seeds = [b"index", jar.key().as_ref()],
        bump,
    )]
    pub index: Account<'info, Index>,

    #[account(
        init_if_needed,
        payer = signer,
        space = 8 + WithdrawlIndex::INIT_SPACE,
        seeds = [b"withdrawl_index", index.key().as_ref(), &index.withdrawl_index_page.to_le_bytes()],
        bump,
    )]
    pub withdrawl_index: Account<'info, WithdrawlIndex>,

    #[account(
        init_if_needed,
        payer = signer,
        space = 8 + Withdrawl::INIT_SPACE,
        seeds = [b"withdrawl", withdrawl_index.key().as_ref(), &index.total_withdrawls.to_le_bytes()],
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