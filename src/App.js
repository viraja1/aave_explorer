import React from 'react';
import {Navbar, ListGroup} from 'react-bootstrap';
import {ApolloClient, InMemoryCache, gql} from '@apollo/client';


const APIURL = "https://api.thegraph.com/subgraphs/name/aave/protocol-v2";
const GovernanceAPIURL = "https://api.thegraph.com/subgraphs/name/aave/governance-v2";

const reserveDataQuery = `
{
  reserves (
    orderBy: totalLiquidity
    orderDirection: desc 
  ) {
    id
    name
    decimals
    symbol
    liquidityRate
    variableBorrowRate
    stableBorrowRate
    totalDeposits
    totalLiquidity
    averageStableRate
    utilizationRate
    price {
      priceInEth
       oracle {
          usdPriceEth
       }
    }
  }
}
`;

const dataQuery = `
{
  deposits (
    orderBy: timestamp
    orderDirection: desc
  ) {
    id
    amount
    timestamp
    reserve { 
      id 
      name 
      symbol 
      decimals
    } 
  }
  
  borrows (
    orderBy: timestamp
    orderDirection: desc
  ) {
    id
    amount
    timestamp
    reserve { 
      id 
      name 
      symbol 
      decimals
    } 
  }
  
  flashLoans( 
    orderBy: timestamp 
    orderDirection: desc 
  ) { 
    id 
    reserve { 
      id 
      name 
      symbol 
      decimals
    } 
    amount 
    totalFee 
    timestamp 
  }
  
  liquidationCalls( 
    orderBy: timestamp 
    orderDirection: desc 
  ) {
    id
    timestamp
    collateralReserve { 
      id 
      name 
      symbol 
      decimals
    }
    principalReserve { 
      id 
      name 
      symbol 
      decimals
    } 
    collateralAmount
    principalAmount
  }
  
  swaps( 
    orderBy: timestamp 
    orderDirection: desc 
  ) { 
    id 
    reserve { 
      id 
      name 
      symbol 
      decimals
    } 
    borrowRateModeFrom
    borrowRateModeTo
    stableBorrowRate
    variableBorrowRate
    timestamp 
  }
  
  redeemUnderlyings (
    orderBy: timestamp
    orderDirection: desc
  ) {
    id
    amount
    timestamp
    reserve { 
      id 
      name 
      symbol 
      decimals
    } 
  } 
  
  repays (
    orderBy: timestamp
    orderDirection: desc
  ) {
    id
    amount
    timestamp
    reserve { 
      id 
      name 
      symbol 
      decimals
    } 
  }
  
  usageAsCollaterals (
    orderBy: timestamp
    orderDirection: desc
  ) {
    id
    timestamp
    reserve { 
      id 
      name 
      symbol 
      decimals
    }
    fromState
    toState 
  }
  
  users(
   orderBy: lifetimeRewards
   orderDirection: desc
  ){
    id
    lifetimeRewards
  }
  
  swapHistories{
    id
    fromAsset
    toAsset
    fromAmount
    receivedAmount
    swapType
  }
    
}
`;

const governanceQuery = `
{
  proposals(
    orderBy: createdTimestamp
    orderDirection: desc) {
    id
    state
    ipfsHash
    creator
    totalCurrentVoters
    startBlock
    endBlock
    currentYesVote
    currentNoVote
    createdTimestamp
    title
    shortDescription
    author
    aipNumber
  }
}
`;


let decimalScientificNotation = {
    1: 1e2,
    2: 1e2,
    3: 1e3,
    4: 1e4,
    5: 1e5,
    6: 1e6,
    7: 1e7,
    8: 1e8,
    9: 1e9,
    10: 1e10,
    11: 1e11,
    12: 1e12,
    13: 1e13,
    14: 1e14,
    15: 1e15,
    16: 1e16,
    17: 1e17,
    18: 1e18
};


const client = new ApolloClient({
    uri: APIURL,
    cache: new InMemoryCache()
});

