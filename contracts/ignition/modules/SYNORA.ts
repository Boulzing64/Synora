import { buildModule } from "@nomicfoundation/hardhat-ignition/modules";

export default buildModule("SYNORAModule", (m) => {
  const deployer = m.getAccount(0);

  const synora = m.contract("SYNORA", [deployer, deployer], {
    from: deployer,
  });

  return { synora };
});