import * as anchor from "@coral-xyz/anchor";
import { Program } from "@coral-xyz/anchor";
import { Keypair, PublicKey } from "@solana/web3.js";
import { Soljar } from "../../target/types/soljar";
import { BanksClient, ProgramTestContext, startAnchor } from "solana-bankrun";
import { BankrunProvider } from "anchor-bankrun";

export interface TestContext {
  context: ProgramTestContext;
  provider: BankrunProvider;
  program: Program<Soljar>;
  banksClient: BanksClient;

  creator: Keypair;
  newMember: Keypair;
  mint: PublicKey;
  creatorTokenAccount: PublicKey;
  newMemberTokenAccount: PublicKey;
}

let globalTestContext: TestContext;

export const getTestContext = () => globalTestContext;
export const setTestContext = (context: TestContext) => {
  globalTestContext = context;
};
