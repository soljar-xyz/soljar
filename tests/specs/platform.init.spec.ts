import { getTestContext } from "../utils/setup";
import { findPlatformPDA } from "../utils/helpers";

describe("1. Platform Initialization", () => {
  it("should initialize the platform", async () => {
    const { program, creator } = getTestContext();
    const platformPDA = findPlatformPDA();

    await program.methods.initPlatform().accounts({}).signers([creator]).rpc();

    const platform = await program.account.platform.fetch(platformPDA);

    expect(Number(platform.userCount)).toBe(0);
    expect(Number(platform.jarCount)).toBe(0);
    expect(Number(platform.tipLinkCount)).toBe(0);
    expect(Number(platform.depositCount)).toBe(0);
    expect(Number(platform.withdrawlCount)).toBe(0);
  });
});
