import { BN } from "@coral-xyz/anchor";
import { getTestContext } from "../utils/setup";
import { PublicKey } from "@solana/web3.js";

export const Currency = {
  SOL: "SOL",
  USDC: "USDC",
  USDT: "USDT",
  JAR: "JAR",
};

export const findPlatformPDA = () => {
  const { program } = getTestContext();
  const [pda] = PublicKey.findProgramAddressSync(
    [Buffer.from("platform")],
    program.programId
  );
  return pda;
};

export const findUserPDA = (user: PublicKey) => {
  const { program } = getTestContext();
  const [pda] = PublicKey.findProgramAddressSync(
    [Buffer.from("user"), user.toBuffer()],
    program.programId
  );
  return pda;
};

export const findUserNamePDA = (username: string) => {
  const { program } = getTestContext();
  const [pda] = PublicKey.findProgramAddressSync(
    [Buffer.from("username"), Buffer.from(username)],
    program.programId
  );
  return pda;
};
export const findJarPDA = (signer: PublicKey) => {
  const { program } = getTestContext();
  const [pda] = PublicKey.findProgramAddressSync(
    [Buffer.from("jar"), signer.toBuffer()],
    program.programId
  );
  return pda;
};

export const findTipLinkPDA = (id: string) => {
  const { program } = getTestContext();
  const [pda] = PublicKey.findProgramAddressSync(
    [Buffer.from("tip_link"), Buffer.from(id)],
    program.programId
  );
  return pda;
};

export const findDepositPDA = (depositIndexPDA: PublicKey, index: number) => {
  const { program } = getTestContext();
  const [pda] = PublicKey.findProgramAddressSync(
    [
      Buffer.from("deposit"),
      depositIndexPDA.toBuffer(),
      Buffer.from(new Uint32Array([index]).buffer),
    ],
    program.programId
  );
  return pda;
};

export const findSupporterIndexPDA = (
  jar: PublicKey,
  supporterIndex: number
) => {
  const { program } = getTestContext();
  const [pda] = PublicKey.findProgramAddressSync(
    [
      Buffer.from("supporter_index"),
      jar.toBuffer(),
      Buffer.from(new Uint32Array([supporterIndex]).buffer),
    ],
    program.programId
  );
  return pda;
};

export const findSupporterPDA = (jar: PublicKey, signer: PublicKey) => {
  const { program } = getTestContext();
  const [pda] = PublicKey.findProgramAddressSync(
    [Buffer.from("supporter"), jar.toBuffer(), signer.toBuffer()],
    program.programId
  );
  return pda;
};

export const findWithdrawlPDA = (
  withdrawlIndexPDA: PublicKey,
  index: number
) => {
  const { program } = getTestContext();
  const [pda] = PublicKey.findProgramAddressSync(
    [
      Buffer.from("withdrawl"),
      withdrawlIndexPDA.toBuffer(),
      Buffer.from(new Uint32Array([index]).buffer),
    ],
    program.programId
  );
  return pda;
};

export const findTokenAccountPDA = (jarPDA: PublicKey, mint: PublicKey) => {
  const { program } = getTestContext();
  const [pda] = PublicKey.findProgramAddressSync(
    [Buffer.from("token_account"), jarPDA.toBuffer(), mint.toBuffer()],
    program.programId
  );
  return pda;
};
