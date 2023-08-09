/* eslint-disable no-console, no-inner-declarations, no-undef, import/no-unresolved */
const { ethers } = require('hardhat');
const deployParameters = require("../deploy_parameters.json");

async function main() {
    /*
     * eth.sign: 1) signs any data without prefix, 2) but account needs to be unlocked, 3) Node with unlocked account
     * eth.personal.sign: 1) signs any data without prefix, 2) but account needs to be unlocked and password is optional for unlocking when signing, 3) Node with locked account
     * eth.accounts.sign: 1) signs any data prefixed with "\x19Ethereum Signed Message:\n" + message.length", 2) no need to unlock account, 3) No node
     */
    const currentProvider = new ethers.providers.JsonRpcProvider('http://165.154.12.31:8545');
    const permitter = new ethers.Wallet('0xac0974bec39a17e36ba4a6b4d238ff944bacb478cbed5efcae784d7bf4f2ff80', currentProvider);
    const maticTokenFactory = await ethers.getContractFactory('ERC20PermitMock', permitter);
    const maticToken = maticTokenFactory.attach(deployParameters.maticTokenAddress, permitter);
    console.log(await maticToken.allowance(permitter.address, '0x48515ADf06d042b4001b88670F780f1aAed6653d'));
    console.log(await maticToken.allowance(permitter.address, '0xf1894a9E9409dB2f963daC09ED00d1Eb95d96c2D'));
}

main().catch((e) => {
    console.error(e);
    process.exit(1);
});