const governanceClient = new ApolloClient({
    uri: GovernanceAPIURL,
    cache: new InMemoryCache()
});


let getHumanReadableDate = function (epoch) {
    let date = new Date(0);
    date.setUTCSeconds(epoch);
    let readableString = date.toUTCString();
    if (readableString === "Invalid Date") {
        return ''
    }
    return readableString;
};

class App extends React.Component {
    state = {
        totalMarketSize: 0,
        flashLoans: [],
        reserves: [],
        deposits: [],
        borrows: [],
        liquidations: [],
        swaps: [],
        redeemUnderlyings: [],
        repays: [],
        usageAsCollaterals: [],
        proposals: [],
        users: [],
        swapHistories: []
    };

    render() {
        return (
            <div>
                <Navbar className="navbar-custom" variant="dark">
                    <div style={{width: "90%"}}>
                        <Navbar.Brand href="/">
                            <b>Aave V2 Explorer</b>
                        </Navbar.Brand>
                    </div>
                </Navbar>
                <div className="panel-landing  h-100 d-flex" id="section-1">
                    <br/>
                    {this.state.reserves.length === 0 &&
                    <h4>Fetching data ....</h4>
                    }
                    {this.state.reserves.length > 0 &&
                    <h4><b>Market Size:</b> <strong style={{
                        backgroundImage: "linear-gradient(255deg,#b6509e 25%,#2ebac6)",
                        WebkitTextFillColor: "transparent",
                        WebkitBackgroundClip: "text"
                    }}>${this.state.totalMarketSize}B</strong></h4>
                    }
                    <div className="container row" style={{marginTop: "50px"}}>
                        <div className="col l8 m12">
                            {this.state.reserves.length > 0 &&
                            <div style={{height: "300px", marginBottom: "20px"}} className="transaction-list">
                                <h5><b>Reserves</b></h5>
                                <ListGroup style={{height: "100%", overflow: "scroll", marginTop: "10px"}}>
                                    {this.state.reserves.map((reserve, i, reserves) => (
                                        <ListGroup.Item key={"card-key-" + String(i)} style={{wordWrap: "break-word"}}>
                                            <b>Asset Name</b>: {reserve.symbol}
                                            <br/>
                                            <b>Liquidity Rate</b>: {(reserve.liquidityRate / 1e25).toFixed(6)} %
                                            <br/>
                                            <b>Variable Borrow Rate</b>: {(reserve.variableBorrowRate / 1e25).toFixed(6)} %
                                            <br/>
                                            <b>Stable Borrow Rate</b>: {(reserve.stableBorrowRate / 1e25).toFixed(6)} %
                                            <br/>
                                            <b>Total Liquidity (Native)</b>: {(reserve.totalLiquidity / decimalScientificNotation[reserve.decimals] / 1e6).toFixed(6)}M
                                            <br/>
                                            <b>Total Liquidity (USD)</b>: ${((reserve.totalLiquidity / decimalScientificNotation[reserve.decimals] / 1e6) * reserve.price.priceInEth * (1 / reserve.price.oracle.usdPriceEth)).toFixed(6)}M
                                            <br/>
                                            <b>Utilization Rate</b>: {reserve.utilizationRate * 100} %
                                        </ListGroup.Item>
                                    ))}
                                </ListGroup>
                            </div>
                            }
                        </div>
                    </div>
                    <div className="container row" style={{marginTop: "50px"}}>
                        <div className="col l8 m12">
                            {this.state.flashLoans.length > 0 &&
                            <div style={{height: "300px", marginBottom: "10px"}} className="transaction-list">
                                <h5><b>Recent Flash Loans</b></h5>
                                <ListGroup style={{height: "100%", overflow: "scroll", marginTop: "10px"}}>
                                    {this.state.flashLoans.map((transaction, i, flashLoans) => (
                                        <ListGroup.Item key={"card-key-" + String(i)} style={{wordWrap: "break-word"}}>
                                            <b>Timestamp</b>: {getHumanReadableDate(transaction.timestamp)}
                                            <br/>
                                            <b>Amount</b>: {(transaction.amount / (decimalScientificNotation[transaction.reserve.decimals])).toFixed(6)} {transaction.reserve.symbol}
                                            <br/>
                                            <b>Total Fee</b>: {(transaction.totalFee / (decimalScientificNotation[transaction.reserve.decimals])).toFixed(6)} {transaction.reserve.symbol}
                                            <br/>
                                            <b>Transaction Hash</b>: <a href={"https://etherscan.io/tx/" + transaction.id.split(':')[0]} target="_blank">{transaction.id.split(':')[0]}</a>
                                        </ListGroup.Item>
                                    ))}
                                </ListGroup>
                            </div>
                            }
                        </div>
                    </div>
                    <div className="container row" style={{marginTop: "50px"}}>
                        <div className="col l8 m12">
                            {this.state.deposits.length > 0 &&
                            <div style={{height: "300px", marginBottom: "10px"}} className="transaction-list">
                                <h5><b>Recent Deposits</b></h5>
                                <ListGroup style={{height: "100%", overflow: "scroll", marginTop: "10px"}}>
                                    {this.state.deposits.map((transaction, i, deposits) => (
                                        <ListGroup.Item key={"card-key-" + String(i)} style={{wordWrap: "break-word"}}>
                                            <b>Timestamp</b>: {getHumanReadableDate(transaction.timestamp)}
                                            <br/>
                                            <b>Amount</b>: {(transaction.amount / (decimalScientificNotation[transaction.reserve.decimals])).toFixed(6)} {transaction.reserve.symbol}
                                            <br/>
                                            <b>Transaction Hash</b>: <a href={"https://etherscan.io/tx/" + transaction.id.split(':')[0]} target="_blank">{transaction.id.split(':')[0]}</a>
                                        </ListGroup.Item>
                                    ))}
                                </ListGroup>
                            </div>
                            }
                        </div>
                    </div>
                    <div className="container row" style={{marginTop: "50px"}}>
                        <div className="col l8 m12">
                            {this.state.borrows.length > 0 &&
                            <div style={{height: "300px", marginBottom: "10px"}} className="transaction-list">
                                <h5><b>Recent Borrow</b></h5>
                                <ListGroup style={{height: "100%", overflow: "scroll", marginTop: "10px"}}>
                                    {this.state.borrows.map((transaction, i, borrows) => (
                                        <ListGroup.Item key={"card-key-" + String(i)} style={{wordWrap: "break-word"}}>
                                            <b>Timestamp</b>: {getHumanReadableDate(transaction.timestamp)}
                                            <br/>
                                            <b>Amount</b>: {(transaction.amount / (decimalScientificNotation[transaction.reserve.decimals])).toFixed(6)} {transaction.reserve.symbol}
                                            <br/>
                                            <b>Transaction Hash</b>: <a href={"https://etherscan.io/tx/" + transaction.id.split(':')[0]} target="_blank">{transaction.id.split(':')[0]}</a>
                                        </ListGroup.Item>
                                    ))}
                                </ListGroup>
                            </div>
                            }
                        </div>
                    </div>
                    <div className="container row" style={{marginTop: "50px"}}>
                        <div className="col l8 m12">
                            {this.state.liquidations.length > 0 &&
                            <div style={{height: "300px", marginBottom: "10px"}} className="transaction-list">
                                <h5><b>Recent Liquidations</b></h5>
                                <ListGroup style={{height: "100%", overflow: "scroll", marginTop: "10px"}}>
                                    {this.state.liquidations.map((transaction, i, liquidations) => (
                                        <ListGroup.Item key={"card-key-" + String(i)} style={{wordWrap: "break-word"}}>
                                            <b>Timestamp</b>: {getHumanReadableDate(transaction.timestamp)}
                                            <br/>
                                            <b>Principal Amount</b>: {(transaction.principalAmount / (decimalScientificNotation[transaction.principalReserve.decimals])).toFixed(6)} {transaction.principalReserve.symbol}
                                            <br/>
                                            <b>Collateral Amount</b>: {(transaction.collateralAmount / (decimalScientificNotation[transaction.collateralReserve.decimals])).toFixed(6)} {transaction.collateralReserve.symbol}
                                            <br/>
                                            <b>Transaction Hash</b>: <a href={"https://etherscan.io/tx/" + transaction.id.split(':')[0]} target="_blank">{transaction.id.split(':')[0]}</a>
                                        </ListGroup.Item>
                                    ))}
                                </ListGroup>
                            </div>
                            }
                        </div>
                    </div>
                    <div className="container row" style={{marginTop: "50px"}}>
                        <div className="col l8 m12">
                            {this.state.swaps.length > 0 &&
                            <div style={{height: "300px", marginBottom: "10px"}} className="transaction-list">
                                <h5><b>Recent Rate Swap</b></h5>
                                <ListGroup style={{height: "100%", overflow: "scroll", marginTop: "10px"}}>
                                    {this.state.swaps.map((transaction, i, swaps) => (
                                        <ListGroup.Item key={"card-key-" + String(i)} style={{wordWrap: "break-word"}}>
                                            <b>Timestamp</b>: {getHumanReadableDate(transaction.timestamp)}
                                            <br/>
                                            <b>Asset</b>: {transaction.reserve.symbol}
                                            <br/>
                                            <b>borrowRateModeFrom</b>: {transaction.borrowRateModeFrom}
                                            <br/>
                                            <b>borrowRateModeTo</b>: {transaction.borrowRateModeTo}
                                            <br/>
                                            <b>Variable Borrow Rate</b>: {(transaction.variableBorrowRate / 1e25).toFixed(6)} %
                                            <br/>
                                            <b>Stable Borrow Rate</b>: {(transaction.stableBorrowRate / 1e25).toFixed(6)} %
                                            <br/>
                                            <b>Transaction Hash</b>: <a href={"https://etherscan.io/tx/" + transaction.id.split(':')[0]} target="_blank">{transaction.id.split(':')[0]}</a>
                                        </ListGroup.Item>
                                    ))}
                                </ListGroup>
                            </div>
                            }
                        </div>
                    </div>
                    <div className="container row" style={{marginTop: "50px"}}>
                        <div className="col l8 m12">
                            {this.state.redeemUnderlyings.length > 0 &&
                            <div style={{height: "300px", marginBottom: "10px"}} className="transaction-list">
                                <h5><b>Recent Redeem</b></h5>
                                <ListGroup style={{height: "100%", overflow: "scroll", marginTop: "10px"}}>
                                    {this.state.redeemUnderlyings.map((transaction, i, redeemUnderlyings) => (
                                        <ListGroup.Item key={"card-key-" + String(i)} style={{wordWrap: "break-word"}}>
                                            <b>Timestamp</b>: {getHumanReadableDate(transaction.timestamp)}
                                            <br/>
                                            <b>Amount</b>: {(transaction.amount / (decimalScientificNotation[transaction.reserve.decimals])).toFixed(6)} {transaction.reserve.symbol}
                                            <br/>
                                            <b>Transaction Hash</b>: <a href={"https://etherscan.io/tx/" + transaction.id.split(':')[0]} target="_blank">{transaction.id.split(':')[0]}</a>
                                        </ListGroup.Item>
                                    ))}
                                </ListGroup>
                            </div>
                            }
                        </div>
                    </div>
                    <div className="container row" style={{marginTop: "50px"}}>
                        <div className="col l8 m12">
                            {this.state.repays.length > 0 &&
                            <div style={{height: "300px", marginBottom: "10px"}} className="transaction-list">
                                <h5><b>Recent Repay</b></h5>
                                <ListGroup style={{height: "100%", overflow: "scroll", marginTop: "10px"}}>
                                    {this.state.repays.map((transaction, i, repays) => (
                                        <ListGroup.Item key={"card-key-" + String(i)} style={{wordWrap: "break-word"}}>
                                            <b>Timestamp</b>: {getHumanReadableDate(transaction.timestamp)}
                                            <br/>
                                            <b>Amount</b>: {(transaction.amount / (decimalScientificNotation[transaction.reserve.decimals])).toFixed(6)} {transaction.reserve.symbol}
                                            <br/>
                                            <b>Transaction Hash</b>: <a href={"https://etherscan.io/tx/" + transaction.id.split(':')[0]} target="_blank">{transaction.id.split(':')[0]}</a>
                                        </ListGroup.Item>
                                    ))}
                                </ListGroup>
                            </div>
                            }
                        </div>
                    </div>
                    <div className="container row" style={{marginTop: "50px"}}>
                        <div className="col l8 m12">
                            {this.state.usageAsCollaterals.length > 0 &&
                            <div style={{height: "300px", marginBottom: "10px"}} className="transaction-list">
                                <h5><b>Recent Collateral Status Change</b></h5>
                                <ListGroup style={{height: "100%", overflow: "scroll", marginTop: "10px"}}>
                                    {this.state.usageAsCollaterals.map((transaction, i, usageAsCollaterals) => (
                                        <ListGroup.Item key={"card-key-" + String(i)} style={{wordWrap: "break-word"}}>
                                            <b>Timestamp</b>: {getHumanReadableDate(transaction.timestamp)}
                                            <br/>
                                            <b>Asset</b>: {transaction.reserve.symbol}
                                            <br/>
                                            <b>From State</b>: {transaction.fromState.toString()}
                                            <br/>
                                            <b>To State</b>: {transaction.toState.toString()}
                                            <br/>
                                            <b>Transaction Hash</b>: <a href={"https://etherscan.io/tx/" + transaction.id.split(':')[0]} target="_blank">{transaction.id.split(':')[0]}</a>
                                        </ListGroup.Item>
                                    ))}
                                </ListGroup>
                            </div>
                            }
                        </div>
                    </div>
                    <div className="container row" style={{marginTop: "50px"}}>
                        <div className="col l8 m12">
                            {this.state.swapHistories.length > 0 &&
                            <div style={{height: "300px", marginBottom: "10px"}} className="transaction-list">
                                <h5><b>Recent Swap History</b></h5>
                                <ListGroup style={{height: "100%", overflow: "scroll", marginTop: "10px"}}>
                                    {this.state.swapHistories.map((transaction, i, swapHistories) => (
                                        <ListGroup.Item key={"card-key-" + String(i)} style={{wordWrap: "break-word"}}>
                                            <b>swapType</b>: {transaction.swapType}
                                            <br/>
                                            <b>Transaction Hash</b>: <a href={"https://etherscan.io/tx/" + transaction.id.split(':')[0]} target="_blank">{transaction.id.split(':')[0]}</a>
                                        </ListGroup.Item>
                                    ))}
                                </ListGroup>
                            </div>
                            }
                        </div>
                    </div>
                    <div className="container row" style={{marginTop: "50px"}}>
                        <div className="col l8 m12">
                            {this.state.proposals.length > 0 &&
                            <div style={{height: "300px", marginBottom: "10px"}} className="transaction-list">
                                <h5><b>Goverance Proposals</b></h5>
                                <ListGroup style={{height: "100%", overflow: "scroll", marginTop: "10px"}}>
                                    {this.state.proposals.map((transaction, i, proposals) => (
                                        <ListGroup.Item key={"card-key-" + String(i)} style={{wordWrap: "break-word"}}>
                                            <b>Timestamp</b>: {getHumanReadableDate(transaction.createdTimestamp)}
                                            <br/>
                                            <b>AIP</b>: {transaction.aipNumber}
                                            <br/>
                                            <b>Title</b>: <a href={"https://ipfs.io/ipfs/" + transaction.ipfsHash} target="_blank">{transaction.title}</a>
                                            <br/>
                                            <b>Short Description</b>: {transaction.shortDescription}
                                            <br/>
                                            <b>Author</b>: {transaction.author} ({transaction.creator})
                                            <br/>
                                            <b>State</b>: {transaction.state} ({transaction.totalCurrentVoters} voters)
                                            <br/>
                                            <b>Start Block</b>: {transaction.startBlock}
                                            <br/>
                                            <b>End Block</b>: {transaction.endBlock}
                                            <br/>
                                            <b>Yes votes</b>: {transaction.currentYesVote / 1e18}
                                            <br/>
                                            <b>No votes</b>: {transaction.currentNoVote / 1e18}
                                        </ListGroup.Item>
                                    ))}
                                </ListGroup>
                            </div>
                            }
                        </div>
                    </div>
                    <div className="container row" style={{marginTop: "50px", marginBottom: "150px"}}>
                        <div className="col l8 m12">
                            {this.state.users.length > 0 &&
                            <div style={{height: "300px", marginBottom: "10px"}} className="transaction-list">
                                <h5><b>Most Rewarded Users</b></h5>
                                <ListGroup style={{height: "100%", overflow: "scroll", marginTop: "10px"}}>
                                    {this.state.users.map((transaction, i, users) => (
                                        <ListGroup.Item key={"card-key-" + String(i)} style={{wordWrap: "break-word"}}>
                                            <b>Lifetime Rewards</b>: {(transaction.lifetimeRewards / 1e18).toFixed(6)} AAVE
                                            <br/>
                                            <b>Address</b>: <a href={"https://etherscan.io/address/" + transaction.id} target="_blank">{transaction.id}</a>
                                        </ListGroup.Item>
                                    ))}
                                </ListGroup>
                            </div>
                            }
                        </div>
                    </div>

                </div>
            </div>
        )

    }

