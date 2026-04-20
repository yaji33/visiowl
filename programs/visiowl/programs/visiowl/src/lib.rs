use anchor_lang::prelude::*;

pub mod constants;
pub mod errors;

use constants::*;
use errors::VisiowlError;

declare_id!("2PKNewSyFjQ3DHfo638JgL7HBVBSZvcnVNahGzMm5fTC");

pub mod score_authority {
    use anchor_lang::declare_id;
    declare_id!("dSwoDETsYGdVtuXCGxNFx9gBCgThB1DRmbH35j4GE1p");
}

#[program]
pub mod visiowl {
    use super::*;

    pub fn initialize_rep_card(ctx: Context<InitializeRepCard>) -> Result<()> {
        let rep_card = &mut ctx.accounts.rep_card;
        rep_card.authority = ctx.accounts.authority.key();
        rep_card.score = 0;
        rep_card.tier = Tier::EarlyWallet;
        rep_card.badges = Vec::new();
        rep_card.last_updated = Clock::get()?.unix_timestamp;
        rep_card.is_public = true;
        rep_card.bump = ctx.bumps.rep_card;
        emit!(RepCardInitialized {
            authority: rep_card.authority,
            timestamp: rep_card.last_updated,
        });
        Ok(())
    }

    pub fn update_score(ctx: Context<UpdateScore>, new_score: u16) -> Result<()> {
        require!(new_score <= MAX_SCORE, VisiowlError::ScoreOutOfRange);
        let rep_card = &mut ctx.accounts.rep_card;
        let old_score = rep_card.score;
        rep_card.score = new_score;
        rep_card.tier = Tier::from_score(new_score);
        rep_card.last_updated = Clock::get()?.unix_timestamp;
        emit!(ScoreUpdated {
            authority: rep_card.authority,
            old_score,
            new_score,
            tier: rep_card.tier.clone(),
            timestamp: rep_card.last_updated,
        });
        Ok(())
    }

    pub fn award_badge(ctx: Context<AwardBadge>, label: String) -> Result<()> {
        require!(label.len() <= MAX_BADGE_LABEL, VisiowlError::BadgeLabelTooLong);

        {
            let rep_card = &ctx.accounts.rep_card;
            require!(rep_card.badges.len() < MAX_BADGES, VisiowlError::TooManyBadges);
            require!(
                !rep_card.badges.iter().any(|b: &Badge| b.label == label),
                VisiowlError::DuplicateBadge
            );
        }

        let new_len = RepCard::base_len()
            + (ctx.accounts.rep_card.badges.len() + 1) * Badge::LEN;

        let rent = Rent::get()?;
        let new_minimum_balance = rent.minimum_balance(new_len);
        let current_balance = ctx.accounts.rep_card.to_account_info().lamports();

        if new_minimum_balance > current_balance {
            let diff = new_minimum_balance - current_balance;
            anchor_lang::system_program::transfer(
                CpiContext::new(
                    ctx.accounts.system_program.to_account_info(),
                    anchor_lang::system_program::Transfer {
                        from: ctx.accounts.score_authority.to_account_info(),
                        to: ctx.accounts.rep_card.to_account_info(),
                    },
                ),
                diff,
            )?;
        }

        ctx.accounts.rep_card.to_account_info().resize(new_len)?;

        let rep_card = &mut ctx.accounts.rep_card;
        rep_card.badges.push(Badge {
            label: label.clone(),
            awarded_at: Clock::get()?.unix_timestamp,
        });
        rep_card.last_updated = Clock::get()?.unix_timestamp;
        emit!(BadgeAwarded {
            authority: rep_card.authority,
            label,
            timestamp: rep_card.last_updated,
        });
        Ok(())
    }
    pub fn set_visibility(ctx: Context<SetVisibility>, is_public: bool) -> Result<()> {
        let rep_card = &mut ctx.accounts.rep_card;
        rep_card.is_public = is_public;
        rep_card.last_updated = Clock::get()?.unix_timestamp;
        Ok(())
    }

