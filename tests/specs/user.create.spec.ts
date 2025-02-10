import { getTestContext } from "../utils/setup";
import {
  findUserPDA,
  findJarPDA,
  findDepositIndexPDA,
  findWithdrawlIndexPDA,
  findMetaIndexPDA,
  findTipLinkIndexPDA,
  findTipLinkPDA,
  findUserNamePDA,
} from "../utils/helpers";
import { PublicKey } from "@solana/web3.js";
import { BankrunProvider } from "anchor-bankrun";
import IDL from "../../target/idl/soljar.json";
import NodeWallet from "@coral-xyz/anchor/dist/cjs/nodewallet";
import * as anchor from "@coral-xyz/anchor";
import { Soljar } from "@project/anchor";

describe("1. User Creation", () => {
  it("should create a new user", async () => {
    const { program, creator } = getTestContext();
    const username = "satoshi";
    const userPDA = findUserPDA(creator.publicKey);
    const jarPDA = findJarPDA(userPDA);
    const userByNamePDA = findUserNamePDA(username);

    // Create user account
    await program.methods
      .createUser(username)
      .accounts({})
      .postInstructions([
        await program.methods
          .createIndexes()
          .accounts({})
          .signers([creator])
          .instruction(),
        await program.methods
          .createTipLink(username, "Default tiplink")
          .accounts({})
          .signers([creator])
          .instruction(),
      ])
      .signers([creator])
      .rpc();

    // Fetch and verify user account
    const user = await program.account.user.fetch(userPDA);
    expect(user.username).toBe(username);
    expect(user.receiverWallet.equals(creator.publicKey)).toBe(true);

    // Verify username tracker account
    const userByName = await program.account.userByName.fetch(userByNamePDA);
    expect(userByName.usernameTaken).toBe(true);

    // Fetch and verify jar account
    const jar = await program.account.jar.fetch(user.jarKey);
    expect(jar.userKey.equals(userPDA)).toBe(true);
    expect(jar.balances).toHaveLength(0);

    const indexPDA = jar.indexKey;

    const index = await program.account.index.fetch(indexPDA);

    expect(Number(index.totalDeposits)).toBe(0);
    expect(Number(index.totalWithdrawls)).toBe(0);
    expect(Number(index.totalMetas)).toBe(0);
    expect(Number(index.totalTipLinks)).toBe(1);

    // Derive index PDAs
    const depositIndexPDA = findDepositIndexPDA(indexPDA, 0);
    const withdrawlIndexPDA = findWithdrawlIndexPDA(indexPDA, 0);
    const metaIndexPDA = findMetaIndexPDA(indexPDA, 0);
    const tipLinkIndexPDA = findTipLinkIndexPDA(indexPDA, 0);

    // Verify deposit index initialization
    const depositIndex = await program.account.depositIndex.fetch(
      depositIndexPDA
    );
    expect(depositIndex.indexKey.equals(indexPDA)).toBe(true);
    expect(Number(depositIndex.index)).toBe(0);
    expect(Number(depositIndex.totalItems)).toBe(0);

    // Verify withdrawal index initialization
    const withdrawlIndex = await program.account.withdrawlIndex.fetch(
      withdrawlIndexPDA
    );
    expect(withdrawlIndex.indexKey.equals(indexPDA)).toBe(true);
    expect(Number(withdrawlIndex.index)).toBe(0);
    expect(Number(withdrawlIndex.totalItems)).toBe(0);

    // Verify meta index initialization
    const metaIndex = await program.account.metaIndex.fetch(metaIndexPDA);
    expect(metaIndex.indexKey.equals(indexPDA)).toBe(true);
    expect(Number(metaIndex.index)).toBe(0);
    expect(Number(metaIndex.totalItems)).toBe(0);

    // Verify tip link index initialization
    const tipLinkIndex = await program.account.tipLinkIndex.fetch(
      tipLinkIndexPDA
    );
    expect(tipLinkIndex.indexKey.equals(indexPDA)).toBe(true);
    expect(Number(tipLinkIndex.index)).toBe(0);
    expect(Number(tipLinkIndex.totalItems)).toBe(1);

    const tipLinkPDA = findTipLinkPDA(indexPDA, 0);
    const tipLink = await program.account.tipLink.fetch(tipLinkPDA);
    expect(tipLink.userKey.equals(userPDA)).toBe(true);
    expect(tipLink.jarKey.equals(jarPDA)).toBe(true);
    expect(tipLink.id).toBe(username);
    expect(tipLink.description).toBe("Default tiplink");
  });

  it("should fail with username too long", async () => {
    const { context, newMember } = getTestContext();

    const newMemberProvider = new BankrunProvider(context);
    newMemberProvider.wallet = new NodeWallet(newMember);

    const newMemberProgram = new anchor.Program<Soljar>(
      IDL as Soljar,
      newMemberProvider
    );

    await expect(
      newMemberProgram.methods
        .createUser("thisusernameistoolong")
        .accounts({
          signer: newMember.publicKey,
        })
        .signers([newMember])
        .rpc()
    ).rejects.toThrow("UsernameTooLong");
  });

  it("should fail with duplicate username", async () => {
    const { context, newMember } = getTestContext();
    const username = "satoshi";

    const newMemberProvider = new BankrunProvider(context);
    newMemberProvider.wallet = new NodeWallet(newMember);

    const newMemberProgram = new anchor.Program<Soljar>(
      IDL as Soljar,
      newMemberProvider
    );

    const newUserPDA = findUserPDA(newMember.publicKey);
    const jarPDA = findJarPDA(newUserPDA);
    const userByNamePDA = findUserNamePDA(username);

    try {
      await newMemberProgram.methods
        .createUser(username)
        .accounts({})
        .signers([newMember])
        .rpc();
      throw new Error("Should have failed");
    } catch (error: any) {
      expect(error.toString()).toContain("already in use");
    }
  });
});
