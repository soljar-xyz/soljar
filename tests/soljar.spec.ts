import { setTestContext, getTestContext } from "./utils/setup";
import { initializeTestContext } from "./utils/initialize";

describe("Soljar Program Tests", () => {
  // Initialize once before ANY tests run
  beforeAll(async () => {
    const context = await initializeTestContext();
    setTestContext(context);
  });

  // Import test suites in order
  require("./specs/platform.init.spec");
  require("./specs/user.create.spec");
  require("./specs/deposit.create.spec");
  require("./specs/withdrawl.create.spec");
  require("./specs/stress.spec");
});