    pub fn create_space(
        ctx: Context<CreateSpace>,
        name: String,
        description: String,
        min_score: u16,
    ) -> Result<()> {
        require!(name.len() <= MAX_SPACE_NAME, VisiowlError::SpaceNameTooLong);
        require!(description.len() <= MAX_SPACE_DESC, VisiowlError::SpaceDescTooLong);
        require!(min_score <= MAX_SCORE, VisiowlError::ScoreOutOfRange);
        let space = &mut ctx.accounts.space_account;
        space.operator = ctx.accounts.operator.key();
        space.name = name.clone();
        space.description = description;
        space.min_score = min_score;
        space.member_count = 0;
        space.created_at = Clock::get()?.unix_timestamp;
        space.bump = ctx.bumps.space_account;
        emit!(SpaceCreated {
            operator: space.operator,
            name,
            min_score,
            timestamp: space.created_at,
        });
        Ok(())
    }

    pub fn verify_access(ctx: Context<VerifyAccess>) -> Result<()> {
        let authority_key = ctx.accounts.authority.key();
        let space_key = ctx.accounts.space.key();

        require!(
            ctx.accounts.rep_card.score >= ctx.accounts.space.min_score,
            VisiowlError::InsufficientScore
        );
        require!(
            (ctx.accounts.space.member_count as usize) < MAX_MEMBERS,
            VisiowlError::SpaceFull
        );
        require!(
            !ctx.accounts.space.members.contains(&authority_key),
            VisiowlError::AlreadyMember
        );

        let score     = ctx.accounts.rep_card.score;
        let min_score = ctx.accounts.space.min_score;
        let new_len   = Space::LEN + (ctx.accounts.space.members.len() + 1) * 32;

        let rent = Rent::get()?;
        let new_min_balance = rent.minimum_balance(new_len);
        let current_balance = ctx.accounts.space.to_account_info().lamports();

        if new_min_balance > current_balance {
            anchor_lang::system_program::transfer(
                CpiContext::new(
                    ctx.accounts.system_program.to_account_info(),
                    anchor_lang::system_program::Transfer {
                        from: ctx.accounts.authority.to_account_info(),
                        to:   ctx.accounts.space.to_account_info(),
                    },
                ),
                new_min_balance - current_balance,
            )?;
        }

        ctx.accounts.space.to_account_info().resize(new_len)?;

        let space = &mut ctx.accounts.space;
        space.members.push(authority_key);
        space.member_count += 1;

        emit!(AccessVerified {
            authority: authority_key,
            space:     space_key,
            score,
            required:  min_score,
            timestamp: Clock::get()?.unix_timestamp,
        });
        Ok(())
    }
}

#[derive(Accounts)]
pub struct InitializeRepCard<'info> {
    #[account(
        init,
        payer = authority,
        space = RepCard::LEN,
        seeds = [b"rep-card", authority.key().as_ref()],
        bump,
    )]
    pub rep_card: Account<'info, RepCard>,

    #[account(mut)]
    pub authority: Signer<'info>,

    pub system_program: Program<'info, System>,
}

#[derive(Accounts)]
pub struct UpdateScore<'info> {
    #[account(
        mut,
        seeds = [b"rep-card", rep_card.authority.as_ref()],
        bump = rep_card.bump,
    )]
    pub rep_card: Account<'info, RepCard>,

    #[account(address = score_authority::ID)]
    pub score_authority: Signer<'info>,
}

#[derive(Accounts)]
pub struct AwardBadge<'info> {
    #[account(
        mut,
        seeds = [b"rep-card", rep_card.authority.as_ref()],
        bump = rep_card.bump,
    )]
    pub rep_card: Account<'info, RepCard>,

    #[account(mut, address = score_authority::ID)]
    pub score_authority: Signer<'info>,

    pub system_program: Program<'info, System>,
}

