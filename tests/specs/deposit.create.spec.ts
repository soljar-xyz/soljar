import { getTestContext } from "../utils/setup";
import {
  findDepositIndexPDA,
  findDepositPDA,
  findIndexPDA,
  findJarPDA,
  findMetaPDA,
  findPlatformPDA,
  findTipLinkPDA,
  findTreasuryPDA,
  findUserPDA,
} from "../utils/helpers";
import { BN } from "@coral-xyz/anchor";
import * as anchor from "@coral-xyz/anchor";
import { PublicKey } from "@solana/web3.js";

describe("3. Deposit Creation", () => {
  it("should create a deposit", async () => {
    const { program, creator, banksClient } = getTestContext();
    const username = "satoshi";

    const userPDA = findUserPDA(creator.publicKey);
    const jarPDA = findJarPDA(userPDA);
    const treasuryPDA = findTreasuryPDA(jarPDA);

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

    const treasury = await program.account.treasury.fetch(treasuryPDA);
    console.log("Treasury: ", treasury);

    // Fetch the SOL balance of the treasury
    const treasuryBalance = await banksClient.getBalance(treasuryPDA);
    console.log("Treasury SOL Balance: ", Number(treasuryBalance));
    expect(Number(treasuryBalance)).toEqual(1001287600); // 1 SOL = 1,000,000,000 lamports
  });
});
