import hre from 'hardhat';

async function main() {
  const proofOfStudy = await hre.viem.deployContract('ProofOfStudy');
  console.log(`ProofOfStudy deployed to: ${proofOfStudy.address}`);
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