#[derive(Accounts)]
pub struct SetVisibility<'info> {
    #[account(
        mut,
        seeds = [b"rep-card", authority.key().as_ref()],
        bump = rep_card.bump,
        has_one = authority,
    )]
    pub rep_card: Account<'info, RepCard>,

    pub authority: Signer<'info>,
}

#[derive(Accounts)]
pub struct CreateSpace<'info> {
    #[account(
        init,
        payer = operator,
        space = Space::LEN,
        seeds = [b"space", operator.key().as_ref(), name_seed.key().as_ref()],
        bump,
    )]
    pub space_account: Account<'info, Space>,

    pub name_seed: SystemAccount<'info>,

    #[account(mut)]
    pub operator: Signer<'info>,

    pub system_program: Program<'info, System>,
}

#[derive(Accounts)]
pub struct VerifyAccess<'info> {
    #[account(
        seeds = [b"rep-card", authority.key().as_ref()],
        bump = rep_card.bump,
        has_one = authority,
    )]
    pub rep_card: Account<'info, RepCard>,

    #[account(mut)]
    pub authority: Signer<'info>,

    #[account(mut)]
    pub space: Account<'info, Space>,

    pub system_program: Program<'info, System>,
}

#[account]
pub struct RepCard {
    pub authority:    Pubkey,    
    pub score:        u16,       
    pub tier:         Tier,      
    pub badges:       Vec<Badge>, 
    pub last_updated: i64,       
    pub is_public:    bool,      
    pub bump:         u8,         
}

impl RepCard {
    const fn base_len_const() -> usize {
        8    
        + 32 
        + 2  
        + 1  
        + 4  
        + 8
        + 1  
        + 1 
    }

    pub fn base_len() -> usize {
        Self::base_len_const()
    }

    pub const LEN: usize = Self::base_len_const() + 4 * Badge::LEN;
}

#[account]
pub struct Space {
    pub operator:     Pubkey,
    pub name:         String,
    pub description:  String,
    pub min_score:    u16,
    pub member_count: u32,
    pub created_at:   i64,
    pub bump:         u8,
    pub members:      Vec<Pubkey>,
}

impl Space {
    pub const LEN: usize =
        8                  
        + 32                
        + 4 + MAX_SPACE_NAME  
        + 4 + MAX_SPACE_DESC  
        + 2                   
        + 4                   
        + 8                
        + 1                   
        + 4;                  
}


#[derive(AnchorSerialize, AnchorDeserialize, Clone)]
pub struct Badge {
    pub label:      String, 
    pub awarded_at: i64,
}

impl Badge {
    pub const LEN: usize = 4 + MAX_BADGE_LABEL + 8;
}

#[derive(AnchorSerialize, AnchorDeserialize, Clone, PartialEq)]
pub enum Tier {
    EarlyWallet,  
    ActiveMember, 
    Established, 
    PowerUser, 
    OG,       
}

impl Tier {
    pub fn from_score(score: u16) -> Self {
        match score {
            750..=1000 => Tier::OG,
            500..=749  => Tier::PowerUser,
            300..=499  => Tier::Established,
            100..=299  => Tier::ActiveMember,
            _          => Tier::EarlyWallet,
        }
    }
}

#[event]
pub struct RepCardInitialized {
    pub authority: Pubkey,
    pub timestamp: i64,
}

#[event]
pub struct ScoreUpdated {
    pub authority: Pubkey,
    pub old_score: u16,
    pub new_score: u16,
    pub tier:      Tier,
    pub timestamp: i64,
}

#[event]
pub struct BadgeAwarded {
    pub authority: Pubkey,
    pub label:     String,
    pub timestamp: i64,
}

#[event]
pub struct SpaceCreated {
    pub operator:  Pubkey,
    pub name:      String,
    pub min_score: u16,
    pub timestamp: i64,
}

#[event]
pub struct AccessVerified {
    pub authority: Pubkey,
    pub space:     Pubkey,
    pub score:     u16,
    pub required:  u16,
    pub timestamp: i64,
}
