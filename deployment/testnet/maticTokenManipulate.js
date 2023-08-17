/* eslint-disable no-console, no-inner-declarations, no-undef, import/no-unresolved */
const { ethers } = require('hardhat');
const deployParameters = require('../deploy_parameters.json');

async function main() {
    console.log('start permit');
    let currentProvider = ethers.provider;
    if (deployParameters.multiplierGas || deployParameters.maxFeePerGas) {
        if (process.env.HARDHAT_NETWORK !== 'hardhat') {
            currentProvider = new ethers.providers.JsonRpcProvider('http://127.0.0.1:8545');
            if (deployParameters.maxPriorityFeePerGas && deployParameters.maxFeePerGas) {
                console.log(`Hardcoded gas used: MaxPriority${deployParameters.maxPriorityFeePerGas} gwei, MaxFee${deployParameters.maxFeePerGas} gwei`);
                const FEE_DATA = {
                    maxFeePerGas: ethers.utils.parseUnits(deployParameters.maxFeePerGas, 'gwei'),
                    maxPriorityFeePerGas: ethers.utils.parseUnits(deployParameters.maxPriorityFeePerGas, 'gwei'),
                };
                currentProvider.getFeeData = async () => FEE_DATA;
            } else {
                console.log('Multiplier gas used: ', deployParameters.multiplierGas);
                async function overrideFeeData() {
                    const feedata = await ethers.provider.getFeeData();
                    return {
                        maxFeePerGas: feedata.maxFeePerGas.mul(deployParameters.multiplierGas),
                        maxPriorityFeePerGas: feedata.maxPriorityFeePerGas.mul(deployParameters.multiplierGas),
                    };
                }
                currentProvider.getFeeData = overrideFeeData;
            }
        }
    }

    const permitter = new ethers.Wallet('0xac0974bec39a17e36ba4a6b4d238ff944bacb478cbed5efcae784d7bf4f2ff80', currentProvider);
    console.log('permitter addr', permitter.address);
    const maticTokenFactory = await ethers.getContractFactory('ERC20PermitMock', permitter);
    const maticToken = maticTokenFactory.attach(deployParameters.maticTokenAddress);
    const permitValue = ethers.utils.parseEther('100000');
    console.log('permitValue ', permitValue);
    const tx = await (await maticToken.connect(permitter).approve('0x48515ADf06d042b4001b88670F780f1aAed6653d', permitValue)).wait();
    console.log(tx);
}

main().catch((e) => {
    console.error(e);
    process.exit(1);
});
