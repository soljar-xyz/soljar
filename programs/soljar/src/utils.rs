use anchor_lang::prelude::*;
use crate::{constants::*, error::SoljarError};

pub fn get_currency_from_mint(currency_mint: Pubkey) -> Result<String> {
    match currency_mint {
        mint if mint == Pubkey::default() => Ok("SOL".to_string()),
        mint if mint == USDC_MINT => Ok("USDC".to_string()),
        mint if mint == USDT_MINT => Ok("USDT".to_string()),
        _ => Err(SoljarError::InvalidCurrencyMint.into()),
    }
} 