import * as anchor from "@coral-xyz/anchor";
import { Program } from "@coral-xyz/anchor";
import { Keypair, PublicKey } from "@solana/web3.js";
import { Soljar } from "../../target/types/soljar";
import { BanksClient, ProgramTestContext, startAnchor } from "solana-bankrun";
import { BankrunProvider } from "anchor-bankrun";
import IDL from "../../target/idl/soljar.json";
import { SYSTEM_PROGRAM_ID } from "@coral-xyz/anchor/dist/cjs/native/system";
import { TestContext } from "./setup";

export async function initializeTestContext(): Promise<TestContext> {
  const newMember = new anchor.web3.Keypair();

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
    ]
  );

  const provider = new BankrunProvider(context);
  anchor.setProvider(provider);

  const program = new Program<Soljar>(IDL as Soljar, provider);
  const banksClient = context.banksClient;
  const creator = provider.wallet.payer;

  return {
    context,
    provider,
    program,
    banksClient,
    newMember,
    creator,
  };
}
