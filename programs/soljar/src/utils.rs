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
        _ => Err(SoljarError::InvalidCurrencyMint.into()),
    }
}

// These usernames are reserved for the official Soljar account and other official accounts
pub fn is_username_disallowed(username: &str) -> bool {
    let disallowed_usernames = [
        "admin",
        "moderator",
        "mod",
        "support",
        "help",
        "system",
        "official",
        "dogs",
        "solana",
        "sol",
        "jar",
        "tip",
        "tips",
        "phantom",
        "solflare",
        "squads",
        "squad",
        "fuse",
        "cats",
        "pudgypenguins",
        "pudgypenguin",
        "penguin",
        "penguins",
        "pudgy",
        "pudgy",
        "pudgy",
        "bonk",
        
    ];
    
    disallowed_usernames.contains(&username.to_lowercase().as_str())
} 