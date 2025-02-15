import { getTestContext } from "../utils/setup";
import {
  Currency,
  findDepositIndexPDA,
  findDepositPDA,
  findIndexPDA,
  findJarPDA,
  findMetaPDA,
  findSupporterIndexPDA,
  findSupporterPDA,
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
    const SOL_MINT = PublicKey.default;

    const username = "satoshi";

    const userPDA = findUserPDA(creator.publicKey);
    const jarPDA = findJarPDA(userPDA);

    const tipLinkPDA = findTipLinkPDA(username);
    const indexPDA = findIndexPDA(jarPDA);
    const depositIndexPDA = findDepositIndexPDA(indexPDA, 0);
    const depositPDA = findDepositPDA(depositIndexPDA, 0);

    const supporterIndexPDA = findSupporterIndexPDA(indexPDA, 0);
    const supporterPDA = findSupporterPDA(jarPDA, creator.publicKey);

    console.log("SOL_MINT: ", SOL_MINT);

    await program.methods
      .createDeposit(
        username,
        SOL_MINT,
        "referrer",
        "memo",
        new BN(10000000000)
      )
      .accounts({
        signer: creator.publicKey,
      })
      .postInstructions([
        await program.methods
          .addSupporter(username, SOL_MINT, new BN(10000000000))
          .accounts({})
          .instruction(),
      ])
      .signers([creator])
      .rpc();

    const index = await program.account.index.fetch(indexPDA);

    const depositIndex = await program.account.depositIndex.fetch(
      depositIndexPDA
    );

    console.log("Deposit Index: ", depositIndexPDA);

    console.log("Deposit PDA: ", depositPDA);

    const deposit = await program.account.deposit.fetch(depositPDA);

    const tipLink = await program.account.tipLink.fetch(tipLinkPDA);

    // let's right all expected values
    expect(deposit.signer).toEqual(creator.publicKey);
    expect(deposit.tipLink).toEqual(tipLinkPDA);
    expect(Number(deposit.amount)).toEqual(10000000000);

    expect(deposit.referrer).toEqual("referrer");
    expect(deposit.memo).toEqual("memo");

    expect(Number(tipLink.depositCount)).toEqual(1);

    expect(Number(depositIndex.totalItems)).toEqual(1);
    expect(depositIndex.deposits[0]).toEqual(depositPDA);

    expect(Number(index.depositIndexPage)).toEqual(0);
    expect(Number(index.totalDeposits)).toEqual(1);

    // Fetch the SOL balance of the treasury
    const jarBalance = await banksClient.getBalance(jarPDA);
    console.log("Jar SOL Balance: ", Number(jarBalance));
    expect(Number(jarBalance)).toEqual(10001510320); // 1 SOL = 1,000,000,000 lamports

    const supporter = await program.account.supporter.fetch(supporterPDA);
    expect(supporter.signer).toEqual(creator.publicKey);
    // expect(supporter.jar).toEqual(jarPDA);
    expect(supporter.tips).toHaveLength(1);
    expect(supporter.tips[0].currency).toEqual(Currency.SOL);
    expect(Number(supporter.tips[0].amount)).toEqual(10000000000);
    expect(Number(supporter.tipCount)).toEqual(1);

    const supporterIndex = await program.account.supporterIndex.fetch(
      supporterIndexPDA
    );
    expect(Number(supporterIndex.totalItems)).toEqual(1);
    expect(supporterIndex.supporters[0]).toEqual(supporterPDA);
  });

  it("should create an SPL token deposit", async () => {
    const { program, creator, mint, creatorTokenAccount, banksClient } =
      getTestContext();
    const username = "satoshi";

    const userPDA = findUserPDA(creator.publicKey);
    const jarPDA = findJarPDA(userPDA);

    const tipLinkPDA = findTipLinkPDA(username);
    const indexPDA = findIndexPDA(jarPDA);
    const supporterIndexPDA = findSupporterIndexPDA(indexPDA, 0);
    const supporterPDA = findSupporterPDA(jarPDA, creator.publicKey);
    const depositIndexPDA = findDepositIndexPDA(indexPDA, 0);
    const depositPDA = findDepositPDA(depositIndexPDA, 1);
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
          .addSupporter(username, mint, amount)
          .accounts({})
          .instruction(),
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
    const tipLink = await program.account.tipLink.fetch(tipLinkPDA);
    const depositIndex = await program.account.depositIndex.fetch(
      depositIndexPDA
    );
    const index = await program.account.index.fetch(indexPDA);

    // Verify deposit details
    expect(deposit.signer).toEqual(creator.publicKey);
    expect(deposit.tipLink).toEqual(tipLinkPDA);
    expect(Number(deposit.amount)).toEqual(amount.toNumber());

    expect(deposit.referrer).toEqual("referrer");
    expect(deposit.memo).toEqual("memo");

    // Verify tip link and index updates
    expect(Number(tipLink.depositCount)).toEqual(2); // 1 for the initial deposit and 1 for the SPL token deposit
    expect(Number(depositIndex.totalItems)).toEqual(2); // 1 for the initial deposit and 1 for the SPL token deposit
    expect(depositIndex.deposits[1]).toEqual(depositPDA);
    expect(Number(index.depositIndexPage)).toEqual(0);
    expect(Number(index.totalDeposits)).toEqual(2); // 1 for the initial deposit and 1 for the SPL token deposit

    // Verify token balances
    const jarTokenAccountInfo = await getAccount(
      // @ts-expect-error - Type mismatch in spl-token-bankrun and solana banks client
      banksClient,
      jarTokenAccount
    );
    expect(Number(jarTokenAccountInfo.amount)).toEqual(amount.toNumber());

    const supporterIndex = await program.account.supporterIndex.fetch(
      supporterIndexPDA
    );
    expect(Number(supporterIndex.totalItems)).toEqual(1);
    expect(supporterIndex.supporters[0]).toEqual(supporterPDA);

    const supporter = await program.account.supporter.fetch(supporterPDA);
    expect(supporter.signer).toEqual(creator.publicKey);
    // expect(supporter.jar).toEqual(jarPDA);
    expect(supporter.tips).toHaveLength(2);
    expect(supporter.tips[1].currency).toEqual(Currency.USDC);
    expect(Number(supporter.tips[1].amount)).toEqual(amount.toNumber());
    expect(Number(supporter.tipCount)).toEqual(2);
  });

  it("should create two deposits one with SOL and one with SPL token", async () => {
    const { program, creator, mint, creatorTokenAccount, banksClient } =
      getTestContext();
    const SOL_MINT = PublicKey.default;
    const username = "satoshi";

    const userPDA = findUserPDA(creator.publicKey);
    const jarPDA = findJarPDA(userPDA);

    const tipLinkPDA = findTipLinkPDA(username);
    const indexPDA = findIndexPDA(jarPDA);
    const depositIndexPDA = findDepositIndexPDA(indexPDA, 0);
    const depositPDA = findDepositPDA(depositIndexPDA, 2);
    const supporterIndexPDA = findSupporterIndexPDA(indexPDA, 0);
    const supporterPDA = findSupporterPDA(jarPDA, creator.publicKey);

    const amount = new BN(10000000000);

    await program.methods
      .createDeposit(username, SOL_MINT, "referrer", "memo", amount)
      .accounts({})
      .postInstructions([
        await program.methods
          .addSupporter(username, SOL_MINT, amount)
          .accounts({})
          .instruction(),
      ])
      .signers([creator])
      .rpc();

    const index = await program.account.index.fetch(indexPDA);
    const depositIndex = await program.account.depositIndex.fetch(
      depositIndexPDA
    );

    expect(Number(index.depositIndexPage)).toEqual(0);
    expect(Number(index.totalDeposits)).toEqual(3);
    expect(depositIndex.deposits[2]).toEqual(depositPDA);

    const supporterIndex = await program.account.supporterIndex.fetch(
      supporterIndexPDA
    );
    expect(Number(supporterIndex.totalItems)).toEqual(1);

    const supporter = await program.account.supporter.fetch(supporterPDA);
    expect(supporter.signer).toEqual(creator.publicKey);
    // expect(supporter.jar).toEqual(jarPDA);
    expect(supporter.tips).toHaveLength(2);
    expect(supporter.tips[0].currency).toEqual(Currency.SOL);
    expect(Number(supporter.tips[0].amount)).toEqual(20000000000);
    expect(Number(supporter.tipCount)).toEqual(3);

    const depositPDA2 = findDepositPDA(depositIndexPDA, 3);
    const metaPDA2 = findMetaPDA(depositPDA2);
    const supporterPDA2 = findSupporterPDA(jarPDA, creator.publicKey);
    const amount2 = new BN(100000000);

    await program.methods
      .createDeposit(username, mint, "referrer", "memo", amount2)
      .accounts({})
      .postInstructions([
        await program.methods
          .addSupporter(username, mint, amount2)
          .accounts({})
          .instruction(),
        await program.methods
          .transferTokens(username, amount2)
          .accounts({
            mint,
            sourceTokenAccount: creatorTokenAccount,
            tokenProgram: TOKEN_PROGRAM_ID,
          })
          .instruction(),
      ])
      .signers([creator])
      .rpc();

    const index2 = await program.account.index.fetch(indexPDA);
    const depositIndex2 = await program.account.depositIndex.fetch(
      depositIndexPDA
    );

    expect(Number(index2.depositIndexPage)).toEqual(0);
    expect(Number(index2.totalDeposits)).toEqual(4);
    expect(depositIndex2.deposits[3]).toEqual(depositPDA2);

    const supporterIndex2 = await program.account.supporterIndex.fetch(
      supporterIndexPDA
    );
    expect(Number(supporterIndex2.totalItems)).toEqual(1);

    const supporter2 = await program.account.supporter.fetch(supporterPDA2);
    expect(supporter2.signer).toEqual(creator.publicKey);
    // expect(supporter2.jar).toEqual(jarPDA);
    expect(supporter2.tips).toHaveLength(2);
    expect(supporter2.tips[1].currency).toEqual(Currency.USDC);
    expect(Number(supporter2.tips[1].amount)).toEqual(200000000);
    expect(Number(supporter2.tipCount)).toEqual(4);
  });
});
