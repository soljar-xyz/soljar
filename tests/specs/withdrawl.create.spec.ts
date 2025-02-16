import { getTestContext } from "../utils/setup";
import { findJarPDA } from "../utils/helpers";
import { BN } from "@coral-xyz/anchor";
import { PublicKey } from "@solana/web3.js";
import { TOKEN_PROGRAM_ID } from "@solana/spl-token";
import { getAccount } from "spl-token-bankrun";

describe("4. Withdrawal Creation", () => {
  it("should create a SOL withdrawal", async () => {
    const { program, creator, banksClient } = getTestContext();
    const SOL_MINT = PublicKey.default;

    const jarPDA = findJarPDA(creator.publicKey);

    // Log balances for debugging
    const initialBalance = await banksClient.getBalance(creator.publicKey);
    const withdrawAmount = new BN(500000000); // 0.5 SOL

    // Create withdrawal
    await program.methods
      .createWithdrawl(SOL_MINT, withdrawAmount)
      .accounts({})
      .signers([creator])
      .rpc();

    const finalBalance = await banksClient.getBalance(creator.publicKey);

    // Verify the balance change - initial + withdrawal amount
    // minus the transaction fee (exactly 1508360 lamports)
    expect(Number(finalBalance)).toBeCloseTo(
      Number(initialBalance),
      -498658680
    );

    // Verify jar updates
    const jar = await program.account.jar.fetch(jarPDA);
    expect(Number(jar.withdrawlCount)).toEqual(2);
  });

  it("should create an SPL token withdrawal", async () => {
    const { program, creator, mint, banksClient } = getTestContext();

    const jarPDA = findJarPDA(creator.publicKey);

    // Find the treasury's token account PDA
    const [jarTokenAccount] = PublicKey.findProgramAddressSync(
      [Buffer.from("token_account"), jarPDA.toBuffer(), mint.toBuffer()],
      program.programId
    );

    const initialJarTokenAccountInfo = await getAccount(
      // @ts-expect-error - Type mismatch in spl-token-bankrun and solana banks client
      banksClient,
      jarTokenAccount
    );

    const withdrawAmount = new BN(50000000); // 0.5 tokens

    await program.methods
      .withdrawSplTokens(withdrawAmount)
      .accounts({
        mint,
        tokenProgram: TOKEN_PROGRAM_ID,
      })
      .signers([creator])
      .rpc();

    // Verify token balances
    const finalJarTokenAccountInfo = await getAccount(
      // @ts-expect-error - Type mismatch in spl-token-bankrun and solana banks client
      banksClient,
      jarTokenAccount
    );
    expect(Number(finalJarTokenAccountInfo.amount)).toEqual(
      Number(initialJarTokenAccountInfo.amount) - Number(withdrawAmount)
    );
  });
});
