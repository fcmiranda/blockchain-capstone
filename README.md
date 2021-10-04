# Udacity Blockchain Capstone

The capstone will build upon the knowledge you have gained in the course in order to build a decentralized housing product. 

# Project Resources

* [Remix - Solidity IDE](https://remix.ethereum.org/)
* [Visual Studio Code](https://code.visualstudio.com/)
* [Truffle Framework](https://truffleframework.com/)
* [Ganache - One Click Blockchain](https://truffleframework.com/ganache)
* [Open Zeppelin ](https://openzeppelin.org/)
* [Interactive zero knowledge 3-colorability demonstration](http://web.mit.edu/~ezyang/Public/graph/svg.html)
* [Docker](https://docs.docker.com/install/)
* [ZoKrates](https://github.com/Zokrates/ZoKrates)


## Contract addresses on rinkeby test network and ABI
![](/img/contracts.PNG)

## Migration on rinkeby
![](/img/migration.PNG)

# ABI
 The ABI is on `eth-contracts/build/contracts` folder
 
## Etherscan / OpenSea 
- Minter : `https://testnets.opensea.io/assets/0xba62b9e00c0a294a97b94ec776c9500b6707955f/21`
- Buyer : `https://testnets.opensea.io/0x722416d16f8fbdb4e8c54bfc83e8208fc3d4b626`  
- Token contract : `https://rinkeby.etherscan.io/token/0xba62b9e00c0a294a97b94ec776c9500b6707955f`

## Getting Started
### Download the following tools:

* [NodeJS](https://nodejs.org/en/download/current/) (The install will also include the npm node package manager)
* [Docker](https://www.docker.com/) Enterprise Container Platform for High-Velocity Innovation
* [ganache-cli](https://github.com/trufflesuite/ganache-cli) Fast Ethereum RPC client for testing and development
* MetaMask extension installed in your browser and few ethers on Rinkeby Test Network.
* [truffle](https://www.npmjs.com/package/truffle) Development environment, testing framework and asset pipeline for Ethereum

#####check node and npm versions
```
node -v
npm -v
```

#####install ganache globally
```
npm i ganache-cli -g
```
#####install truffle globally
```
npm i truffle -g
```

## Running the tests
#####Start a local ganache-cli instance
```
ganache-cli
```
#####In another  window, compile the contracts: They will be generated in folder ```build\contracts```.

#####Run the test command
```
cd eth-contracts
truffle develop
compile
test
```

## Generating the proof from zokrates (on windows 10)
####Navigate to project folder
` cd zokrates\code\`

####Run the zokrates docker image
`docker run -v $(pwd):/home/zokrates/code -ti zokrates/zokrates:0.3.0 /bin/bash`

####Compile the program 
```
cd code
~/zokrates compile -i square/square.code
```

####Generate the trusted setup
`~/zokrates setup`

####Compute witness for your desired pair of number
`~/zokrates compute-witness -a number square`

####Generate proof
`~/zokrates generate-proof` 

####(Optional) Generate verifier.sol
`~/zokrates export-verifier	`