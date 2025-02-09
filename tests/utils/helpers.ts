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

export const findDepositIndexPDA = (jarPDA: PublicKey) => {
  const { program } = getTestContext();
  const [pda] = PublicKey.findProgramAddressSync(
    [Buffer.from("deposit_index"), jarPDA.toBuffer()],
    program.programId
  );
  return pda;
};

export const findWithdrawalIndexPDA = (jarPDA: PublicKey) => {
  const { program } = getTestContext();
  const [pda] = PublicKey.findProgramAddressSync(
    [Buffer.from("withdrawl_index"), jarPDA.toBuffer()],
    program.programId
  );
  return pda;
};

export const findMetaIndexPDA = (jarPDA: PublicKey) => {
  const { program } = getTestContext();
  const [pda] = PublicKey.findProgramAddressSync(
    [Buffer.from("meta_index"), jarPDA.toBuffer()],
    program.programId
  );
  return pda;
};

export const findTipLinkIndexPDA = (jarPDA: PublicKey) => {
  const { program } = getTestContext();
  const [pda] = PublicKey.findProgramAddressSync(
    [Buffer.from("tip_link_index"), jarPDA.toBuffer()],
    program.programId
  );
  return pda;
};
