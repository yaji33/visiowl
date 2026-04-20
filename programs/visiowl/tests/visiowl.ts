import * as anchor from "@coral-xyz/anchor";
import { Program, AnchorError } from "@coral-xyz/anchor";
import { Visiowl } from "../target/types/visiowl";
import { Keypair, PublicKey, SystemProgram } from "@solana/web3.js";
import { assert } from "chai";

function repCardPda(authority: PublicKey, programId: PublicKey): PublicKey {
  return PublicKey.findProgramAddressSync(
    [Buffer.from("rep-card"), authority.toBuffer()],
    programId,
  )[0];
}

function spacePda(operator: PublicKey, nameSeed: PublicKey, programId: PublicKey): PublicKey {
  return PublicKey.findProgramAddressSync(
    [Buffer.from("space"), operator.toBuffer(), nameSeed.toBuffer()],
    programId,
  )[0];
}

async function airdrop(connection: anchor.web3.Connection, pubkey: PublicKey, sol = 2) {
  const sig = await connection.requestAirdrop(pubkey, sol * anchor.web3.LAMPORTS_PER_SOL);
  await connection.confirmTransaction(sig);
}

describe("visiowl", () => {
  const provider = anchor.AnchorProvider.env();
  anchor.setProvider(provider);

  const program = anchor.workspace.Visiowl as Program<Visiowl>;
  const wallet = provider.wallet as anchor.Wallet;

  let scoreAuthority: Keypair;

  let repCardPDA: PublicKey;
  let nameSeed: Keypair;
  let spacePDA: PublicKey;

  before(async () => {
    const fs = await import("fs");
    const raw = fs.readFileSync(`${process.env.HOME}/.config/solana/score-authority.json`, "utf8");
    scoreAuthority = Keypair.fromSecretKey(Uint8Array.from(JSON.parse(raw)));

    // Fund score authority by transferring from the test wallet
    const tx = new anchor.web3.Transaction().add(
      anchor.web3.SystemProgram.transfer({
        fromPubkey: wallet.publicKey,
        toPubkey: scoreAuthority.publicKey,
        lamports: 2 * anchor.web3.LAMPORTS_PER_SOL,
      }),
    );
    await provider.sendAndConfirm(tx);

    repCardPDA = repCardPda(wallet.publicKey, program.programId);
    nameSeed = Keypair.generate();
    spacePDA = spacePda(wallet.publicKey, nameSeed.publicKey, program.programId);
  });

  it("initializes a RepCard with correct defaults", async () => {
    await program.methods
      .initializeRepCard()
      .accounts({
        authority: wallet.publicKey,
      })
      .rpc();

    const card = await program.account.repCard.fetch(repCardPDA);
    assert.equal(card.score, 0);
    assert.deepEqual(card.tier, { earlyWallet: {} });
    assert.equal(card.isPublic, true);
    assert.equal(card.badges.length, 0);
    assert.equal(card.authority.toBase58(), wallet.publicKey.toBase58());
  });

  it("cannot initialize the same RepCard twice", async () => {
    try {
      await program.methods
        .initializeRepCard()
        .accounts({
          authority: wallet.publicKey,
        })
        .rpc();
      assert.fail("Should have thrown");
    } catch (err: unknown) {
      assert.include((err as Error).message, "already in use");
    }
  });

  it("updates score and derives correct tier — OG at 847", async () => {
    await program.methods
      .updateScore(847)
      .accounts({
        repCard: repCardPDA,
        scoreAuthority: scoreAuthority.publicKey,
      })
      .signers([scoreAuthority])
      .rpc();

    const card = await program.account.repCard.fetch(repCardPDA);
    assert.equal(card.score, 847);
    assert.deepEqual(card.tier, { og: {} });
  });

  it("updates score — PowerUser boundary at 500", async () => {
    await program.methods
      .updateScore(500)
      .accounts({
        repCard: repCardPDA,
        scoreAuthority: scoreAuthority.publicKey,
      })
      .signers([scoreAuthority])
      .rpc();

    const card = await program.account.repCard.fetch(repCardPDA);
    assert.equal(card.score, 500);
    assert.deepEqual(card.tier, { powerUser: {} });
  });

  it("rejects score > 1000", async () => {
    try {
      await program.methods
        .updateScore(1001)
        .accounts({
          repCard: repCardPDA,
          scoreAuthority: scoreAuthority.publicKey,
        })
        .signers([scoreAuthority])
        .rpc();
      assert.fail("Should have thrown");
    } catch (err: unknown) {
      assert.include((err as AnchorError).error?.errorCode?.code, "ScoreOutOfRange");
    }
  });

  it("rejects update_score from wrong signer", async () => {
    const rogue = Keypair.generate();
    try {
      await program.methods
        .updateScore(800)
        .accounts({
          repCard: repCardPDA,
          scoreAuthority: rogue.publicKey,
        })
        .signers([rogue])
        .rpc();
      assert.fail("Should have thrown");
    } catch (err: unknown) {
      assert.include((err as Error).message, "address constraint");
    }
  });

  it("toggles visibility off", async () => {
    await program.methods
      .setVisibility(false)
      .accounts({
        authority: wallet.publicKey,
      })
      .rpc();

    const card = await program.account.repCard.fetch(repCardPDA);
    assert.equal(card.isPublic, false);
  });

  it("toggles visibility back on", async () => {
    await program.methods
      .setVisibility(true)
      .accounts({
        authority: wallet.publicKey,
      })
      .rpc();

    const card = await program.account.repCard.fetch(repCardPDA);
    assert.equal(card.isPublic, true);
  });

  it("rejects set_visibility from non-owner", async () => {
    const rogue = Keypair.generate();
    await airdrop(provider.connection, rogue.publicKey, 1);
    try {
      await program.methods
        .setVisibility(false)
        .accounts({
          authority: rogue.publicKey,
        })
        .signers([rogue])
        .rpc();
      assert.fail("Should have thrown");
    } catch (err: unknown) {
      assert.include((err as Error).message, "AnchorError");
    }
  });

  it("awards a badge", async () => {
    // Reset score to known value first
    await program.methods
      .updateScore(847)
      .accounts({
        repCard: repCardPDA,
        scoreAuthority: scoreAuthority.publicKey,
      })
      .signers([scoreAuthority])
      .rpc();

    await program.methods
      .awardBadge("14-Month Staker")
      .accounts({
        repCard: repCardPDA,
        scoreAuthority: scoreAuthority.publicKey,
        systemProgram: SystemProgram.programId,
      })
      .signers([scoreAuthority])
      .rpc();

    const card = await program.account.repCard.fetch(repCardPDA);
    assert.equal(card.badges.length, 1);
    assert.equal(card.badges[0]?.label, "14-Month Staker");
  });

  it("rejects duplicate badge", async () => {
    try {
      await program.methods
        .awardBadge("14-Month Staker")
        .accounts({
          repCard: repCardPDA,
          scoreAuthority: scoreAuthority.publicKey,
          systemProgram: SystemProgram.programId,
        })
        .signers([scoreAuthority])
        .rpc();
      assert.fail("Should have thrown");
    } catch (err: unknown) {
      assert.include((err as AnchorError).error?.errorCode?.code, "DuplicateBadge");
    }
  });

  it("rejects badge label longer than 32 chars", async () => {
    try {
      await program.methods
        .awardBadge("X".repeat(33))
        .accounts({
          repCard: repCardPDA,
          scoreAuthority: scoreAuthority.publicKey,
          systemProgram: SystemProgram.programId,
        })
        .signers([scoreAuthority])
        .rpc();
      assert.fail("Should have thrown");
    } catch (err: unknown) {
      assert.include((err as AnchorError).error?.errorCode?.code, "BadgeLabelTooLong");
    }
  });

  it("grows account via resize when badge count exceeds initial 4", async () => {
    // Award 3 more badges to cross the initial 4-badge allocation
    for (let i = 2; i <= 4; i++) {
      await program.methods
        .awardBadge(`Badge-${i}`)
        .accounts({
          repCard: repCardPDA,
          scoreAuthority: scoreAuthority.publicKey,
          systemProgram: SystemProgram.programId,
        })
        .signers([scoreAuthority])
        .rpc();
    }

    // This 5th badge triggers resize
    await program.methods
      .awardBadge("Badge-5")
      .accounts({
        repCard: repCardPDA,
        scoreAuthority: scoreAuthority.publicKey,
        systemProgram: SystemProgram.programId,
      })
      .signers([scoreAuthority])
      .rpc();

    const card = await program.account.repCard.fetch(repCardPDA);
    assert.equal(card.badges.length, 5);
  });

  it("creates a Verified Space", async () => {
    await program.methods
      .createSpace("OG Founders Club", "For verified OGs only", 750)
      .accounts({
        nameSeed: nameSeed.publicKey,
        operator: wallet.publicKey,
      })
      .rpc();

    const space = await program.account.space.fetch(spacePDA);
    assert.equal(space.name, "OG Founders Club");
    assert.equal(space.minScore, 750);
    assert.equal(space.operator.toBase58(), wallet.publicKey.toBase58());
  });

  it("same operator creates two distinct spaces", async () => {
    const seed2 = Keypair.generate();
    const pda2 = spacePda(wallet.publicKey, seed2.publicKey, program.programId);

    await program.methods
      .createSpace("Space B", "Second space", 100)
      .accounts({
        nameSeed: seed2.publicKey,
        operator: wallet.publicKey,
      })
      .rpc();

    assert.notEqual(spacePDA.toBase58(), pda2.toBase58());
    const space = await program.account.space.fetch(pda2);
    assert.equal(space.name, "Space B");
  });

  it("rejects space name longer than 64 chars", async () => {
    const badSeed = Keypair.generate();
    try {
      await program.methods
        .createSpace("X".repeat(65), "desc", 100)
        .accounts({
          nameSeed: badSeed.publicKey,
          operator: wallet.publicKey,
        })
        .rpc();
      assert.fail("Should have thrown");
    } catch (err: unknown) {
      assert.include((err as AnchorError).error?.errorCode?.code, "SpaceNameTooLong");
    }
  });

  it("rejects min_score > 1000", async () => {
    const badSeed = Keypair.generate();
    try {
      await program.methods
        .createSpace("Test", "desc", 1001)
        .accounts({
          nameSeed: badSeed.publicKey,
          operator: wallet.publicKey,
        })
        .rpc();
      assert.fail("Should have thrown");
    } catch (err: unknown) {
      assert.include((err as AnchorError).error?.errorCode?.code, "ScoreOutOfRange");
    }
  });

  it("grants access when score meets threshold — writes member on-chain", async () => {
    await program.methods
      .verifyAccess()
      .accounts({
        authority: wallet.publicKey,
        space: spacePDA,
      })
      .rpc();

    const space = await program.account.space.fetch(spacePDA);
    assert.equal(space.memberCount, 1);
    assert.equal(space.members.length, 1);
    assert.equal(space.members[0]?.toBase58(), wallet.publicKey.toBase58());
  });

  it("rejects duplicate verify_access (AlreadyMember)", async () => {
    try {
      await program.methods
        .verifyAccess()
        .accounts({
          authority: wallet.publicKey,
          space: spacePDA,
        })
        .rpc();
      assert.fail("Should have thrown");
    } catch (err: unknown) {
      assert.include((err as AnchorError).error?.errorCode?.code, "AlreadyMember");
    }
  });

  it("denies access when score is too low", async () => {
    const highSeed = Keypair.generate();
    const highSpacePDA = spacePda(wallet.publicKey, highSeed.publicKey, program.programId);

    await program.methods
      .createSpace("Elite Only", "Requires 900 points", 900)
      .accounts({
        nameSeed: highSeed.publicKey,
        operator: wallet.publicKey,
      })
      .rpc();

    try {
      await program.methods
        .verifyAccess()
        .accounts({
          authority: wallet.publicKey,
          space: highSpacePDA,
        })
        .rpc();
      assert.fail("Should have thrown");
    } catch (err: unknown) {
      assert.include((err as AnchorError).error?.errorCode?.code, "InsufficientScore");
    }
  });

  it("EarlyWallet (score 0) cannot enter any scored space", async () => {
    await program.methods
      .updateScore(0)
      .accounts({
        repCard: repCardPDA,
        scoreAuthority: scoreAuthority.publicKey,
      })
      .signers([scoreAuthority])
      .rpc();

    const lowSeed = Keypair.generate();
    const lowSpacePDA = spacePda(wallet.publicKey, lowSeed.publicKey, program.programId);

    await program.methods
      .createSpace("Low Bar", "Requires 1 point", 1)
      .accounts({
        nameSeed: lowSeed.publicKey,
        operator: wallet.publicKey,
      })
      .rpc();

    try {
      await program.methods
        .verifyAccess()
        .accounts({
          authority: wallet.publicKey,
          space: lowSpacePDA,
        })
        .rpc();
      assert.fail("Should have thrown");
    } catch (err: unknown) {
      assert.include((err as AnchorError).error?.errorCode?.code, "InsufficientScore");
    }
  });
});
