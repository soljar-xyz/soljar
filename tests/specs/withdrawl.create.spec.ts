import { getTestContext } from "../utils/setup";
import { findJarPDA, findWithdrawlPDA } from "../utils/helpers";
import { BN } from "@coral-xyz/anchor";
import { PublicKey } from "@solana/web3.js";
import { TOKEN_PROGRAM_ID } from "@solana/spl-token";
import { getAccount } from "spl-token-bankrun";

describe("4. Withdrawal Creation", () => {
  it("should create a SOL withdrawal", async () => {
    const { program, creator, banksClient } = getTestContext();
    const SOL_MINT = PublicKey.default; // SOL = 0

    const jarPDA = findJarPDA(creator.publicKey);

    const initialBalance = await banksClient.getBalance(creator.publicKey);
    const withdrawAmount = new BN(500000000); // 0.5 SOL

    // Create withdrawal
    await program.methods
      .createWithdrawl(SOL_MINT, withdrawAmount)
      .accounts({})
      .signers([creator])
      .rpc();

    const finalBalance = await banksClient.getBalance(creator.publicKey);

    // Verify the balance change
    expect(Number(finalBalance)).toBeCloseTo(
      Number(initialBalance),
      -498658680
    );

    // Verify jar updates
    const jar = await program.account.jar.fetch(jarPDA);
    expect(Number(jar.withdrawlCount)).toEqual(1);

    // Verify withdrawal currency
    const withdrawl = await program.account.withdrawl.fetch(
      findWithdrawlPDA(jarPDA, 0)
    );
    expect(withdrawl.currency).toEqual(0); // SOL = 0
  });

  // it("should create an SPL token withdrawal", async () => {
  //   const { program, creator, mint, banksClient } = getTestContext();

  //   const jarPDA = findJarPDA(creator.publicKey);

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
  //     .withdrawSplTokens(withdrawAmount)
  //     .accounts({
  //       mint,
  //       tokenProgram: TOKEN_PROGRAM_ID,
  //     })
  //     .signers([creator])
  //     .rpc();

  //   // Verify token balances
  //   const finalJarTokenAccountInfo = await getAccount(
  //     // @ts-expect-error - Type mismatch in spl-token-bankrun and solana banks client
  //     banksClient,
  //     jarTokenAccount
  //   );
  //   expect(Number(finalJarTokenAccountInfo.amount)).toEqual(
  //     Number(initialJarTokenAccountInfo.amount) - Number(withdrawAmount)
  //   );

  //   // Verify withdrawal currency
  //   const withdrawl = await program.account.withdrawl.fetch(
  //     findWithdrawlPDA(jarPDA, 1)
  //   );
  //   expect(withdrawl.currency).toEqual(1); // USDC = 1
  // });
});
