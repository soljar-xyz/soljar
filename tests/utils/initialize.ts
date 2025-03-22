import * as anchor from "@coral-xyz/anchor";
import { Program } from "@coral-xyz/anchor";
import {
  Keypair,
  PublicKey,
  sendAndConfirmTransaction,
  SystemProgram,
  Transaction,
} from "@solana/web3.js";
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
import {
  ACCOUNT_SIZE,
  AccountLayout,
  getAssociatedTokenAddressSync,
  TOKEN_PROGRAM_ID,
} from "@solana/spl-token";
import NodeWallet from "@coral-xyz/anchor/dist/cjs/nodewallet";

export async function initializeTestContext(): Promise<TestContext> {
  const newMember = new anchor.web3.Keypair();
  const members: Keypair[] = Array(19)
    .fill(0)
    .map(() => new anchor.web3.Keypair());
  let creatorTokenAccount: PublicKey;
  let newMemberTokenAccount: PublicKey;
  let memberTokenAccounts: PublicKey[] = [];
  let mint: PublicKey;

  const usdcOwner = new anchor.web3.Keypair();

  const usdcMint = new PublicKey(
    "EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v"
  );
  const ata = getAssociatedTokenAddressSync(
    usdcMint,
    usdcOwner.publicKey,
    true
  );
  const usdcToOwn = BigInt(1_000_000_000_000);
  const tokenAccData = Buffer.alloc(ACCOUNT_SIZE);
  AccountLayout.encode(
    {
      mint: usdcMint,
      owner: usdcOwner.publicKey,
      amount: usdcToOwn,
      delegateOption: 0,
      delegate: PublicKey.default,
      delegatedAmount: BigInt(0),
      state: 1,
      isNativeOption: 0,
      isNative: BigInt(0),
      closeAuthorityOption: 0,
      closeAuthority: PublicKey.default,
    },
    tokenAccData
  );

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
        address: ata,
        info: {
          lamports: 1_000_000_000,
          data: tokenAccData,
          owner: TOKEN_PROGRAM_ID,
          executable: false,
        },
      },
      {
        address: usdcOwner.publicKey,
        info: {
          lamports: 10_000_000_000,
          data: Buffer.alloc(0),
          executable: false,
          owner: SYSTEM_PROGRAM_ID,
        },
      },
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

  const usdcToSend = usdcToOwn - BigInt(1000000000);
  // send USDC to creator
  const transaction = new Transaction();
  transaction.add(
    SystemProgram.transfer({
      fromPubkey: usdcOwner.publicKey,
      toPubkey: creator.publicKey,
      lamports: usdcToSend,
    })
  );

  // Get recent blockhash from the banks client
  const blockhash = await banksClient.getLatestBlockhash();
  transaction.recentBlockhash = blockhash?.[0];
  transaction.feePayer = usdcOwner.publicKey;

  console.log("transaction", transaction);

  // Sign and send the transaction
  transaction.sign(usdcOwner);
  await banksClient.sendTransaction(transaction);

  // fetch USDC balance of creator
  const creatorUsdcBalance = await banksClient.getBalance(creator.publicKey);
  console.log("creatorUsdcBalance", creatorUsdcBalance);

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
