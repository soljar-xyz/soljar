import { getTestContext } from "../utils/setup";
import {
  findDepositIndexPDA,
  findDepositPDA,
  findIndexPDA,
  findJarPDA,
  findUserPDA,
  findWithdrawlIndexPDA,
  findWithdrawlPDA,
  findTipLinkPDA,
  findSupporterIndexPDA,
} from "../utils/helpers";
import { BN } from "@coral-xyz/anchor";
import { PublicKey } from "@solana/web3.js";
import { BankrunProvider } from "anchor-bankrun";
import IDL from "../../target/idl/soljar.json";
import NodeWallet from "@coral-xyz/anchor/dist/cjs/nodewallet";
import * as anchor from "@coral-xyz/anchor";
import { Soljar } from "@project/anchor";
import { SystemProgram } from "@solana/web3.js";

describe("5. Stress Testing", () => {
  it("should handle multiple deposits across index pages", async () => {
    const { program, creator } = getTestContext();
    const SOL_MINT = PublicKey.default;
    const username = "satoshi";

    const userPDA = findUserPDA(creator.publicKey);
    const jarPDA = findJarPDA(userPDA);
    const indexPDA = findIndexPDA(jarPDA);

    // Previous tests created 4 deposits, we'll add 46 more to fill the first page
    const EXISTING_DEPOSITS = 1;
    const NEW_DEPOSITS = 200; // This will fill the first page (50 total)
    const DEPOSITS_PER_PAGE = 50; // Match this with MAX_DEPOSITS in rust code

    // Create deposits in smaller chunks
    const CHUNK_SIZE = 10;

    for (let chunk = 0; chunk < Math.ceil(NEW_DEPOSITS / CHUNK_SIZE); chunk++) {
      const startIdx = chunk * CHUNK_SIZE;
      const endIdx = Math.min(startIdx + CHUNK_SIZE, NEW_DEPOSITS);

      // Process deposits in this chunk
      for (let i = startIdx; i < endIdx; i++) {
        const totalDeposits = EXISTING_DEPOSITS + i;
        const currentPage = Math.floor(totalDeposits / DEPOSITS_PER_PAGE);
        const depositIndexPDA = findDepositIndexPDA(indexPDA, currentPage);

        // Fetch current index to get total_deposits
        const index = await program.account.index.fetch(indexPDA);
        const depositPDA = findDepositPDA(depositIndexPDA, index.totalDeposits);

        await program.methods
          .createDeposit(
            username,
            SOL_MINT,
            "referrer",
            "memo",
            new BN(100000000)
          )
          .accounts({})
          .postInstructions([
            await program.methods
              .addSupporter(username, SOL_MINT, new BN(100000000))
              .accounts({})
              .instruction(),
          ])
          .signers([creator])
          .rpc();

        // Add small delay between transactions
        await new Promise((resolve) => setTimeout(resolve, 10));
      }

      // Verify after each chunk
      const index = await program.account.index.fetch(indexPDA);
      const depositIndex = await program.account.depositIndex.fetch(
        findDepositIndexPDA(indexPDA, 0)
      );

      const expectedTotal = Math.min(
        EXISTING_DEPOSITS + endIdx,
        DEPOSITS_PER_PAGE
      );
      expect(Number(depositIndex.totalItems)).toEqual(expectedTotal);
    }

    // Verify final state
    const finalIndex = await program.account.index.fetch(indexPDA);
    const expectedPage = Math.floor(
      (EXISTING_DEPOSITS + NEW_DEPOSITS) / DEPOSITS_PER_PAGE
    );

    expect(Number(finalIndex.depositIndexPage)).toEqual(expectedPage);

    // Verify deposit index content
    const depositIndex = await program.account.depositIndex.fetch(
      findDepositIndexPDA(indexPDA, 0)
    );
    expect(Number(depositIndex.totalItems)).toEqual(DEPOSITS_PER_PAGE);
  });

  it("should handle multiple withdrawals across index pages", async () => {
    const { program, creator } = getTestContext();
    const SOL_MINT = PublicKey.default;

    const userPDA = findUserPDA(creator.publicKey);
    const jarPDA = findJarPDA(userPDA);
    const indexPDA = findIndexPDA(jarPDA);

    // Previous tests created 2 withdrawals, we'll add 28 more
    const EXISTING_WITHDRAWALS = 1;
    const NEW_WITHDRAWALS = 200; // Total of 30 withdrawals
    const WITHDRAWALS_PER_PAGE = 50;

    // Create withdrawals in smaller chunks
    const CHUNK_SIZE = 7;
    for (
      let chunk = 0;
      chunk < Math.ceil(NEW_WITHDRAWALS / CHUNK_SIZE);
      chunk++
    ) {
      const startIdx = chunk * CHUNK_SIZE;
      const endIdx = Math.min(startIdx + CHUNK_SIZE, NEW_WITHDRAWALS);

      // Process withdrawals in this chunk
      for (let i = startIdx; i < endIdx; i++) {
        const totalWithdrawals = EXISTING_WITHDRAWALS + i;
        const currentPage = Math.floor(totalWithdrawals / WITHDRAWALS_PER_PAGE);
        const withdrawlIndexPDA = findWithdrawlIndexPDA(indexPDA, currentPage);

        // Fetch current index to get total_withdrawls
        const index = await program.account.index.fetch(indexPDA);
        const withdrawlPDA = findWithdrawlPDA(
          withdrawlIndexPDA,
          index.totalWithdrawls
        );

        await program.methods
          .createWithdrawl(SOL_MINT, new BN(10000000))
          .accounts({})
          .signers([creator])
          .rpc();

        // Add small delay between transactions
        await new Promise((resolve) => setTimeout(resolve, 10));
      }

      // Verify after each chunk
      const withdrawlIndex = await program.account.withdrawlIndex.fetch(
        findWithdrawlIndexPDA(indexPDA, 0)
      );

      const expectedTotal = Math.min(
        EXISTING_WITHDRAWALS + endIdx,
        WITHDRAWALS_PER_PAGE
      );
      expect(Number(withdrawlIndex.totalItems)).toEqual(expectedTotal);
    }

    // Verify final state
    const finalIndex = await program.account.index.fetch(indexPDA);
    const expectedPage = Math.floor(
      (EXISTING_WITHDRAWALS + NEW_WITHDRAWALS - 1) / WITHDRAWALS_PER_PAGE
    );
    expect(Number(finalIndex.withdrawlIndexPage)).toEqual(expectedPage);
    expect(Number(finalIndex.totalWithdrawls)).toEqual(
      EXISTING_WITHDRAWALS + NEW_WITHDRAWALS
    );

    // Verify withdrawal index content
    const withdrawlIndex = await program.account.withdrawlIndex.fetch(
      findWithdrawlIndexPDA(indexPDA, 0)
    );
    expect(Number(withdrawlIndex.totalItems)).toEqual(WITHDRAWALS_PER_PAGE);
  });

  it("should handle multiple supporters across index pages", async () => {
    const { program, creator, context, newMember } = getTestContext();
    const SOL_MINT = PublicKey.default;
    const username = "satoshi";

    // Create multiple supporters with different wallets
    const EXISTING_SUPPORTERS = 1; // Assuming no existing supporters
    const NEW_SUPPORTERS = 200; // This will span multiple pages
    const SUPPORTERS_PER_PAGE = 50; // Match this with supporter_index.rs

    const userPDA = findUserPDA(creator.publicKey);
    const jarPDA = findJarPDA(userPDA);
    const indexPDA = findIndexPDA(jarPDA);
    const tipLinkPDA = findTipLinkPDA(username);

    // Create supporters in smaller chunks
    const CHUNK_SIZE = 5;
    const supporters = Array(NEW_SUPPORTERS)
      .fill(null)
      .map(() => anchor.web3.Keypair.generate());

    for (
      let chunk = 0;
      chunk < Math.ceil(NEW_SUPPORTERS / CHUNK_SIZE);
      chunk++
    ) {
      const startIdx = chunk * CHUNK_SIZE;
      const endIdx = Math.min(startIdx + CHUNK_SIZE, NEW_SUPPORTERS);

      // Process supporters in this chunk
      for (let i = startIdx; i < endIdx; i++) {
        const totalSupporters = EXISTING_SUPPORTERS + i;
        const currentPage = Math.floor(totalSupporters / SUPPORTERS_PER_PAGE);

        // Create new provider and program instance for this supporter
        const supporterProvider = new BankrunProvider(context);
        supporterProvider.wallet = new NodeWallet(supporters[i]);
        const supporterProgram = new anchor.Program(
          IDL as Soljar,
          supporterProvider
        );

        // Airdrop some SOL to the supporter
        // await context.warpToSlot(BigInt(100));
        await context.setAccount(supporters[i].publicKey, {
          lamports: 1_000_000_000,
          owner: SystemProgram.programId,
          executable: false,
          data: Buffer.from([]),
        });

        await supporterProgram.methods
          .addSupporter(username, SOL_MINT, new BN(100000000))
          .accounts({})
          .signers([supporters[i]])
          .rpc();

        // Add small delay between transactions
        await new Promise((resolve) => setTimeout(resolve, 10));
      }

      // Verify after each chunk
      const supporterIndex = await program.account.supporterIndex.fetch(
        findSupporterIndexPDA(indexPDA, 0)
      );

      const expectedTotal = Math.min(
        EXISTING_SUPPORTERS + endIdx,
        SUPPORTERS_PER_PAGE
      );
      expect(Number(supporterIndex.totalItems)).toEqual(expectedTotal);
    }

    // Verify final state
    const finalIndex = await program.account.index.fetch(indexPDA);
    const expectedPage = Math.floor(
      (EXISTING_SUPPORTERS + NEW_SUPPORTERS - 1) / SUPPORTERS_PER_PAGE
    );

    expect(Number(finalIndex.supporterIndexPage)).toEqual(expectedPage);
    expect(Number(finalIndex.totalSupporters)).toEqual(
      EXISTING_SUPPORTERS + NEW_SUPPORTERS
    );

    // Verify supporter index content for first page
    const supporterIndex = await program.account.supporterIndex.fetch(
      findSupporterIndexPDA(indexPDA, 0)
    );
    expect(Number(supporterIndex.totalItems)).toEqual(SUPPORTERS_PER_PAGE);
  });
});
