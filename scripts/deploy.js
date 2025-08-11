const hre = require("hardhat");

async function main() {
  console.log("Deploying all contracts...");

  // Deploy CertificateValidation contract
  console.log("Deploying CertificateValidation...");
  const CertificateValidation = await hre.ethers.getContractFactory("CertificateValidation");
  const certificateValidation = await CertificateValidation.deploy();
  await certificateValidation.waitForDeployment();
  const certificateValidationAddress = await certificateValidation.getAddress();
  console.log(`CertificateValidation deployed to: ${certificateValidationAddress}`);

  // Deploy Admin contract
  console.log("Deploying Admin...");
  const Admin = await hre.ethers.getContractFactory("Admin");
  const admin = await Admin.deploy();
  await admin.waitForDeployment();
  const adminAddress = await admin.getAddress();
  console.log(`Admin deployed to: ${adminAddress}`);

  // Log all deployed contract addresses
  console.log("\n=== Deployment Summary ===");
  console.log(`CertificateValidation: ${certificateValidationAddress}`);
  console.log(`Admin: ${adminAddress}`);
  console.log("\nSave these addresses in your .env file:");
  console.log(`CONTRACT_ADDRESS=${certificateValidationAddress}`);
  console.log(`ADMIN_CONTRACT_ADDRESS=${adminAddress}`);
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
  