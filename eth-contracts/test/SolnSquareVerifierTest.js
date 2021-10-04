// Test if a new solution can be added for contract - SolnSquareVerifier
// Test if an ERC721 token can be minted for contract - SolnSquareVerifier
const expect = require('chai').expect;
const truffleAssert = require('truffle-assertions');

const verifierContractDefinition = artifacts.require('Verifier');
const solnSquareContractDefinition = artifacts.require('SolnSquareVerifier');

contract('SolnSquareVerifier', accounts => {

    let contractInstance;
    const name = "FLP_HOME_RC721";
    const symbol = "FLP_HOME";
    describe('Test suite: addSolution', () => {

        before(async() => { 
            const verifier = await verifierContractDefinition.new({from: accounts[0]});
            contractInstance = await solnSquareContractDefinition.new(verifier.address, name, symbol, {from: accounts[0]});
        });             

    });

    describe('Test suite: mintNewNFT', () => {
        before(async() => { 
            const verifier = await verifierContractDefinition.new({from: accounts[0]});
            contractInstance = await solnSquareContractDefinition.new(verifier.address, name, symbol, {from: accounts[0]});
        });

        it('should not mint a token via mintNewNFT if solution has not been verified', async() => {
            await expectToRevert(contractInstance.mintNewNFT(16, 1, accounts[1], {from: accounts[0]}), "Solution does not exist");
        }); 
      
    });

});

const expectToRevert = (promise, errorMessage) => {
    return truffleAssert.reverts(promise, errorMessage);
};