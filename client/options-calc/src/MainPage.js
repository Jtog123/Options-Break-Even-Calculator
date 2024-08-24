import React, { useState, useEffect } from 'react';
import axios from 'axios'
import GoogleSignInButton from './GoogleSignInButton';



/*
On a search get Symbol data and option chain data
If ticker doesnt exist note couldnt find ticker

On click, send get request to tradier for the ticker symbol and the option chain
do i need to use axios to make this request



disabled if selectedStrategy === ""

*/

function MainPage() {
    const [selectedStrategy, setSelectedStrategy] = useState("");

    const [expirations, setExpirations] = useState([]);
    const [selectedExpiration, setSelectedExpiration] = useState("");
    const [selectedContracts, setSelectedContracts] = useState([]);

    const [numContracts, setNumContracts] = useState(1);

    const[optionsData, setOptionsData] = useState([]);
    const[premium, setPremium] = useState(0);
    

    const [tickerInput, setTickerInput] = useState("");
    const [ticker, setTicker] = useState("");
    const [company, setCompany] = useState("");
    const [currentPrice, setCurrentPrice] = useState("-");
    const [bidPrice, setBidPrice] = useState("-");
    const [askPrice, setAskPrice] = useState("-");

    const [breakevenPrice, setBreakevenPrice] = useState(0);

    const [bidInputValue, setBidInputValue] = useState('');
    const [customBid, setCustomBid] = useState(0);

    const[isSelling, setIsSelling] = useState(false);
    const[isBuying, setIsBuying] = useState(false);


    const [AskInputValue, setAskInputValue] = useState('');
    const [customAsk, setCustomAsk] = useState(0);

    const [loggedIn, setLoggedIn] = useState(false);

    useEffect(() => {
        console.log('optionsData updated:', optionsData);
    }, [optionsData]);

    useEffect(() => {
        console.log('selected Contract:', selectedContracts);
    }, [selectedContracts]);

    useEffect(() => {
        console.log('breakeven is:', breakevenPrice);
    }, [breakevenPrice]);

    useEffect(() => {
        console.log('loggedIn:', loggedIn);
        console.log('isSelling:', isSelling);
        console.log('isBuying:', isBuying);
      }, [loggedIn, isSelling, isBuying]);

    useEffect(() => {
        const checkLoginStatus = async () => {
            try {
                const response = await axios.get('http://localhost:5000/auth/status', {withCredentials: true})
                if(response.data.loggedIn) {
                    setLoggedIn(true);
                } else {
                    setLoggedIn(false);
                }
            } catch(err) {
                console.error('Error checking login status: ', err);
                setLoggedIn(false);
            }

        }
        checkLoginStatus();
    }, [setLoggedIn])

    const handleBackendRedirect = () => {
        window.location.href = 'http://localhost:5000/auth/google';    
    }

    const handleCustomAsk = (e) => {
        const value = e.target.value;

        if(/^\d*\.?\d*$/.test(value)) {
            setAskInputValue(value);
            
            const customAskValue = parseFloat(value);

            if(!isNaN(customAskValue)) {
                setCustomAsk(customAskValue);

                if(optionsData.length > 0) {
                    const selectedOption = optionsData.find(option => option.strike === selectedContracts[0]);
                    if (selectedOption) {
                        const breakEven = selectedOption.strike + customAskValue;
                        setBreakevenPrice(breakEven);
                    }
                }
            }

        }

    }

    //breakeven = premium paid  + strike
    const handleCustomBid = (e) => {
        const value = e.target.value;

        if(/^\d*\.?\d*$/.test(value)) {
            setBidInputValue(value);

            const customBidValue = parseFloat(value);

            if(optionsData.length > 0) { 
                const selectedOption = optionsData.find(option => option.strike === selectedContracts[0]);
                if(selectedOption) {
                    const breakEven = selectedOption.strike + customBidValue;
                    setBreakevenPrice(breakEven);
                    setPremium(customBidValue);
                }

            }

        }
    }



    /*
            let value = parseInt(e.target.value, 10);
        if(isNaN(value)) {
            value = 1;
        } else if(value < 1) {
            value = 1;
        } else if (value > 999) {
            value = 999
        }
        setNumContracts(value);
    */

    //Next sell Covered calls and buy protective puts
    const strategies = {
        "Buy Call(s)": 1,
        "Buy Put(s)": 1,
        "Sell Call(s)": 1,
        "Sell Put(s)": 1,
    };

    /*
    Selling the call the premium you take in is the bid
    Bid: 4.65 premium: $465
    Need to the stock 
    strike $265 + $4.65 premium = breakeven 
    anything aboev that i get losses on
    anything below it i get to keep the premium
    */



    const handleStrategyChange = (e) => {
        setSelectedStrategy(e.target.value);
        setSelectedContracts([]);
    };

    const handleCheckboxChange = (contractId) => {
        setSelectedContracts((prevSelectedContracts) => {

            const isSelected = prevSelectedContracts.includes(contractId);

            const maxSelections = strategies[selectedStrategy];

            let updatedContracts;
            

            if(isSelected) {
                updatedContracts =  prevSelectedContracts.filter(id => id !== contractId);
            } else if(prevSelectedContracts.length < maxSelections) {
                updatedContracts = [...prevSelectedContracts, contractId]
            } else {
                updatedContracts = prevSelectedContracts;
            }

            if(updatedContracts.length === 0) {
                setBreakevenPrice(0);
                setPremium(0);
                setIsSelling(false);
                setIsBuying(false);
                setBidInputValue('');
                setAskInputValue('');
            }

            return updatedContracts;

        });


    };

    /*
    when nothing checkmarked breakeven and premium should go to zero
    */

    //Every time we change the checkbox calculate a new breakeven
    useEffect(() => {
        if(selectedContracts.length > 0) {
            calculateBreakeven();
        }

    }, [selectedContracts])

    

    const calculateBreakeven = () => {
        //console.log('strike is ', strikePrice);
        //console.log('options data issss', optionsData);

        //contractId is also the strike price
        // iterate through the optionData find the contract whose strike price matches the selected contracts strike price

        /*
        ok so issues unresolved:
            how do we select contracts for more complicated strats?
            conditionally enable/ disable components based on the strategy
            if selling note a premium recieved
            if logged in allow users to: make custom bids and asks, then calc for them
            Stylize the app
        */


        let selling = false;
        let buying = false;
        selectedContracts.forEach((contractId) => {
            const option = optionsData.find(option => option.strike === contractId);
            let breakEven;
            if(option && selectedStrategy === 'Buy Call(s)') {
                console.log('Buying dem calls at strkke ', option);
                // calculate breakeven use the options ask
                // users can set custom asks
                //strike + premium paid , ask is premium
                breakEven = contractId + option.call.ask;
                buying = true;
                selling = false;

            } else if(option && selectedStrategy === 'Buy Put(s)') {
                breakEven = contractId - option.put.ask;
                buying = true;
                selling = false;
            } else if(option && selectedStrategy === 'Sell Call(s)') {
                setPremium(option.call.bid);
                selling = true;
                buying = false;
                breakEven = contractId + option.call.bid; 
            } else if(option && selectedStrategy === 'Sell Put(s)') {
                setPremium(option.put.bid);
                selling = true;
                buying = false;
                breakEven = contractId - option.put.bid;
            }

            setBreakevenPrice(breakEven)
        });
        setIsSelling(selling);
        setIsBuying(buying);
        

    }

    // split these organizeOptionChainResponse(optionChain);

    const handleExpirationChange = async (e) => {
        //once we set the expiration we send a request over with the ticker and the expiration and retreieve the option chain

        const newExpiration = e.target.value;
        setSelectedExpiration(newExpiration);
        setBreakevenPrice(0);
        

        try{
            const response = await axios.post('http://localhost:5000/expirations', {
                tickerInput: ticker,
                expirationTime: newExpiration,
                
            },
            {withCredentials:true} 
        );
        organizeOptionChainResponse(response.data.options);

        
        /*
        //split here send over response.data.options.
        */

        } catch(err) {
            console.error('Error fetching option chain data', err);
        }

        
    }

    /*
    This function decomposes the option chain response into its usable parts, it uses reduce which does ..., and then sets the option data and prepares it for rendering on the front end
    */
    function organizeOptionChainResponse(optionChain) {

        const organizedOptions = optionChain.reduce((acc, option) => {
            //unpack values
            const {strike, type, bid, ask, delta, iv} = option;

            //not sure
            if (!acc[strike]) {
                acc[strike] = {strike, call:{}, put:{}};
            }

            if(type === 'call') {
                acc[strike].call = {bid, ask, delta, iv};
            } else if (type === 'put') {
                acc[strike].put = {bid, ask, delta, iv};
            }

            return acc;
        }, {});

        setOptionsData(Object.values(organizedOptions));
        //setOptionsData(response.data);  
        console.log('option data contains', optionsData);    
        //console.log("Option chain data:", response.data);
    }


    const handleIncrementClick = () => {
        
        setNumContracts((prevNumContracts) => {
            if(prevNumContracts >= 999) {
                return 999;
            }
            return prevNumContracts + 1;
        })
    }

    const handleDecrementClick = () => {
        setNumContracts((prevNumContracts) => {
            if(prevNumContracts <= 1) {
                return 1;
            }
            return prevNumContracts - 1;
        })
    }

    const handleInputChange = (e) => {
        let value = parseInt(e.target.value, 10);
        if(isNaN(value)) {
            value = 1;
        } else if(value < 1) {
            value = 1;
        } else if (value > 999) {
            value = 999
        }
        setNumContracts(value);
    }

    /*
    To do:
    ok so if ticker change option screen should clear
    also now that we have our respective data from the options chain
    we can begin to calculate the breakeven prices
    from at least Buy Calls and Buy Puts
    Before we can select a checkbox we must select a strategy (selectedStrat)
    show an alert if the user has not selected strat
    if selectedStrat != null you can check a box

    if the selected strat is buy calls
    use call info
    if its buy puts use put info 
    How do we now select only the call info 
    will this work for more complicated strategies?
    dont know
    two selects one for select call
    one for select put?

    have it build a graph as user uses it???? after MVP
    */
    const truncateToTwoWords = (text) => {
        const words = text.split(' ');
        return words.slice(0, 2).join(' ');
    };
    
    

    const handleSearchClick = async (e) => {
        e.preventDefault();
        console.log("Searching");
        setExpirations([]);
        setOptionsData([]);
        setSelectedExpiration("");
        setSelectedStrategy("");
        setBreakevenPrice(0);
        try {
            const res = await axios.post('http://localhost:5000/input', {tickerSymbol: tickerInput}, {withCredentials: true})
            console.log("myres is: ", res.data);
            if(res.data) { 
                setTicker(res.data['ticker']);
                setCompany(res.data['companyName']);
                setCurrentPrice(res.data['currentPrice']);
                //const expirationsData = Array(Object.values(res.data['expirations']))
                setExpirations(Object.values(res.data['expirations']));
                //console.log(expirations)
                
                setBidPrice(res.data['bidPrice']);
                setAskPrice(res.data['askPrice']);


            } else {
                console.log("No Valid ticker received")
            }
        } catch (err) {
            console.error('Error fetching data')
        }
        
        
        //only after we get a response with the ticker should we set
        // the ticker symbol and load the option chain, dont set it as user is tpying

        /*
        try {
            const data = await fetchData();
            console.log(data);
        } catch(err) {
            console.error('Error fetching data', err)
        }



        on a medium to medium / large scren put the search bar next the stock data

        */

    };

    /*

                    <div className="custom-bid-ask flex mr-2  text-black">
                        <span className='mr-2 '>Bid</span>
                        <input
                            className='ask bg-gray-400 w-16 h-6 mr-2'
                            disabled={!(loggedIn && isSelling)}
                            onChange={handleCustomBid}
                            value={bidInputValue}
                            
                              
                        />
                        <span className='mr-2 '>Ask</span>
                        <input
                            className='ask bg-gray-400 w-16 h-6 mr-4'
                            disabled={!(loggedIn && isBuying)}
                            onChange={handleCustomAsk}
                            value={AskInputValue}    
                        />
                    </div>




                                    <div className="num-contracts-box flex mb-4 text-black  ">
                    <h2 className='w-1/2 text-2xl  md:w-3/5 ml-4 mr-4' >{` $ ${premium * numContracts} per contract(s)`}</h2>
                    <div className="number-box flex ml-5 md:ml-8">
                            <button 
                                className='text-xl bg-gray-200 w-8 h-8 text-center rounded-md cursor-pointer'
                                onClick={handleDecrementClick}
                                disabled={isSelling === false}
                            >
                                -
                            </button>
                            <input 
                                className='bg-white text-black text-xl w-12 ml-1 mr-1  text-center rounded-md'
                                value={numContracts}
                                type='text'
                                onChange={handleInputChange}
                                
                            />
                            <button 
                                className='text-xl bg-gray-200 w-8 h-8 text-center rounded-md cursor-pointer'
                                onClick={handleIncrementClick}
                                disabled={isSelling === false}
                            >
                                    +
                            </button>
                    </div>
                </div>
    
    */

    return (
        <div className="outer-container min-h-screen  flex justify-center items-center w-full">
            <div className=" h-full  w-5/6 border-2 border-gray-300 rounded-md ">
            
                <div className="container-wraper flex flex-col lg:flex-row w-full">
                    <div className="search-container relative w-full flex justify-center items-center flex-col ">
                            <div className="relative z-10 w-full lg:ml-4  ">
                                <span className="absolute inset-y-0  left-0 bg-gray-300 flex items-center text-black z-10 p-2 ">
                                    symbol
                                </span>
                                <form 
                                    action=""
                                    onSubmit={handleSearchClick}
                                    className=''
                                >
                                    <input
                                        className="ticker-search h-10 text-xl  w-full mr-16 pl-20 bg-gray-200  "
                                        type="text"
                                        value ={tickerInput}
                                        onChange={(e) => setTickerInput(e.target.value)}
                                        required
                                    />
                                    <span className="absolute inset-y-0 right-0 flex items-center ">
                                        <button 
                                            className="z-10 bg-gray-300 h-full p-2 right-0 ml-48"
                                            type='submit'
                                        >
                                            search
                                        </button>
                                    </span>
                                </form>

                            </div>
                    </div>

                    <div className="stock-info mt-4 text-black w-full md:ml-4  min-h-14 flex space-x-4 md:space-x-10">
                        <div className="ticker-stock-info  ">
                            
                                {ticker === '' ? <h1 className='text-md ml-2 '>Ticker </h1> : <h1 className='text-2xl ml-2'>{ticker}</h1>}
                            <div className="ml-2 text-xs ">
                                {truncateToTwoWords(company)}
                                
                                
                            </div>
                        </div>
                        <div className="stock-price-info ">
                            <h1>Current</h1>
                            <h1 className="mt-1">
                                {currentPrice}
                            </h1>
                        </div>
                        <div className="bid-ask-info  flex justify-center flex-col ">
                            <h1 className="bid  text-md">
                                Bid
                            </h1>
                            <h1 className="bid  text-md">
                                Ask
                            </h1>
                        </div>
                        <div className="bid-ask-price-info  flex justify-center flex-col">
                            <h1 className="bid bg-red-400 text-md rounded-md mb-1 px-1">
                                {bidPrice}
                            </h1>
                            <h1 className="ask bg-green-400 text-md rounded-md px-1 ">
                                {askPrice}
                            </h1>
                        </div>

                        <div className="expiration-container">
                            <h1 className='mb-1'>Expirations</h1>
                            <select
                                name="expiration"
                                id='expiration'
                                className='text-black rounded-md w-28 md:w-36 bg-gray-200 cursor-pointer'
                                value={selectedExpiration}
                                onChange={handleExpirationChange}
                            >
                                <option 
                                value="" 
                                disabled
                                className='bg-gray-200'
                                >
                                    Select Expiration
                                </option>
                                {expirations.map((expiration) => (
                                    <option
                                        key={expiration}
                                        value={expiration}
                                        className='bg-gray-300'
                                    >
                                        {expiration}
                                    </option>
                                ))}
                            </select>
                        </div>                

                    </div>
                    
                </div>

                <div className="strategy-container mt-8 min-h-6  flex items-center">
                    <div className="text-box w-4/6 ">
                        <h1 className=" ml-4  text-4xl text-black">
                            Select Strategy
                        </h1>
                    </div>

                    <select
                        name="strategy"
                        id="strategy"
                        className="w-3/6 text-2xl h-8 rounded-md mr-4 bg-gray-200 cursor-pointer shadow-sm"
                        value={selectedStrategy}
                        onChange={handleStrategyChange}
                        required
                    >
                        <option 
                            value="" 
                            disabled
                        >
                                Strategies
                        </option>

                        {Object.keys(strategies).map(strategy => (
                            <option key={strategy} value={strategy}>{strategy}</option>
                        ))}

                        <option
                            disabled
                        >
                            More Coming Soon
                        </option>
                    </select>
                </div>

                <div className="contract-container  p-4 overflow-x-auto">
                    <table className="min-w-full divide-y divide-gray-200 ">
                        <thead className="bg-gray-200  ">
                            <tr>
                                <th className="px-6 py-3 text-center text-xs font-medium text-gray-800 uppercase tracking-wider">Select</th>
                                <th className="px-6 py-3 text-center text-xs font-medium text-gray-800 uppercase tracking-wider">Call Bid</th>
                                <th className="px-6 py-3 text-center text-xs font-medium text-gray-800 uppercase tracking-wider">Call Ask</th>
                                <th className="px-6 py-3 text-center text-xs font-medium text-gray-800 uppercase tracking-wider">Call Delta</th>
                                <th className="px-6 py-3 text-center text-xs font-medium text-gray-800 uppercase tracking-wider">Call IV</th>
                                
                                <th className="px-6 py-3 text-center text-xs font-medium text-gray-800 uppercase tracking-wider bg-yellow-400">Strike</th>
                                <th className="px-6 py-3 text-center text-xs font-medium text-gray-800 uppercase tracking-wider">Put Bid</th>
                                <th className="px-6 py-3 text-center text-xs font-medium text-gray-800 uppercase tracking-wider">Put Ask</th>
                                <th className="px-6 py-3 text-center text-xs font-medium text-gray-800 uppercase tracking-wider">Put Delta</th>
                                <th className="px-6 py-3 text-center text-xs font-medium text-gray-800 uppercase tracking-wider">Put IV</th>
                            </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-gray-200">
                            {optionsData.map((option) => (
                                <tr key={option.strike}>
                                    <td className='px-6 py-4 text-center'>
                                        <input
                                            type='checkbox'
                                            disabled={selectedStrategy === ""}
                                            onChange={() => handleCheckboxChange(option.strike)}
                                            checked={selectedContracts.includes(option.strike)}
                                        />
                                    </td>
                                    <td className="px-6 py-4 text-center">{option.call.bid || '-'}</td>
                                    <td className="px-6 py-4 text-center">{option.call.ask || '-'}</td>
                                    <td className="px-6 py-4 text-center">{(option.call.delta).toFixed(2) || '-'}</td>
                                    <td className="px-6 py-4 text-center">{(option.call.iv).toFixed(2) || '-'}</td>
                                    <td className="px-6 py-4 text-center bg-yellow-200">{option.strike}</td>
                                    <td className="px-6 py-4 text-center">{option.put.bid || '-'}</td>
                                    <td className="px-6 py-4 text-center">{option.put.ask || '-'}</td>
                                    <td className="px-6 py-4 text-center">{(option.put.delta).toFixed(2) || '-'}</td>
                                    <td className="px-6 py-4 text-center">{(option.put.iv).toFixed(2) || '-'}</td>                                    
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>

                <div className=' breakeven-and-premium h-10 flex text-gray-300 mt-10 w-full items-center '>
                    <h1 className='text-3xl ml-4 w-1/2 md:w-3/5 lg:w-1/2 text-black lg:ml-16 '>
                        Breakeven
                    </h1>
                    <h1 className=' breakeven-box text-2xl w-1/2 md:w-3/5 ml-4 lg:ml-2 text-black '>
                        {` $ ${breakevenPrice} ` }
                        <span className='text-sm'> per share</span>
                    </h1>

                </div>


                <div className="premium-box flex items-center mt-2 text-black">
                    <h1 className=' text-3xl w-1/2  md:w-3/5 ml-4 lg:ml-16 lg:w-1/2'>Premium</h1>
                    <h2 className='w-1/2 text-2xl mb-2  md:w-3/5 ml-4 lg:ml-2 ' >{` $ ${premium * numContracts * 100}`}
                        <span className=' ml-2 text-sm'>per contract(s)</span>
                    </h2>

                    
                </div>


                <div className="price-box contracts text-black flex items-center  w-full  ">

                    <div className="button-box   w-1/2 md:w-2/5 flex items-center justify-center md:justify-start">

                    </div>                  
                </div>


                <div className="num-contracts-box flex mb-4 text-black  ">
                    <div className='w-1/2 lg:w-2/5 lg:mr-20  '></div>
                    <div className="number-box flex ml-5 md:ml-8">
                            <button 
                                className='text-xl bg-gray-200 w-8 h-8 text-center rounded-md cursor-pointer'
                                onClick={handleDecrementClick}
                                disabled={isSelling === false}
                            >
                                -
                            </button>
                            <input 
                                className='bg-white text-black text-xl w-12 ml-1 mr-1  text-center rounded-md'
                                value={numContracts}
                                type='text'
                                onChange={handleInputChange}
                                
                            />
                            <button 
                                className='text-xl bg-gray-200 w-8 h-8 text-center rounded-md cursor-pointer'
                                onClick={handleIncrementClick}
                                disabled={isSelling === false}
                            >
                                    +
                            </button>
                    </div>
                </div>

                <div className="custom-bid-ask flex flex-col ml-2 lg:ml-16 mr-2 text-black">
                <div className="inputs-container flex mb-2">
                    <span className='mr-2 flex items-center'>Bid</span>
                    <input
                    className={`ask  w-16 h-6 mr-2 ${(loggedIn && isSelling) ? 'bg-gray-200' : 'bg-gray-400'}`}
                    disabled={!(loggedIn && isSelling)}
                    onChange={handleCustomBid}
                    value={bidInputValue}
                    
                    />
                    <span className='mr-2 flex items-center'>Ask</span>
                    <input
                    className={`ask  w-16 h-6 mr-4 ${(loggedIn && isBuying) ? 'bg-gray-200' : 'bg-gray-400'}`}
                    disabled={!(loggedIn && isBuying)}
                    onChange={handleCustomAsk}
                    value={AskInputValue}    
                    />
                </div>
                <div className="google-button-container mt-2">
                    <GoogleSignInButton 
                    handleBackendRedirect={handleBackendRedirect}
                    />
                </div>
                </div>

            </div>
        </div>
    );
}

export default MainPage;
