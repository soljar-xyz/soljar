import { getTestContext } from "../utils/setup";
import {
  findUserPDA,
  findJarPDA,
  findTipLinkPDA,
  findUserNamePDA,
  findSupporterIndexPDA,
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
    const supporterIndexPDA = findSupporterIndexPDA(jarPDA, 0);

    // Create user account
    await program.methods
      .createUser(username)
      .accounts({})
      .postInstructions([
        await program.methods
          .createSupporterIndex(0)
          .accounts({})
          .instruction(),
      ])
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
    expect(Number(jar.depositCount)).toBe(0);
    expect(Number(jar.withdrawlCount)).toBe(0);
    expect(Number(jar.supporterCount)).toBe(0);
    expect(jar.id).toBe(username);

    const tipLinkPDA = findTipLinkPDA(username);
    const tipLink = await program.account.tipLink.fetch(tipLinkPDA);
    expect(tipLink.user.equals(userPDA)).toBe(true);
    expect(tipLink.jar.equals(jarPDA)).toBe(true);

    const supporterIndex = await program.account.supporterIndex.fetch(
      supporterIndexPDA
    );
    console.log(supporterIndex);
    expect(supporterIndex.totalItems).toBe(0);
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

  it("should fail with disallowed username", async () => {
    const { context, newMember } = getTestContext();
    const username = "admin";

    const newMemberProvider = new BankrunProvider(context);
    newMemberProvider.wallet = new NodeWallet(newMember);

    const newMemberProgram = new anchor.Program<Soljar>(
      IDL as Soljar,
      newMemberProvider
    );

    await expect(
      newMemberProgram.methods
        .createUser(username)
        .accounts({})
        .signers([newMember])
        .rpc()
    ).rejects.toThrow("UsernameNotAllowed");
  });

  it("should fail with invalid username formats and succeed with valid ones", async () => {
    const { context, members } = getTestContext();

    // Test uppercase/mixed case (should fail with UsernameMustBeLowercase)
    const uppercaseUsernames = [
      "UserName", // uppercase not allowed
      "mixedCase", // mixed case not allowed
      "UPPERCASE", // uppercase not allowed
      "User_Name", // mixed case with underscore not allowed
    ];

    for (let i = 0; i < uppercaseUsernames.length; i++) {
      const member = members[i];
      const memberProvider = new BankrunProvider(context);
      memberProvider.wallet = new NodeWallet(member);

      const memberProgram = new anchor.Program<Soljar>(
        IDL as Soljar,
        memberProvider
      );

      await expect(
        memberProgram.methods
          .createUser(uppercaseUsernames[i])
          .accounts({})
          .signers([member])
          .rpc()
      ).rejects.toThrow("UsernameMustBeLowercase");
    }

    // Test invalid characters (should fail with InvalidUsernameFormat)
    const invalidCharUsernames = [
      "user name", // contains space
      "user@name", // contains special character
      "user#name", // contains special character
      "user!123", // contains special character
      "user-name", // contains hyphen
      "user.name", // contains period
    ];

    for (let i = 0; i < invalidCharUsernames.length; i++) {
      const member = members[i + uppercaseUsernames.length];
      const memberProvider = new BankrunProvider(context);
      memberProvider.wallet = new NodeWallet(member);

      const memberProgram = new anchor.Program<Soljar>(
        IDL as Soljar,
        memberProvider
      );

      await expect(
        memberProgram.methods
          .createUser(invalidCharUsernames[i])
          .accounts({})
          .signers([member])
          .rpc()
      ).rejects.toThrow("InvalidUsernameFormat");
    }

    // Test valid usernames (lowercase only)
    const validUsernames = [
      "user_name", // underscore is allowed
      "user123", // numbers are allowed
      "username", // lowercase only
      "_username_", // leading/trailing underscore
    ];

    for (let i = 0; i < validUsernames.length; i++) {
      const member =
        members[i + uppercaseUsernames.length + invalidCharUsernames.length];
      const memberProvider = new BankrunProvider(context);
      memberProvider.wallet = new NodeWallet(member);

      const memberProgram = new anchor.Program<Soljar>(
        IDL as Soljar,
        memberProvider
      );

      await memberProgram.methods
        .createUser(validUsernames[i])
        .accounts({})
        .signers([member])
        .rpc();

      const userPDA = findUserPDA(member.publicKey);
      const user = await memberProgram.account.user.fetch(userPDA);
      expect(user.username).toBe(validUsernames[i]);
    }

    // Test duplicate username
    const duplicateMember =
      members[
        uppercaseUsernames.length +
          invalidCharUsernames.length +
          validUsernames.length
      ];
    const duplicateProvider = new BankrunProvider(context);
    duplicateProvider.wallet = new NodeWallet(duplicateMember);

    const duplicateProgram = new anchor.Program<Soljar>(
      IDL as Soljar,
      duplicateProvider
    );

    await expect(
      duplicateProgram.methods
        .createUser("user_name") // Try to create with existing username
        .accounts({})
        .signers([duplicateMember])
        .rpc()
    ).rejects.toThrow("already in use");
  });
});
