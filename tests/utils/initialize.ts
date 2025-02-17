import * as anchor from "@coral-xyz/anchor";
import { Program } from "@coral-xyz/anchor";
import { Keypair, PublicKey } from "@solana/web3.js";
import { Soljar } from "../../target/types/soljar";
import { BanksClient, ProgramTestContext, startAnchor } from "solana-bankrun";
import { BankrunProvider } from "anchor-bankrun";
import IDL from "../../target/idl/soljar.json";
import { SYSTEM_PROGRAM_ID } from "@coral-xyz/anchor/dist/cjs/native/system";
import { TestContext } from "./setup";
import {
  createAssociatedTokenAccount,
  createMint,
  mintTo,
} from "spl-token-bankrun";
import { TOKEN_PROGRAM_ID } from "@solana/spl-token";

export async function initializeTestContext(): Promise<TestContext> {
  const newMember = new anchor.web3.Keypair();
  const members: Keypair[] = Array(169)
    .fill(0)
    .map(() => new anchor.web3.Keypair());
  let creatorTokenAccount: PublicKey;
  let newMemberTokenAccount: PublicKey;
  let memberTokenAccounts: PublicKey[] = [];
  let mint: PublicKey;

  const context = await startAnchor(
    "",
    [
      {
        name: "soljar",
        programId: new PublicKey(IDL.address),
      },
    ],
    [
      {
        address: newMember.publicKey,
        info: {
          lamports: 10_000_000_000,
          data: Buffer.alloc(0),
          executable: false,
          owner: SYSTEM_PROGRAM_ID,
        },
      },
      // Add initial lamports for all 50 members
      ...members.map((member) => ({
        address: member.publicKey,
        info: {
          lamports: 10_000_000_000,
          data: Buffer.alloc(0),
          executable: false,
          owner: SYSTEM_PROGRAM_ID,
        },
      })),
    ]
  );

  const provider = new BankrunProvider(context);
  anchor.setProvider(provider);

  const program = new Program<Soljar>(IDL as Soljar, provider);
  const banksClient = context.banksClient;
  const creator = provider.wallet.payer;

  // @ts-expect-error - Type mismatch in spl-token-bankrun and solana banks client
  mint = await createMint(banksClient, creator, creator.publicKey, null, 2);

  creatorTokenAccount = await createAssociatedTokenAccount(
    // @ts-expect-error - Type mismatch in spl-token-bankrun and solana banks client
    banksClient,
    creator,
    mint,
    creator.publicKey,
    TOKEN_PROGRAM_ID
  );

  newMemberTokenAccount = await createAssociatedTokenAccount(
    // @ts-expect-error - Type mismatch in spl-token-bankrun and solana banks client
    banksClient,
    creator,
    mint,
    newMember.publicKey,
    TOKEN_PROGRAM_ID
  );

  // // Mint some tokens to the creator's account
  await mintTo(
    // @ts-expect-error - Type mismatch in spl-token-bankrun and solana banks client
    banksClient,
    creator,
    mint,
    creatorTokenAccount,
    creator,
    1000000000000
  );

  await mintTo(
    // @ts-expect-error - Type mismatch in spl-token-bankrun and solana banks client
    banksClient,
    creator,
    mint,
    newMemberTokenAccount,
    creator,
    1000000000000
  );

  // Create token accounts for all 50 members
  for (const member of members) {
    const tokenAccount = await createAssociatedTokenAccount(
      // @ts-expect-error - Type mismatch in spl-token-bankrun and solana banks client
      banksClient,
      creator,
      mint,
      member.publicKey,
      TOKEN_PROGRAM_ID
    );
    memberTokenAccounts.push(tokenAccount);

    // Mint tokens to each member
    await mintTo(
      // @ts-expect-error - Type mismatch in spl-token-bankrun and solana banks client
      banksClient,
      creator,
      mint,
      tokenAccount,
      creator,
      1000000000000
    );
  }

  return {
    context,
    provider,
    program,
    banksClient,
    newMember,
    creator,
    mint,
    creatorTokenAccount,
    newMemberTokenAccount,
    members,
    memberTokenAccounts,
  };
}
