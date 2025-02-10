use anchor_lang::prelude::*;

#[account]
pub struct UserByName {
    pub username_taken: bool,
}

impl UserByName {
    pub const INIT_SPACE: usize = 1; // Size for a boolean
}
