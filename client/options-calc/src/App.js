import './index.css';
import MainPage from './MainPage';

//Tradier option data


// Bid = Price buyers are trying to buy the contract, premium a seller would collect
// Ask = Price sellers are trying to sell the contract

/*
Include option for 
number of contracts
a live ticker search
a dropdown to select strategy


acess token tradier
IoOPt3pGDto6RAr8ok0cVyaslEOp

*/
const apiKyy = process.env.REACT_APP_TRADIER_ACCESS_TOKEN

function CoveredCall(stockPrice, premium) {
  var breakEven = stockPrice - premium
  console.log(breakEven)
  /*
  Need a stock price
  Need the premium received from selling the contract

  We have 100 shares of stock
  init investment 166.3 x 100 = 16,630

  Bid: 2.29
  Ask: 2.39

  Ex Boeing trading 166.3
      we want to sell the 167.5 stike call for 2.29
      Breakeven = 166.3 (stock) - 2.29 (premium we take in) = 164.01 (breakeven stock drops below here we begin to lose money )

  args needed: stock price and then the users selected contracts bid price (make them sign in with google for custom bids. ex they want to plug in a 2.31 bid instead of at market bid )
  */
  
}

function BuyingCall(strikePrice, premium) {
  /*
  Buying a call again we are paying a premium although we want it to go up this time
  ex Boeing

  Boeing currently trading at 165.09
  Boeing stock = 165.09
  We want to buy the 167.5 strike call option because we think its going to rise above that price
  we pay $1.73 for the call option

  So we have
  167.5 (strike) + 1.73 (premium paid) = 169.23 (breakeven, price we need stock to rise to to make money)
  
  */
 console.log(strikePrice + premium)
}

function BuyingPut(strikePrice, premium) {
  console.log('Put')
  /*
  Buying a put so we are paying a premium
  For ex Boeing Currently trading 165.09
  Boeing stock = 165.09

  We think that Boeing is going to go down in price so we want 
  to short it.
  I want to buy the Boeing 165 strike put because i thinks its going
  to drop below that price. I pay 2.61 for the put
  
  165 (strike price) - 2.61 (premium paid) = 162.39 (breakeven)
  Anything below 162.39 stock price is profit for us

  if it stays above that price we lose the premium we paid
  seller keeps our premium
  

  */

  console.log(strikePrice - premium)
}

function App() {
  return (
    <div className="App flex ">
      <MainPage/>
    </div>
  );
}

export default App;
