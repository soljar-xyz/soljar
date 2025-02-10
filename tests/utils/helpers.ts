import { BN } from "@coral-xyz/anchor";
import { getTestContext } from "../utils/setup";
import { PublicKey } from "@solana/web3.js";

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
export const findJarPDA = (userPDA: PublicKey) => {
  const { program } = getTestContext();
  const [pda] = PublicKey.findProgramAddressSync(
    [Buffer.from("jar"), userPDA.toBuffer()],
    program.programId
  );
  return pda;
};

export const findTreasuryPDA = (jarPDA: PublicKey) => {
  const { program } = getTestContext();
  const [pda] = PublicKey.findProgramAddressSync(
    [Buffer.from("treasury"), jarPDA.toBuffer()],
    program.programId
  );
  return pda;
};
export const findIndexPDA = (jarPDA: PublicKey) => {
  const { program } = getTestContext();
  const [pda] = PublicKey.findProgramAddressSync(
    [Buffer.from("index"), jarPDA.toBuffer()],
    program.programId
  );
  return pda;
};
export const findDepositIndexPDA = (indexPDA: PublicKey, page: number) => {
  const { program } = getTestContext();
  const [pda] = PublicKey.findProgramAddressSync(
    [
      Buffer.from("deposit_index"),
      indexPDA.toBuffer(),
      Buffer.from(new Uint32Array([page]).buffer),
    ],
    program.programId
  );
  return pda;
};

export const findWithdrawlIndexPDA = (indexPDA: PublicKey, page: number) => {
  const { program } = getTestContext();
  const [pda] = PublicKey.findProgramAddressSync(
    [
      Buffer.from("withdrawl_index"),
      indexPDA.toBuffer(),
      Buffer.from(new Uint32Array([page]).buffer),
    ],
    program.programId
  );
  return pda;
};

export const findMetaIndexPDA = (indexPDA: PublicKey, page: number) => {
  const { program } = getTestContext();
  const [pda] = PublicKey.findProgramAddressSync(
    [
      Buffer.from("meta_index"),
      indexPDA.toBuffer(),
      Buffer.from(new Uint32Array([page]).buffer),
    ],
    program.programId
  );
  return pda;
};

export const findTipLinkIndexPDA = (indexPDA: PublicKey, page: number) => {
  const { program } = getTestContext();
  const [pda] = PublicKey.findProgramAddressSync(
    [
      Buffer.from("tip_link_index"),
      indexPDA.toBuffer(),
      Buffer.from(new Uint32Array([page]).buffer),
    ],
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

export const findMetaPDA = (depositPDA: PublicKey) => {
  const { program } = getTestContext();
  const [pda] = PublicKey.findProgramAddressSync(
    [Buffer.from("meta"), depositPDA.toBuffer()],
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
      Buffer.from(new Uint8Array([index]).buffer),
    ],
    program.programId
  );
  return pda;
};
