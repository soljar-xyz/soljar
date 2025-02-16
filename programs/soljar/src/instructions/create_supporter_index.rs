use anchor_lang::prelude::*;

use crate::state::*;


pub fn create_supporter_index(_ctx: Context<CreateSupporterIndex>, _index: u32) -> Result<()> {
    Ok(())
}

#[derive(Accounts)]
#[instruction(index: u32)]
pub struct CreateSupporterIndex<'info> {
    #[account(mut)]
    pub signer: Signer<'info>,

    #[account(
        mut,
        seeds = [b"jar", signer.key().as_ref()],
        bump
    )]
    pub jar: Box<Account<'info, Jar>>,

    #[account(
        init,
        payer = signer,
        space = 8 + SupporterIndex::INIT_SPACE,
        seeds = [b"supporter_index", jar.key().as_ref(), &index.to_le_bytes()],
        bump
    )]
    pub supporter_index: Box<Account<'info, SupporterIndex>>,

    system_program: Program<'info, System>,
}
