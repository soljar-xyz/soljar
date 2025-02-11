import { getTestContext } from "../utils/setup";
import {
  findUserPDA,
  findJarPDA,
  findDepositIndexPDA,
  findWithdrawlIndexPDA,
  findTipLinkPDA,
  findUserNamePDA,
  findPlatformPDA,
  findUserInfoPDA,
} from "../utils/helpers";
import { BankrunProvider } from "anchor-bankrun";
import IDL from "../../target/idl/soljar.json";
import NodeWallet from "@coral-xyz/anchor/dist/cjs/nodewallet";
import * as anchor from "@coral-xyz/anchor";
import { Soljar } from "@project/anchor";

describe("1. User Creation", () => {
  it("should create a new user", async () => {
    const { program, creator } = getTestContext();
    const username = "satoshi";
    const platformPDA = findPlatformPDA();
    const userPDA = findUserPDA(creator.publicKey);
    const userInfoPDA = findUserInfoPDA(userPDA);
    const jarPDA = findJarPDA(userPDA);
    const userByNamePDA = findUserNamePDA(username);

    // Create user account
    await program.methods
      .createUser(username)
      .accounts({})
      .postInstructions([
        await program.methods
          .initIndexes(0)
          .accounts({})
          .signers([creator])
          .instruction(),
        await program.methods
          .initTipLink(username, "Default tiplink", 0)
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

    const userInfo = await program.account.userInfo.fetch(userInfoPDA);
    expect(Number(userInfo.tipLinkCount)).toBe(1);

    // Verify username tracker account
    const userByName = await program.account.userByName.fetch(userByNamePDA);
    expect(userByName.usernameTaken).toBe(true);

    // // Fetch and verify jar account
    const jar = await program.account.jar.fetch(user.jar);
    expect(jar.user.equals(userPDA)).toBe(true);

    const indexPDA = jar.index;

    const index = await program.account.index.fetch(indexPDA);

    expect(Number(index.totalDeposits)).toBe(0);
    expect(Number(index.totalWithdrawls)).toBe(0);

    // // Derive index PDAs
    const depositIndexPDA = findDepositIndexPDA(indexPDA, 0);
    const withdrawlIndexPDA = findWithdrawlIndexPDA(indexPDA, 0);

    // // Verify deposit index initialization
    const depositIndex = await program.account.depositIndex.fetch(
      depositIndexPDA
    );
    expect(depositIndex.index.equals(indexPDA)).toBe(true);
    expect(Number(depositIndex.indexPage)).toBe(0);
    expect(Number(depositIndex.totalItems)).toBe(0);

    // // Verify withdrawal index initialization
    const withdrawlIndex = await program.account.withdrawlIndex.fetch(
      withdrawlIndexPDA
    );
    expect(withdrawlIndex.index.equals(indexPDA)).toBe(true);
    expect(Number(withdrawlIndex.indexPage)).toBe(0);
    expect(Number(withdrawlIndex.totalItems)).toBe(0);

    const tipLinkPDA = findTipLinkPDA(username);
    const tipLink = await program.account.tipLink.fetch(tipLinkPDA);
    expect(tipLink.user.equals(userPDA)).toBe(true);
    expect(tipLink.jar.equals(jarPDA)).toBe(true);
    expect(tipLink.id).toBe(username);
    expect(tipLink.description).toBe("Default tiplink");

    const platform = await program.account.platform.fetch(platformPDA);
    expect(Number(platform.userCount)).toBe(1);
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
