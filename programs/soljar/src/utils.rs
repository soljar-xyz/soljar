use anchor_lang::prelude::*;
use crate::{constants::*, error::SoljarError};

#[derive(AnchorSerialize, AnchorDeserialize, Clone, Copy, PartialEq, InitSpace)]
pub enum Currency {
    SOL = 0,
    USDC = 1,
    USDT = 2,
}

pub fn get_currency_from_mint(currency_mint: Pubkey) -> Result<u8> {
    match currency_mint {
        mint if mint == Pubkey::default() => Ok(0),
        mint if mint == USDC_MINT => Ok(1),
        mint if mint == USDT_MINT => Ok(2),
        _ => Ok(1),
        // _ => Err(SoljarError::InvalidCurrencyMint.into()),
    }
} 