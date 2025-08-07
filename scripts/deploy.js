const main = async () => {
  const Certificate = await hre.ethers.getContractFactory(
    "CertificateRegistry"
  );
  const certificate = await Certificate.deploy();
  await certificate.waitForDeployment();

  console.log("Certificate deployed to: ", await certificate.getAddress());
};

const runMain = async () => {
  try {
    await main();
    process.exit(0);
  } catch (error) {
    console.log(error);
    process.exit(1);
  }
};

runMain();
