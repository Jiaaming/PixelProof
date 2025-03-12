use anchor_lang::prelude::*;
//use anchor_lang::system_program::ID; // Import the system program ID

// Temporarily commented out; replace with actual program ID after deployment
declare_id!("25aCdJA2iHQP4fuL8AzUDeKK4QWZW6VgBtsZPTy8B89u");

#[program]
pub mod image_registry {
    use super::*;

    pub fn register_image(ctx: Context<RegisterImage>, hash: [u8; 32]) -> Result<()> {
        let hash_account = &mut ctx.accounts.hash_account;
        let owner_account = &mut ctx.accounts.owner_account;

        // Validate hash is not zero
        if hash == [0u8; 32] {
            return Err(ErrorCode::InvalidHash.into());
        }

        // Check if hash is already registered
        if hash_account.owner != Pubkey::default() {
            return Err(ErrorCode::HashAlreadyRegistered.into());
        }

        // Set the owner of the hash
        hash_account.owner = ctx.accounts.author.key();

        // Add hash to owner's list
        owner_account.hashes.push(hash);

        // Log the registration
        msg!("Registered hash {} by {}", hash_to_hex(&hash), ctx.accounts.author.key());

        Ok(())
    }
}

// Account structures
#[account]
pub struct HashAccount {
    pub owner: Pubkey, // 32 bytes
}

#[account]
pub struct OwnerAccount {
    pub hashes: Vec<[u8; 32]>, // List of hashes
}

// Context for the instruction
#[derive(Accounts)]
#[instruction(hash: [u8; 32])]
pub struct RegisterImage<'info> {
    #[account(
        init_if_needed,
        payer = author,
        space = 8 + 32, // Discriminator (8) + Pubkey (32)
        seeds = [b"hash", hash.as_ref()],
        bump
    )]
    pub hash_account: Account<'info, HashAccount>,
    #[account(
        init_if_needed,
        payer = author,
        space = 8 + 4 + (32 * 100), // Discriminator (8) + Vec length (4) + 100 hashes
        seeds = [b"owner", author.key().as_ref()],
        bump
    )]
    pub owner_account: Account<'info, OwnerAccount>,
    #[account(mut)]
    pub author: Signer<'info>,
    pub system_program: Program<'info, System>,
}

// Custom errors
#[error_code]
pub enum ErrorCode {
    #[msg("The provided hash is invalid (all zeros).")]
    InvalidHash,
    #[msg("This hash has already been registered.")]
    HashAlreadyRegistered,
}

// Helper function to convert hash to hex string for logging
fn hash_to_hex(hash: &[u8; 32]) -> String {
    hash.iter().map(|b| format!("{:02x}", b)).collect()
}