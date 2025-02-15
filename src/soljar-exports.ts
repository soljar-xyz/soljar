// Here we export some useful types and functions for interacting with the Anchor program.
import { AnchorProvider, Program } from "@coral-xyz/anchor";
import { Cluster, PublicKey } from "@solana/web3.js";
import SoljarIDL from "../target/idl/soljar.json";
import type { Soljar } from "../target/types/soljar";

// Re-export the generated IDL and type
export { Soljar, SoljarIDL };

// The programId is imported from the program IDL.
export const SOLJAR_PROGRAM_ID = new PublicKey(SoljarIDL.address);

// This is a helper function to get the Soljar Anchor program.
export function getSoljarProgram(
  provider: AnchorProvider,
  address?: PublicKey
) {
  return new Program(
    {
      ...SoljarIDL,
      address: address ? address.toBase58() : SoljarIDL.address,
    } as Soljar,
    provider
  );
}

// This is a helper function to get the program ID for the Soljar program depending on the cluster.
export function getSoljarProgramId(cluster: Cluster) {
  switch (cluster) {
    case "devnet":
    case "testnet":
      // This is the program ID for the Soljar program on devnet and testnet.
      return new PublicKey("6kYzuEmgVUn8bmsyCDz8XuyTMVvDDVjxJj5yVSTSNo8z");
    case "mainnet-beta":
    default:
      return SOLJAR_PROGRAM_ID;
  }
}
