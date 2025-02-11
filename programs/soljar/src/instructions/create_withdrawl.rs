use anchor_lang::prelude::*;
use crate::state::*;

pub fn create_withdrawl(ctx: Context<CreateWithdrawl>, currency_mint: Pubkey, amount: u64) -> Result<()> {

    if currency_mint == Pubkey::default() {
        msg!("TRANSFERING SOL");
        // Get the PDA's current balance
        let jar_balance = ctx.accounts.jar.to_account_info().lamports();
        require!(jar_balance >= amount, CustomError::InsufficientFunds);

        msg!("TRANSFERING SOL: {} lamports", amount);
        // Transfer SOL using transfer_lamports
        **ctx.accounts.jar.to_account_info().try_borrow_mut_lamports()? -= amount;
        **ctx.accounts.signer.to_account_info().try_borrow_mut_lamports()? += amount;
        
        msg!("TRANSFERED SOL: {} lamports", amount);
    }

    let withdrawl = &mut ctx.accounts.withdrawl;
    withdrawl.jar = ctx.accounts.jar.key();
    withdrawl.amount = amount;
    withdrawl.created_at = Clock::get()?.unix_timestamp;

    let withdrawl_index = &mut ctx.accounts.withdrawl_index;
    withdrawl_index.total_items += 1;
    withdrawl_index.withdrawls.push(withdrawl.key());

    let index = &mut ctx.accounts.index;
    index.total_withdrawls += 1;

    if withdrawl_index.total_items == 49 {
        index.withdrawl_index_page += 1;
    }
    

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
        seeds = [b"withdrawl", withdrawl_index.key().as_ref(), &withdrawl_index.total_items.to_le_bytes()],
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