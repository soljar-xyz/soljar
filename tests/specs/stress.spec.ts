import { getTestContext } from "../utils/setup";
import { findJarPDA, findUserPDA } from "../utils/helpers";
import { BN } from "@coral-xyz/anchor";
import { PublicKey } from "@solana/web3.js";

describe("5. Stress Testing", () => {
  it("should handle multiple deposits", async () => {
    const { program, creator } = getTestContext();
    const SOL_MINT = PublicKey.default;
    const username = "satoshi";

    const userPDA = findUserPDA(creator.publicKey);
    const jarPDA = findJarPDA(creator.publicKey);

    // Create multiple deposits
    const EXISTING_DEPOSIT_COUNT = 4;
    const DEPOSIT_COUNT = 50;

    for (let i = 0; i < DEPOSIT_COUNT; i++) {
      await program.methods
        .createDeposit(
          username,
          "", // referrer
          `test memo ${i}`,
          new BN(10000000) // 0.01 SOL each
        )
        .accounts({})
        .signers([creator])
        .rpc();

      // Add small delay between transactions
      await new Promise((resolve) => setTimeout(resolve, 10));
    }

    // Verify final jar state
    const jar = await program.account.jar.fetch(jarPDA);
    expect(Number(jar.depositCount)).toEqual(
      DEPOSIT_COUNT + EXISTING_DEPOSIT_COUNT
    );
  });

  it("should handle multiple withdrawals", async () => {
    const { program, creator } = getTestContext();
    const SOL_MINT = PublicKey.default;

    const userPDA = findUserPDA(creator.publicKey);
    const jarPDA = findJarPDA(creator.publicKey);

    // Create multiple withdrawals
    const EXISTING_WITHDRAWAL_COUNT = 3;
    const WITHDRAWAL_COUNT = 25;

    for (let i = 0; i < WITHDRAWAL_COUNT; i++) {
      await program.methods
        .createWithdrawl(
          SOL_MINT,
          new BN(1000000) // 0.001 SOL each
        )
        .accounts({})
        .signers([creator])
        .rpc();

      // Add small delay between transactions
      await new Promise((resolve) => setTimeout(resolve, 10));
    }

    // Verify final jar state
    const jar = await program.account.jar.fetch(jarPDA);
    expect(Number(jar.withdrawalCount)).toEqual(
      WITHDRAWAL_COUNT + EXISTING_WITHDRAWAL_COUNT
    );
  });
});