    async componentWillMount() {

        client.query({
            query: gql(reserveDataQuery)
        })
            .then(data => {
                console.log("Reserve Subgraph data: ", data);
                let reserves = data.data.reserves;
                reserves = reserves.slice().sort((a, b) => (((a.totalLiquidity / decimalScientificNotation[a.decimals] / 1e6) * a.price.priceInEth) > ((b.totalLiquidity / decimalScientificNotation[b.decimals] / 1e6) * b.price.priceInEth)) ? -1 : 1);
                let totalMarketSize = 0;
                for (let i = 0; i < reserves.length; i++) {
                    let reserve = reserves[i];
                    totalMarketSize += ((reserve.totalLiquidity / decimalScientificNotation[reserve.decimals] / 1e9) * reserve.price.priceInEth * (1 / reserve.price.oracle.usdPriceEth));
                }
                console.log(totalMarketSize);
                this.setState({reserves: reserves, totalMarketSize: totalMarketSize});
            })
            .catch(err => {
                console.log("Error fetching reserve data: ", err)
            });

        client.query({
            query: gql(dataQuery)
        })
            .then(data => {
                console.log("Other Subgraph data: ", data);
                this.setState({
                    flashLoans: data.data.flashLoans, deposits: data.data.deposits,
                    borrows: data.data.borrows, liquidations: data.data.liquidationCalls, swaps: data.data.swaps,
                    redeemUnderlyings: data.data.redeemUnderlyings, repays: data.data.repays,
                    usageAsCollaterals: data.data.usageAsCollaterals, users: data.data.users,
                    swapHistories: data.data.swapHistories,
                })
            })
            .catch(err => {
                console.log("Error fetching other data: ", err)
            });

        governanceClient.query({
            query: gql(governanceQuery)
        })
            .then(data => {
                console.log("Governance Subgraph data: ", data);
                this.setState({proposals: data.data.proposals});
            })
            .catch(err => {
                console.log("Error fetching governance data: ", err)
            });

    }
}

export default App
