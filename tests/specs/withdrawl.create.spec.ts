import { getTestContext } from "../utils/setup";
import {
  findDepositPDA,
  findIndexPDA,
  findJarPDA,
  findUserPDA,
  findWithdrawlIndexPDA,
  findWithdrawlPDA,
} from "../utils/helpers";
import { BN } from "@coral-xyz/anchor";
import { PublicKey } from "@solana/web3.js";
import { TOKEN_PROGRAM_ID } from "@solana/spl-token";
import { getAccount } from "spl-token-bankrun";

describe("4. Withdrawal Creation", () => {
  it("should create a SOL withdrawal", async () => {
    const { program, creator, banksClient } = getTestContext();
    const SOL_MINT = PublicKey.default;

    const userPDA = findUserPDA(creator.publicKey);
    const jarPDA = findJarPDA(userPDA);
    const indexPDA = findIndexPDA(jarPDA);
    const withdrawlIndexPDA = findWithdrawlIndexPDA(indexPDA, 0);
    const withdrawlPDA = findWithdrawlPDA(withdrawlIndexPDA, 0);

    // Log balances for debugging
    const initialBalance = await banksClient.getBalance(creator.publicKey);
    console.log("initialBalance", Number(initialBalance));

    const withdrawAmount = new BN(500000000); // 0.5 SOL

    // Create withdrawal
    await program.methods
      .createWithdrawl(SOL_MINT, withdrawAmount)
      .accounts({})
      .signers([creator])
      .rpc();

    const finalBalance = await banksClient.getBalance(creator.publicKey);
    console.log("finalBalance", Number(finalBalance));

    // We expect the signer's balance to increase by the withdrawal amount
    // minus the transaction fee (exactly 1508360 lamports)
    const expectedBalance =
      Number(initialBalance) + withdrawAmount.toNumber() - 1508360;
    expect(Number(finalBalance)).toBe(expectedBalance);

    // Verify withdrawal account data
    const withdrawl = await program.account.withdrawl.fetch(withdrawlPDA);
    expect(withdrawl.jar).toEqual(jarPDA);
    expect(Number(withdrawl.amount)).toEqual(withdrawAmount.toNumber());

    // // Verify index updates
    const withdrawlIndex = await program.account.withdrawlIndex.fetch(
      withdrawlIndexPDA
    );
    expect(Number(withdrawlIndex.totalItems)).toEqual(1);
    expect(withdrawlIndex.withdrawls[0]).toEqual(withdrawlPDA);

    const index = await program.account.index.fetch(indexPDA);
    expect(Number(index.withdrawlIndexPage)).toEqual(0);
    expect(Number(index.totalWithdrawls)).toEqual(1);
  });

  // it("should create an SPL token withdrawal", async () => {
  //   const { program, creator, mint, banksClient } = getTestContext();

  //   const userPDA = findUserPDA(creator.publicKey);
  //   const jarPDA = findJarPDA(userPDA);
  //   const indexPDA = findIndexPDA(jarPDA);
  //   const withdrawlIndexPDA = findWithdrawlIndexPDA(indexPDA, 0);
  //   const withdrawlPDA = findWithdrawlPDA(withdrawlIndexPDA, 1);

  //   // Find the treasury's token account PDA
  //   const [jarTokenAccount] = PublicKey.findProgramAddressSync(
  //     [Buffer.from("token_account"), jarPDA.toBuffer(), mint.toBuffer()],
  //     program.programId
  //   );

  //   const initialJarTokenAccountInfo = await getAccount(
  //     // @ts-expect-error - Type mismatch in spl-token-bankrun and solana banks client
  //     banksClient,
  //     jarTokenAccount
  //   );

  //   const withdrawAmount = new BN(50000000); // 0.5 tokens

  //   await program.methods
  //     .createWithdrawl(mint, withdrawAmount)
  //     .accounts({})
  //     .postInstructions([
  //       await program.methods
  //         .withdrawTokens(withdrawAmount)
  //         .accounts({
  //           mint,
  //           tokenProgram: TOKEN_PROGRAM_ID,
  //         })
  //         .instruction(),
  //     ])
  //     .signers([creator])
  //     .rpc();

  //   // Verify withdrawal account data
  //   const withdrawl = await program.account.withdrawl.fetch(withdrawlPDA);
  //   expect(withdrawl.jar).toEqual(jarPDA);
  //   expect(Number(withdrawl.amount)).toEqual(withdrawAmount.toNumber());

  //   // Verify index updates
  //   const withdrawlIndex = await program.account.withdrawlIndex.fetch(
  //     withdrawlIndexPDA
  //   );
  //   expect(Number(withdrawlIndex.totalItems)).toEqual(2);
  //   expect(withdrawlIndex.withdrawls[1]).toEqual(withdrawlPDA);

  //   const index = await program.account.index.fetch(indexPDA);
  //   expect(Number(index.withdrawlIndexPage)).toEqual(0);
  //   expect(Number(index.totalWithdrawls)).toEqual(2);

  //   // Verify token balances
  //   const finalJarTokenAccountInfo = await getAccount(
  //     // @ts-expect-error - Type mismatch in spl-token-bankrun and solana banks client
  //     banksClient,
  //     jarTokenAccount
  //   );
  //   expect(Number(finalJarTokenAccountInfo.amount)).toEqual(
  //     Number(initialJarTokenAccountInfo.amount) - Number(withdrawAmount)
  //   );
  // });
});
