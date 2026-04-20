use anchor_lang::prelude::*;

#[error_code]
pub enum VisiowlError {
    #[msg("Rep Score must be between 0 and 1000")]
    ScoreOutOfRange,
    #[msg("Badge label exceeds 32 characters")]
    BadgeLabelTooLong,
    #[msg("Wallet has reached the maximum badge limit (16)")]
    TooManyBadges,
    #[msg("This badge has already been awarded to this wallet")]
    DuplicateBadge,
    #[msg("Space name exceeds 64 characters")]
    SpaceNameTooLong,
    #[msg("Space description exceeds 256 characters")]
    SpaceDescTooLong,
    #[msg("Wallet Rep Score does not meet the Space's minimum requirement")]
    InsufficientScore,
    #[msg("Space has reached the maximum member limit (1000)")]
    SpaceFull,
    #[msg("This wallet is already a verified member of this Space")]
    AlreadyMember,
}