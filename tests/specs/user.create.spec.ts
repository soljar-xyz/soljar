import { getTestContext } from "../utils/setup";
import {
  findUserPDA,
  findJarPDA,
  findDepositIndexPDA,
  findWithdrawalIndexPDA,
  findMetaIndexPDA,
  findTipLinkIndexPDA,
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

    // Derive index PDAs
    const depositIndexPDA = findDepositIndexPDA(jarPDA);
    const withdrawalIndexPDA = findWithdrawalIndexPDA(jarPDA);
    const metaIndexPDA = findMetaIndexPDA(jarPDA);
    const tipLinkIndexPDA = findTipLinkIndexPDA(jarPDA);

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
      ])
      .signers([creator])
      .rpc();

    // Fetch and verify user account
    const user = await program.account.user.fetch(userPDA);
    expect(user.username).toBe(username);
    expect(user.receiverWallet.equals(creator.publicKey)).toBe(true);

    // Fetch and verify jar account
    const jar = await program.account.jar.fetch(user.jarKey);
    expect(jar.userKey.equals(userPDA)).toBe(true);
    expect(Number(jar.totalDeposits)).toBe(0);
    expect(Number(jar.totalWithdrawls)).toBe(0);
    expect(Number(jar.totalMetas)).toBe(0);
    expect(jar.balances).toHaveLength(0);

    // Verify index accounts were created and linked
    expect(jar.depositIndexKey.equals(depositIndexPDA)).toBe(true);
    expect(jar.withdrawlIndexKey.equals(withdrawalIndexPDA)).toBe(true);
    expect(jar.metaIndexKey.equals(metaIndexPDA)).toBe(true);
    expect(jar.tipLinkIndexKey.equals(tipLinkIndexPDA)).toBe(true);
  });

  it("should fail with username too long", async () => {
    const { context, newMember } = getTestContext();

    const validatorMemberProvider = new BankrunProvider(context);
    validatorMemberProvider.wallet = new NodeWallet(newMember);

    const newMemberProgram = new anchor.Program<Soljar>(
      IDL as Soljar,
      validatorMemberProvider
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
});
