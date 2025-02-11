import { getTestContext } from "../utils/setup";
import {
  findDepositIndexPDA,
  findDepositPDA,
  findIndexPDA,
  findJarPDA,
  findMetaPDA,
  findTipLinkPDA,
  findUserPDA,
} from "../utils/helpers";
import { BN } from "@coral-xyz/anchor";
import { PublicKey } from "@solana/web3.js";
import { TOKEN_PROGRAM_ID } from "@solana/spl-token";
import { getAccount } from "spl-token-bankrun";

describe("3. Deposit Creation", () => {
  it("should create a deposit", async () => {
    const { program, creator, banksClient } = getTestContext();
    const username = "satoshi";

    const userPDA = findUserPDA(creator.publicKey);
    const jarPDA = findJarPDA(userPDA);

    const tipLinkPDA = findTipLinkPDA(username);
    const indexPDA = findIndexPDA(jarPDA);
    const depositIndexPDA = findDepositIndexPDA(indexPDA, 0);
    const depositPDA = findDepositPDA(depositIndexPDA, 0);

    const metaPDA = findMetaPDA(depositPDA);

    const SOL_MINT = PublicKey.default;

    console.log("SOL_MINT: ", SOL_MINT);

    await program.methods
      .createDeposit(username, SOL_MINT, "referrer", "memo", new BN(1000000000))
      .accounts({
        signer: creator.publicKey,
      })
      .signers([creator])
      .rpc();

    const index = await program.account.index.fetch(indexPDA);

    const depositIndex = await program.account.depositIndex.fetch(
      depositIndexPDA
    );

    console.log("Deposit Index: ", depositIndexPDA);

    console.log("Deposit PDA: ", depositPDA);

    const deposit = await program.account.deposit.fetch(depositPDA);

    const meta = await program.account.meta.fetch(metaPDA);

    const tipLink = await program.account.tipLink.fetch(tipLinkPDA);

    // let's right all expected values
    expect(deposit.signer).toEqual(creator.publicKey);
    expect(deposit.jar).toEqual(jarPDA);
    expect(deposit.meta).toEqual(metaPDA);
    expect(deposit.tipLink).toEqual(tipLinkPDA);
    expect(Number(deposit.amount)).toEqual(1000000000);

    expect(meta.jar).toEqual(jarPDA);
    expect(meta.deposit).toEqual(depositPDA);
    expect(meta.referrer).toEqual("referrer");
    expect(meta.memo).toEqual("memo");

    expect(Number(tipLink.depositCount)).toEqual(1);

    expect(Number(depositIndex.totalItems)).toEqual(1);
    expect(depositIndex.deposits[0]).toEqual(depositPDA);

    expect(Number(index.depositIndexPage)).toEqual(0);
    expect(Number(index.totalDeposits)).toEqual(1);

    // Fetch the SOL balance of the treasury
    const jarBalance = await banksClient.getBalance(jarPDA);
    console.log("Jar SOL Balance: ", Number(jarBalance));
    expect(Number(jarBalance)).toEqual(1001510320); // 1 SOL = 1,000,000,000 lamports
  });

  it("should create an SPL token deposit", async () => {
    const { program, creator, mint, creatorTokenAccount, banksClient } =
      getTestContext();
    const username = "satoshi";

    const userPDA = findUserPDA(creator.publicKey);
    const jarPDA = findJarPDA(userPDA);

    const tipLinkPDA = findTipLinkPDA(username);
    const indexPDA = findIndexPDA(jarPDA);
    const depositIndexPDA = findDepositIndexPDA(indexPDA, 0);
    const depositPDA = findDepositPDA(depositIndexPDA, 0);
    const metaPDA = findMetaPDA(depositPDA);

    // Find the treasury's token account PDA
    const [jarTokenAccount] = PublicKey.findProgramAddressSync(
      [Buffer.from("token_account"), jarPDA.toBuffer(), mint.toBuffer()],
      program.programId
    );

    const amount = new BN(100000000); // 1 token with 2 decimals

    await program.methods
      .createDeposit(username, mint, "referrer", "memo", amount)
      .accounts({
        // signer: creator.publicKey,
      })
      .postInstructions([
        await program.methods
          .transferTokens(username, amount)
          .accounts({
            mint,
            sourceTokenAccount: creatorTokenAccount,
            tokenProgram: TOKEN_PROGRAM_ID,
          })
          .instruction(),
      ])
      .signers([creator])
      .rpc();

    // Verify deposit account data
    const deposit = await program.account.deposit.fetch(depositPDA);
    const meta = await program.account.meta.fetch(metaPDA);
    const tipLink = await program.account.tipLink.fetch(tipLinkPDA);
    const depositIndex = await program.account.depositIndex.fetch(
      depositIndexPDA
    );
    const index = await program.account.index.fetch(indexPDA);

    // Verify deposit details
    expect(deposit.signer).toEqual(creator.publicKey);
    expect(deposit.jar).toEqual(jarPDA);
    expect(deposit.meta).toEqual(metaPDA);
    expect(deposit.tipLink).toEqual(tipLinkPDA);
    expect(Number(deposit.amount)).toEqual(1000000000);

    // // Verify meta details
    expect(meta.jar).toEqual(jarPDA);
    expect(meta.deposit).toEqual(depositPDA);
    expect(meta.referrer).toEqual("referrer");
    expect(meta.memo).toEqual("memo");

    // Verify tip link and index updates
    expect(Number(tipLink.depositCount)).toEqual(2); // 1 for the initial deposit and 1 for the SPL token deposit
    expect(Number(depositIndex.totalItems)).toEqual(2); // 1 for the initial deposit and 1 for the SPL token deposit
    expect(depositIndex.deposits[0]).toEqual(depositPDA);
    expect(Number(index.depositIndexPage)).toEqual(0);
    expect(Number(index.totalDeposits)).toEqual(2); // 1 for the initial deposit and 1 for the SPL token deposit

    // Verify token balances
    const jarTokenAccountInfo = await getAccount(
      // @ts-expect-error - Type mismatch in spl-token-bankrun and solana banks client
      banksClient,
      jarTokenAccount
    );
    expect(Number(jarTokenAccountInfo.amount)).toEqual(100000000);
  });
});
