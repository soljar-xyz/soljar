import { getTestContext } from "../utils/setup";
import {
  findUserPDA,
  findJarPDA,
  findTipLinkPDA,
  findUserNamePDA,
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
    const userPDA = findUserPDA(creator.publicKey);
    const jarPDA = findJarPDA(creator.publicKey);
    const userByNamePDA = findUserNamePDA(username);

    // Create user account
    await program.methods
      .createUser(username)
      .accounts({})
      .signers([creator])
      .rpc();

    // Fetch and verify user account
    const user = await program.account.user.fetch(userPDA);
    expect(user.username).toBe(username);
    expect(user.user.equals(creator.publicKey)).toBe(true);

    // Verify username tracker account
    const userByName = await program.account.userByName.fetch(userByNamePDA);
    expect(userByName.usernameTaken).toBe(true);

    // Fetch and verify jar account
    const jar = await program.account.jar.fetch(jarPDA);
    expect(jar.user.equals(userPDA)).toBe(true);
    expect(Number(jar.depositCount)).toBe(1);
    expect(Number(jar.withdrawalCount)).toBe(1);
    expect(Number(jar.supporterCount)).toBe(1);
    expect(jar.id).toBe(username);

    const tipLinkPDA = findTipLinkPDA(username);
    const tipLink = await program.account.tipLink.fetch(tipLinkPDA);
    expect(tipLink.user.equals(userPDA)).toBe(true);
    expect(tipLink.jar.equals(jarPDA)).toBe(true);
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
