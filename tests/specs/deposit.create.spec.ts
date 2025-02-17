import { getTestContext } from "../utils/setup";
import {
  Currency,
  findJarPDA,
  findSupporterIndexPDA,
  findSupporterPDA,
  findTipLinkPDA,
  findUserPDA,
} from "../utils/helpers";
import { BN } from "@coral-xyz/anchor";
import { PublicKey } from "@solana/web3.js";
import { TOKEN_PROGRAM_ID } from "@solana/spl-token";
import { getAccount } from "spl-token-bankrun";
import * as anchor from "@coral-xyz/anchor";
import { Soljar } from "anchor/target/types/soljar";
import IDL from "../../target/idl/soljar.json";
import { BankrunProvider } from "anchor-bankrun";
import NodeWallet from "@coral-xyz/anchor/dist/cjs/nodewallet";
import { AnchorError } from "@coral-xyz/anchor";

describe("3. Deposit Creation", () => {
  it("should create a deposit", async () => {
    const { program, creator, banksClient } = getTestContext();
    const SOL_MINT = PublicKey.default;
    const username = "satoshi";

    const userPDA = findUserPDA(creator.publicKey);
    const jarPDA = findJarPDA(creator.publicKey);
    const supporterPDA = findSupporterPDA(jarPDA, creator.publicKey);
    const supporterIndexPDA = findSupporterIndexPDA(jarPDA, 0);

    await program.methods
      .createDeposit(
        username,
        "", // referrer
        "test memo",
        new BN(10000000000) // 10 SOL
      )
      .accounts({})
      .signers([creator])
      .rpc();

    // Verify jar updates
    const jar = await program.account.jar.fetch(jarPDA);
    expect(Number(jar.depositCount)).toEqual(1);

    // Fetch the SOL balance of the jar
    const jarBalance = await banksClient.getBalance(jarPDA);
    expect(Number(jarBalance)).toEqual(10001600800); // 10 SOL + rent

    // Verify supporter account
    const supporter = await program.account.supporter.fetch(supporterPDA);
    expect(supporter.signer).toEqual(creator.publicKey);
    expect(supporter.activeTips).toEqual(1);
    expect(supporter.tips[0].currency).toEqual(0); // SOL = 0
    expect(Number(supporter.tips[0].amount)).toEqual(10000000000);
    expect(Number(supporter.tipCount)).toEqual(1);

    // Verify supporter index
    const supporterIndex = await program.account.supporterIndex.fetch(
      supporterIndexPDA
    );
    expect(Number(supporterIndex.totalItems)).toEqual(1);
    expect(supporterIndex.supporters).toEqual([supporterPDA]);
  });

  it("should fail with an SPL token deposit", async () => {
    const { program, creator, mint, creatorTokenAccount, banksClient } =
      getTestContext();
    const username = "satoshi";

    const userPDA = findUserPDA(creator.publicKey);
    const jarPDA = findJarPDA(creator.publicKey);
    const tipLinkPDA = findTipLinkPDA(username);
    const supporterPDA = findSupporterPDA(jarPDA, creator.publicKey);
    const supporterIndexPDA = findSupporterIndexPDA(jarPDA, 0);

    const [jarTokenAccount] = PublicKey.findProgramAddressSync(
      [Buffer.from("token_account"), jarPDA.toBuffer(), mint.toBuffer()],
      program.programId
    );

    const amount = new BN(100000000); // 1 token with 8 decimals

    await expect(
      program.methods
        .createSplDeposit(username, "referrer", "test memo", amount)
        .accounts({
          signer: creator.publicKey,
          mint: mint,
          sourceTokenAccount: creatorTokenAccount,
          tokenProgram: TOKEN_PROGRAM_ID,
        })
        .postInstructions([
          await program.methods
            .addSupporter(username, mint, amount)
            .accounts({})
            .instruction(),
        ])
        .signers([creator])
        .rpc()
    ).rejects.toThrow("InvalidCurrencyMint");
  });
  // it("should create an SPL token deposit", async () => {
  //   const { program, creator, mint, creatorTokenAccount, banksClient } =
  //     getTestContext();
  //   const username = "satoshi";

  //   const userPDA = findUserPDA(creator.publicKey);
  //   const jarPDA = findJarPDA(creator.publicKey);
  //   const tipLinkPDA = findTipLinkPDA(username);
  //   const supporterPDA = findSupporterPDA(jarPDA, creator.publicKey);
  //   const supporterIndexPDA = findSupporterIndexPDA(jarPDA, 0);

  //   const [jarTokenAccount] = PublicKey.findProgramAddressSync(
  //     [Buffer.from("token_account"), jarPDA.toBuffer(), mint.toBuffer()],
  //     program.programId
  //   );

  //   const amount = new BN(100000000); // 1 token with 8 decimals

  //   await program.methods
  //     .createSplDeposit(username, "referrer", "test memo", amount)
  //     .accounts({
  //       signer: creator.publicKey,
  //       mint: mint,
  //       sourceTokenAccount: creatorTokenAccount,
  //       tokenProgram: TOKEN_PROGRAM_ID,
  //     })
  //     .postInstructions([
  //       await program.methods
  //         .addSupporter(username, mint, amount)
  //         .accounts({})
  //         .instruction(),
  //     ])
  //     .signers([creator])
  //     .rpc();

  //   // Verify jar updates
  //   const jar = await program.account.jar.fetch(jarPDA);
  //   expect(Number(jar.depositCount)).toEqual(2);

  //   // Verify token balances
  //   const jarTokenAccountInfo = await getAccount(
  //     // @ts-ignore
  //     banksClient,
  //     jarTokenAccount
  //   );
  //   expect(Number(jarTokenAccountInfo.amount)).toEqual(amount.toNumber());

  //   // Verify supporter account
  //   const supporter = await program.account.supporter.fetch(supporterPDA);
  //   expect(supporter.signer).toEqual(creator.publicKey);
  //   expect(supporter.activeTips).toEqual(2);
  //   expect(supporter.tips[1].currency).toEqual(1); // USDC = 1
  //   expect(Number(supporter.tips[1].amount)).toEqual(amount.toNumber());
  //   expect(Number(supporter.tipCount)).toEqual(2);

  //   // Verify supporter index
  //   const supporterIndex = await program.account.supporterIndex.fetch(
  //     supporterIndexPDA
  //   );
  //   expect(Number(supporterIndex.totalItems)).toEqual(1);
  //   expect(supporterIndex.supporters).toEqual([supporterPDA]);
  // });

  // it("should create an SPL token deposit with newMember", async () => {
  //   const {
  //     context,
  //     creator,
  //     mint,
  //     banksClient,
  //     newMember,
  //     newMemberTokenAccount,
  //   } = getTestContext();
  //   const username = "satoshi";

  //   const newMemberProvider = new BankrunProvider(context);
  //   newMemberProvider.wallet = new NodeWallet(newMember);

  //   const program2 = new anchor.Program<Soljar>(
  //     IDL as Soljar,
  //     newMemberProvider
  //   );

  //   const userPDA = findUserPDA(creator.publicKey);
  //   const jarPDA = findJarPDA(creator.publicKey);
  //   const tipLinkPDA = findTipLinkPDA(username);
  //   const supporterPDA = findSupporterPDA(jarPDA, newMember.publicKey);
  //   const supporterIndexPDA = findSupporterIndexPDA(jarPDA, 0);

  //   const [jarTokenAccount] = PublicKey.findProgramAddressSync(
  //     [Buffer.from("token_account"), jarPDA.toBuffer(), mint.toBuffer()],
  //     program2.programId
  //   );

  //   const amount = new BN(100000000); // 1 token with 8 decimals

  //   const initialJarTokenAccountInfo = await getAccount(
  //     // @ts-ignore
  //     banksClient,
  //     jarTokenAccount
  //   );

  //   await program2.methods
  //     .createSplDeposit(username, "referrer", "test memo", amount)
  //     .postInstructions([
  //       await program2.methods
  //         .addSupporter(username, mint, amount)
  //         .accounts({})
  //         .instruction(),
  //     ])
  //     .accounts({
  //       signer: newMember.publicKey,
  //       mint: mint,
  //       sourceTokenAccount: newMemberTokenAccount,
  //       tokenProgram: TOKEN_PROGRAM_ID,
  //     })
  //     .signers([newMember])
  //     .rpc();

  //   // Verify jar updates
  //   const jar = await program2.account.jar.fetch(jarPDA);
  //   expect(Number(jar.depositCount)).toEqual(3);

  //   // Verify token balances
  //   const jarTokenAccountInfo = await getAccount(
  //     // @ts-ignore
  //     banksClient,
  //     jarTokenAccount
  //   );
  //   expect(Number(jarTokenAccountInfo.amount)).toEqual(
  //     Number(initialJarTokenAccountInfo.amount) + Number(amount)
  //   );

  //   // Verify supporter account
  //   const supporter = await program2.account.supporter.fetch(supporterPDA);
  //   expect(supporter.signer).toEqual(newMember.publicKey);
  //   expect(supporter.activeTips).toEqual(1);
  //   expect(supporter.tips[0].currency).toEqual(1); // USDC = 1
  //   expect(Number(supporter.tips[0].amount)).toEqual(amount.toNumber());
  //   expect(Number(supporter.tipCount)).toEqual(1);

  //   // Verify supporter index
  //   const supporterIndex = await program2.account.supporterIndex.fetch(
  //     supporterIndexPDA
  //   );
  //   expect(Number(supporterIndex.totalItems)).toEqual(2);
  //   expect(supporterIndex.supporters[1]).toEqual(supporterPDA);
  // });

  // it("should create two deposits one with SOL and one with SPL token", async () => {
  //   const { program, creator, mint, creatorTokenAccount, banksClient } =
  //     getTestContext();
  //   const SOL_MINT = PublicKey.default;
  //   const username = "satoshi";

  //   const userPDA = findUserPDA(creator.publicKey);
  //   const jarPDA = findJarPDA(userPDA);

  //   const tipLinkPDA = findTipLinkPDA(username);
  //   const indexPDA = findIndexPDA(jarPDA);
  //   const depositIndexPDA = findDepositIndexPDA(indexPDA, 0);
  //   const depositPDA = findDepositPDA(depositIndexPDA, 2);
  //   const supporterIndexPDA = findSupporterIndexPDA(indexPDA, 0);
  //   const supporterPDA = findSupporterPDA(jarPDA, creator.publicKey);

  //   const amount = new BN(10000000000);

  //   await program.methods
  //     .createDeposit(username, SOL_MINT, "referrer", "memo", amount)
  //     .accounts({})
  //     .postInstructions([
  //       await program.methods
  //         .addSupporter(username, SOL_MINT, amount)
  //         .accounts({})
  //         .instruction(),
  //     ])
  //     .signers([creator])
  //     .rpc();

  //   const index = await program.account.index.fetch(indexPDA);
  //   const depositIndex = await program.account.depositIndex.fetch(
  //     depositIndexPDA
  //   );

  //   expect(Number(index.depositIndexPage)).toEqual(0);
  //   expect(Number(index.totalDeposits)).toEqual(3);
  //   expect(depositIndex.deposits[2]).toEqual(depositPDA);

  //   const supporterIndex = await program.account.supporterIndex.fetch(
  //     supporterIndexPDA
  //   );
  //   expect(Number(supporterIndex.totalItems)).toEqual(1);

  //   const supporter = await program.account.supporter.fetch(supporterPDA);
  //   expect(supporter.signer).toEqual(creator.publicKey);
  //   // expect(supporter.jar).toEqual(jarPDA);
  //   expect(supporter.tips).toHaveLength(2);
  //   expect(supporter.tips[0].currency).toEqual(Currency.SOL);
  //   expect(Number(supporter.tips[0].amount)).toEqual(20000000000);
  //   expect(Number(supporter.tipCount)).toEqual(3);

  //   const depositPDA2 = findDepositPDA(depositIndexPDA, 3);
  //   const metaPDA2 = findMetaPDA(depositPDA2);
  //   const supporterPDA2 = findSupporterPDA(jarPDA, creator.publicKey);
  //   const amount2 = new BN(100000000);

  //   await program.methods
  //     .createDeposit(username, mint, "referrer", "memo", amount2)
  //     .accounts({})
  //     .postInstructions([
  //       await program.methods
  //         .addSupporter(username, mint, amount2)
  //         .accounts({})
  //         .instruction(),
  //       await program.methods
  //         .transferTokens(username, amount2)
  //         .accounts({
  //           mint,
  //           sourceTokenAccount: creatorTokenAccount,
  //           tokenProgram: TOKEN_PROGRAM_ID,
  //         })
  //         .instruction(),
  //     ])
  //     .signers([creator])
  //     .rpc();

  //   const index2 = await program.account.index.fetch(indexPDA);
  //   const depositIndex2 = await program.account.depositIndex.fetch(
  //     depositIndexPDA
  //   );

  //   expect(Number(index2.depositIndexPage)).toEqual(0);
  //   expect(Number(index2.totalDeposits)).toEqual(4);
  //   expect(depositIndex2.deposits[3]).toEqual(depositPDA2);

  //   const supporterIndex2 = await program.account.supporterIndex.fetch(
  //     supporterIndexPDA
  //   );
  //   expect(Number(supporterIndex2.totalItems)).toEqual(1);

  //   const supporter2 = await program.account.supporter.fetch(supporterPDA2);
  //   expect(supporter2.signer).toEqual(creator.publicKey);
  //   // expect(supporter2.jar).toEqual(jarPDA);
  //   expect(supporter2.tips).toHaveLength(2);
  //   expect(supporter2.tips[1].currency).toEqual(Currency.USDC);
  //   expect(Number(supporter2.tips[1].amount)).toEqual(200000000);
  //   expect(Number(supporter2.tipCount)).toEqual(4);
  // });
});
