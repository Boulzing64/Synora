import { buildModule } from "@nomicfoundation/hardhat-ignition/modules";

export default buildModule("RewardsDistributorModule", (m) => {
  const initialOwner = m.getAccount(0);
  const rewardTokenAddress = m.getParameter("rewardTokenAddress");
  const rewardsSigner = m.getParameter("rewardsSigner", initialOwner);

  const rewardsDistributor = m.contract(
    "RewardsDistributor",
    [initialOwner, rewardTokenAddress, rewardsSigner],
    {
      from: initialOwner,
    }
  );

  return { rewardsDistributor };
});