async function main() {
    const ImageRegistry = await ethers.getContractFactory("ImageRegistry");
    const ret = await ImageRegistry.deploy();
    console.log(ret)
    console.log("Contract Deployed to Address:", ret.address);
  }
  main()
    .then(() => process.exit(0))
    .catch(error => {
      console.error(error);
      process.exit(1);
    });