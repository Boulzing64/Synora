import { buildModule } from "@nomicfoundation/hardhat-ignition/modules";

export default buildModule("SYNStakingModule", (m) => {
  const stakingTokenAddress = m.getParameter("stakingTokenAddress");

  const synStaking = m.contract("SYNStaking", [stakingTokenAddress]);

  return { synStaking };
});