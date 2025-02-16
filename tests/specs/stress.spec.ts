import { getTestContext } from "../utils/setup";
import {
  findJarPDA,
  findUserPDA,
  findSupporterIndexPDA,
} from "../utils/helpers";
import { BN, Program } from "@coral-xyz/anchor";
import { Keypair, PublicKey } from "@solana/web3.js";
import { BankrunProvider } from "anchor-bankrun";
import { Soljar } from "anchor/target/types/soljar";
import NodeWallet from "@coral-xyz/anchor/dist/cjs/nodewallet";

import IDL from "../../target/idl/soljar.json";

describe("5. Stress Testing", () => {
  it("should handle multiple deposits", async () => {
    const { members, creator, context, program } = getTestContext();
    const SOL_MINT = PublicKey.default;
    const username = "satoshi";

    const userPDA = findUserPDA(creator.publicKey);
    const jarPDA = findJarPDA(creator.publicKey);

    const initialJar = await program.account.jar.fetch(jarPDA);
    const initialDepositCount = Number(initialJar.depositCount);
    const initialSupporterCount = Number(initialJar.supporterCount);
    // Create multiple deposits
    const EXISTING_DEPOSIT_COUNT = initialDepositCount;
    const EXISTING_SUPPORTER_COUNT = initialSupporterCount;
    const ADJUSTED_SUPPORTER_COUNT = initialSupporterCount - 1; // Only for index calculations
    console.log("Initial deposit count:", EXISTING_DEPOSIT_COUNT);
    console.log("Initial supporter count:", EXISTING_SUPPORTER_COUNT);
    console.log(
      "Adjusted supporter count (for index):",
      ADJUSTED_SUPPORTER_COUNT
    );
    console.log("Members length:", members.length);
    console.log(
      "Total expected supporters:",
      members.length + EXISTING_SUPPORTER_COUNT
    );

    for (let i = 0; i < members.length; i++) {
      const newMember = members[i];
      const newMemberProvider = new BankrunProvider(context);
      newMemberProvider.wallet = new NodeWallet(newMember);

      const program2 = new Program<Soljar>(IDL as Soljar, newMemberProvider);
      try {
        await program2.methods
          .createDeposit(
            username,
            "", // referrer
            `test memo ${i}`,
            new BN(10000000) // 0.01 SOL each
          )
          .accounts({})
          .signers([newMember])
          .rpc();

        // Verify deposit was successful
        const currentJar = await program.account.jar.fetch(jarPDA);
        console.log(
          `Deposit ${i} successful. Current count:`,
          Number(currentJar.depositCount)
        );
      } catch (error) {
        console.error(`Failed to process deposit ${i}:`, error);
      }

      // Add small delay between transactions
      await new Promise((resolve) => setTimeout(resolve, 10));
    }

    // Add delay before final verification
    await new Promise((resolve) => setTimeout(resolve, 10));

    // Verify final jar state
    const jar = await program.account.jar.fetch(jarPDA);
    console.log("Final jar deposit count:", Number(jar.depositCount));
    expect(Number(jar.depositCount)).toEqual(
      members.length + EXISTING_DEPOSIT_COUNT
    );
    expect(Number(jar.supporterCount)).toEqual(
      members.length + EXISTING_SUPPORTER_COUNT
    );

    const PAGE_SIZE = 50;
    const totalPages = Math.ceil(
      (members.length + ADJUSTED_SUPPORTER_COUNT) / PAGE_SIZE
    );
    console.log("Total expected pages:", totalPages);
    console.log("Total members:", members.length);
    console.log("Initial supporter count:", EXISTING_SUPPORTER_COUNT);
    console.log(
      "Adjusted supporter count (for index):",
      ADJUSTED_SUPPORTER_COUNT
    );

    // Verify all supporter index pages
    for (let page = 1; page <= totalPages; page++) {
      const indexPDA = findSupporterIndexPDA(jarPDA, page);
      const index = await program.account.supporterIndex.fetch(indexPDA);

      if (page < totalPages) {
        // All pages except the last should be full
        expect(index.totalItems).toEqual(PAGE_SIZE);
        expect(index.supporters.length).toEqual(PAGE_SIZE);
      } else {
        // Last page contains remaining items
        const remainingItems =
          (members.length + ADJUSTED_SUPPORTER_COUNT) % PAGE_SIZE;
        const lastPageSize = remainingItems === 0 ? PAGE_SIZE : remainingItems;
        expect(index.totalItems).toEqual(lastPageSize);
        expect(index.supporters.length).toEqual(lastPageSize);
      }

      console.log(
        `Page ${page} supporters:`,
        index.supporters.map((s) => s.toString())
      );
    }

    // Verify total unique supporters across all pages
    let allSupporters: PublicKey[] = [];
    for (let page = 1; page <= totalPages; page++) {
      const indexPDA = findSupporterIndexPDA(jarPDA, page);
      const index = await program.account.supporterIndex.fetch(indexPDA);
      allSupporters = [...allSupporters, ...index.supporters];
    }

    const uniqueSupporters = new Set(allSupporters.map((s) => s.toString()));
    console.log("Total unique supporters:", uniqueSupporters.size);

    // Verify total counts
    expect(uniqueSupporters.size).toEqual(
      members.length + ADJUSTED_SUPPORTER_COUNT
    );
    expect(Number(jar.supporterCount)).toEqual(
      members.length + EXISTING_SUPPORTER_COUNT
    );
    expect(Number(jar.supporterIndex)).toEqual(totalPages);
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
    expect(Number(jar.withdrawlCount)).toEqual(
      WITHDRAWAL_COUNT + EXISTING_WITHDRAWAL_COUNT
    );
  });
});
