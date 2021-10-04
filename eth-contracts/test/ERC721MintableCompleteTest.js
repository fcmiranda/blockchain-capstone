const expect = require('chai').expect;
const truffleAssert = require('truffle-assertions');

const contractDefinition = artifacts.require('ERC721MintableComplete');

contract('ERC721MintableComplete', accounts => {

    const account_one = accounts[0];
    const account_two = accounts[1];
    const name = "FLP_HOME_RC721";
    const symbol = "FLP_HOME";
    const baseTokenURI = "https://s3-us-west-2.amazonaws.com/udacity-blockchain/capstone/";
    const zeroAddress = '0x0000000000000000000000000000000000000000';
    let currentOwner;
    let contract;
    
    describe('Test suite: Ownable inherited', function () {
        before(async() => { 
            contract = await contractDefinition.new(name, symbol, {from: account_one});
            currentOwner = account_one;
        });  

        it('should return contract owner', async() => { 
            expect(await contract.owner({from: account_two})).to.equal(currentOwner); ;
        });
        
        it('should allow to transfer ownership and emit event', async() => {
            let tx = await contract.transferOwnership(account_two, {from: currentOwner});
            truffleAssert.eventEmitted(tx, 'OwnershipTransferred', (ev) => {
                return expect(ev.previousOwner).to.deep.equal(currentOwner) && expect(ev.newOwner).to.equal(account_two);
            });
            currentOwner = account_two;
            expect(await contract.owner({from: account_two})).to.equal(currentOwner);
        });
    });

    describe('Test suite: Pausable inherited', function () {
        before(async() => { 
            contract = await contractDefinition.new(name, symbol, {from: account_one});
        }); 

        it('should allow owner to pause the contract and emit event', async() => {
            let tx = await contract.pause({from: account_one});
            truffleAssert.eventEmitted(tx, 'Paused', (ev) => {
                return expect(ev.account).to.deep.equal(account_one);
            });
        });

        it('should not allow owner to pause the contract when contract is already paused', async() => {
            await expectToRevert(contract.pause({from: account_one}), 'Contract is currently paused');
        });

        it('should allow owner to unpause the contract and emit event', async() => {
            let tr = await contract.unpause({from: account_one});
            truffleAssert.eventEmitted(tr, 'Unpaused', (ev) => {
                return expect(ev.account).to.deep.equal(account_one);
            });
        });

        it('should not allow owner to unpause the contract when contract is already unpaused', async() => {
            await expectToRevert(contract.unpause({from: account_one}), 'Contract is not currently paused');
        });

        it('should fail when minting when contract is paused', async() => { 
            await contract.pause({from: account_one});
            await expectToRevert(contract.mint(account_two, 12, {from: account_one}), 'Contract is currently paused');
        });

    });
    
    describe('Test suite: ERC721Metadata inherited', () =>{
        before(async() => { 
            contract = await contractDefinition.new(name, symbol, {from: account_one});
        });

        it('should get the correct token name', async() => {
            expect(await contract.name({from: account_two})).to.equal(name);
        });

        it('should get the correct token symbol', async() => {
            expect(await contract.symbol({from: account_two})).to.equal(symbol);
        });

        it('should get the correct token baseTokenURI', async() => {
            expect(await contract.baseTokenURI({from: account_two})).to.equal(baseTokenURI);
        });
    });

    describe('Test suite: ERC721MintableComplete', () => {
       const tokensIds = [11, 22, 33, 44, 55, 66, 77, 88, 99, 101];
        before(async() => { 
            contract = await contractDefinition.new(name, symbol, {from: account_one});
            //mint 9 tokens; account[9] has tokens id 99 and 101;
            for (let i = 0; i < tokensIds.length - 1; i++) {
                await contract.mint(accounts[i + 1], tokensIds[i], {from: account_one});
            }
            await contract.mint(accounts[tokensIds.length -1], tokensIds[tokensIds.length-1], {from: account_one});
        });

        it('should not mint an already existent tokenId', async() => {
            await expectToRevert(contract.mint(accounts[8], tokensIds[3]), '');
        });

        it('should not mint to an invalid address 0x0', async() => {
            await expectToRevert(contract.mint(zeroAddress, 211), "Invalid to address");
        });

        it('should return total supply', async() => { 
            const totalSupply = await contract.totalSupply.call({from: accounts[9]});
            expect(Number(totalSupply)).to.equal(tokensIds.length);
        });

        it('should get token balance', async() => { 
            const acc3Balance = await contract.balanceOf(accounts[3]);
            expect(Number(acc3Balance)).to.equal(1);

            const acc9Balance = await contract.balanceOf(accounts[9]);     
            expect(Number(acc9Balance)).to.equal(2);
        });

        // token uri should be complete i.e: https://s3-us-west-2.amazonaws.com/udacity-blockchain/capstone/1
        it('should return token uri', async() => { 
           const token3Uri = await contract.tokenURI(tokensIds[3]); 
           expect(token3Uri).to.deep.equal(`${baseTokenURI}${tokensIds[3]}`);

           const token6Uri = await contract.tokenURI(tokensIds[6]); 
           expect(token6Uri).to.deep.equal(`${baseTokenURI}${tokensIds[6]}`);

           const token9Uri = await contract.tokenURI(tokensIds[9]); 
           expect(token9Uri).to.deep.equal(`${baseTokenURI}${tokensIds[9]}`);
        });

        it('should return the correct ownerOf for a token', async() => {
            expect(await contract.ownerOf(34)).to.equal(zeroAddress);
            expect(await contract.ownerOf(tokensIds[4])).to.equal(accounts[5]);
            expect(await contract.ownerOf(tokensIds[9])).to.equal(accounts[9]);
            expect(await contract.ownerOf(tokensIds[8])).to.equal(accounts[9]);
        });

        it('should allow the token owner to approve another user for its token', async() => {
            //accounts[8] approves accounts[9] for its token tokenIds[7]
            let tx = await contract.approve(accounts[9], tokensIds[7], {from: accounts[8]});
            truffleAssert.eventEmitted(tx, 'Approval', (ev) => {
                return expect(ev.owner).to.deep.equal(accounts[8]) 
                       && expect(ev.approved).to.equal(accounts[9])
                       && expect(Number(ev.tokenId)).to.equal(tokensIds[7]);
            });

            let newApproved = await contract.getApproved(tokensIds[7]);
            expect(newApproved).to.equal(accounts[9]);
        });

        it('should allow approved to transfer token from one owner to another and verify this', async() => { 
            //accounts[9] -approved for tokenIds[7] will transfer the token to itself
            let tx = await contract.transferFrom(accounts[8], accounts[9], tokensIds[7], {from: accounts[9]});
            truffleAssert.eventEmitted(tx, 'Transfer', (ev) => {
                return expect(ev.from).to.deep.equal(accounts[8]) 
                       && expect(ev.to).to.equal(accounts[9])
                       && expect(Number(ev.tokenId)).to.equal(tokensIds[7]);
            });

            expect(Number(await contract.balanceOf(accounts[8]))).to.equal(0);
            expect(Number(await contract.balanceOf(accounts[9]))).to.equal(3);
            expect(await contract.ownerOf(tokensIds[7])).to.equal(accounts[9]);
            expect(await contract.getApproved(tokensIds[7])).to.equal(zeroAddress);
        });

        it('should allow token owner to transfer token from one owner to another and verify this', async() => { 
            //accounts[9] will return the token tokensIds[7] back to accounts[8]
            let tx = await contract.transferFrom(accounts[9], accounts[8], tokensIds[7], {from: accounts[9]});
            truffleAssert.eventEmitted(tx, 'Transfer', (ev) => {
                return expect(ev.from).to.deep.equal(accounts[9]) 
                       && expect(ev.to).to.equal(accounts[8])
                       && expect(Number(ev.tokenId)).to.equal(tokensIds[7]);
            });

            expect(Number(await contract.balanceOf(accounts[8]))).to.equal(1);
            expect(await contract.ownerOf(tokensIds[7])).to.equal(accounts[8]);
            expect(Number(await contract.balanceOf(accounts[9]))).to.equal(2);
            expect(await contract.getApproved(tokensIds[7])).to.equal(zeroAddress);
        });

        it('should not allow to transfer to an invalid address 0x0', async() => {
            await expectToRevert(contract.transferFrom(accounts[8], zeroAddress, tokensIds[7], {from: accounts[8]}), "Invalid to address");
        });
    });

});

const expectToRevert = (promise, errorMessage) => {
    return truffleAssert.reverts(promise, errorMessage);
};