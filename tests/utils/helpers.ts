import { getTestContext } from "../utils/setup";
import { PublicKey } from "@solana/web3.js";

export const findUserPDA = (user: PublicKey) => {
  const { program } = getTestContext();
  const [pda] = PublicKey.findProgramAddressSync(
    [Buffer.from("user"), user.toBuffer()],
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
      Buffer.from(page.toString()),
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
      Buffer.from(page.toString()),
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
      Buffer.from(page.toString()),
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
      Buffer.from(page.toString()),
    ],
    program.programId
  );
  return pda;
};

export const findTipLinkPDA = (indexPDA: PublicKey, tipLinkIndex: number) => {
  const { program } = getTestContext();
  const [pda] = PublicKey.findProgramAddressSync(
    [
      Buffer.from("tip_link"),
      indexPDA.toBuffer(),
      Buffer.from(tipLinkIndex.toString()),
    ],
    program.programId
  );
  return pda;
};
