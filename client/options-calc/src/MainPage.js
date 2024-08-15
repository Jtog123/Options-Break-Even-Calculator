import React, { useState, useEffect } from 'react';
import axios from 'axios'



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
    const [company, setCompany] = useState("TICKER");
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

    const strategies = {
        "Buy Call(s)": 1,
        "Buy Put(s)": 1,
        "Sell Call(s)": 1,
        "Sell Put(s)": 1,
        "Sell Covered Call(s)": 1,
        "Buy Protective Put(s)": 1,        
        "Vertical Spread": 2,
        "Butterfly Spread": 3,
        "Iron Condor": 4,
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
        */

    };

    return (
        <div className="outer-container h-screen bg-blue-200 flex justify-center items-center w-full">
            <div className="bg-black h-screen w-5/6 ">
                <div className="search-container relative w-full flex justify-center items-center flex-col ">
                    <div className="relative z-10 w-full">
                        <span className="absolute inset-y-0 left-0 bg-green-400 flex items-center text-black z-10 p-2">
                            symbol
                        </span>
                        <form 
                            action=""
                            onSubmit={handleSearchClick}
                        >
                            <input
                                className="h-10 text-xl w-full mr-16 pl-20"
                                type="text"
                                value ={tickerInput}
                                onChange={(e) => setTickerInput(e.target.value)}
                                required
                            />
                            <span className="absolute inset-y-0 right-0 flex items-center">
                                <button 
                                    className="z-10 bg-green-400 h-full p-2"
                                    type='submit'
                                >
                                    search
                                </button>
                            </span>
                        </form>

                    </div>
                </div>

                <div className="stock-info mt-4 text-black w-full bg-blue-300 min-h-14 flex space-x-4 md:space-x-10">
                    <div className="ticker-stock-info bg-red-300">
                        <h1 className="text-2xl ml-2">
                            {ticker}
                            
                        </h1>
                        <div className="text-xs ml-2">
                            {company}
                        </div>
                    </div>
                    <div className="stock-price-info bg-yellow-300">
                        <h1 className="mt-1">
                            {currentPrice}
                        </h1>
                    </div>
                    <div className="bid-ask-info bg-yellow-300 flex justify-center flex-col">
                        <h1 className="bid bg-red-300 text-md">
                            Bid
                        </h1>
                        <h1 className="bid bg-green-300 text-md">
                            Ask
                        </h1>
                    </div>
                    <div className="bid-ask-price-info bg-yellow-300 flex justify-center flex-col">
                        <h1 className="bid bg-red-300 text-md">
                            {bidPrice}
                        </h1>
                        <h1 className="bid bg-green-300 text-md">
                            {askPrice}
                        </h1>
                    </div>

                    <div className="expiration-container">
                        <h1>Expirations</h1>
                        <select
                            name="expiration"
                            id='expiration'
                            className=''
                            value={selectedExpiration}
                            onChange={handleExpirationChange}
                        >
                            <option 
                            value="" 
                            disabled>
                                Select Expiration
                            </option>
                            {expirations.map((expiration) => (
                                <option
                                    key={expiration}
                                    value={expiration}
                                >
                                    {expiration}
                                </option>
                            ))}
                        </select>
                    </div>
                </div>

                <div className="strategy-container mt-14 min-h-6 bg-purple-400 flex items-center">
                    <div className="text-box w-4/6 ">
                        <h1 className=" ml-2 bg-orange-300 text-4xl">
                            Select Strategy
                        </h1>
                    </div>

                    <select
                        name="strategy"
                        id="strategy"
                        className="w-3/6 text-2xl h-8"
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
                    </select>
                </div>

                <div className="contract-container bg-green-500 p-4 overflow-x-auto">
                    <table className="min-w-full divide-y divide-gray-200 ">
                        <thead className="bg-gray-50  ">
                            <tr>
                                <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">Select</th>
                                <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">Call Bid</th>
                                <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">Call Ask</th>
                                <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">Call Delta</th>
                                <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">Call IV</th>
                                
                                <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider bg-yellow-200">Strike</th>
                                <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">Put Bid</th>
                                <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">Put Ask</th>
                                <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">Put Delta</th>
                                <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">Put IV</th>
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

                <div className=' breakeven-and-premium h-10 flex text-white bg-purple-400 mt-10 w-full items-center jus '>
                    <h1 className='text-3xl ml-2 w-1/2 md:w-3/5 bg-yellow-300 '>
                        Breakeven
                    </h1>
                    <div className="custom-bid-ask flex mr-2 ">
                        <span className='mr-2'>Bid</span>
                        <input
                            className='ask bg-blue-500 w-16 h-6 mr-2'
                            disabled={!(loggedIn && isSelling)}
                            onChange={handleCustomBid}
                            value={bidInputValue}
                            
                              
                        />
                        <span className='mr-2'>Ask</span>
                        <input
                            className='ask bg-orange-500 w-16 h-6'
                            disabled={!(loggedIn && isBuying)}
                            onChange={handleCustomAsk}
                            value={AskInputValue}    
                        />
                    </div>

                    

                </div>

                <div className="price-box contracts text-white bg-orange-300 flex items-center  w-full  ">
                    <h1 className=' breakeven-box text-2xl w-1/2 md:w-3/5 ml-2 '>
                        {` $ ${breakevenPrice} per share`}
                    </h1>
                    <div className="button-box bg-green-300 w-1/2 md:w-2/5 flex items-center justify-center md:justify-start">
                        <button className='bg-gray-400 rounded-full text-xl w-24 md:w-1/2 h-8 ml-2 '
                        onClick={handleBackendRedirect}> Google</button>
                    </div>

                    

                    
                </div>

                <div className="premium-box flex bg-blue-400 items-center mt-2">
                    <h1 className='text-white text-3xl w-1/2 ml-2 md:w-3/5'>Premium</h1>
                    <h2 className='text-white text-xl'>Num Contracts</h2>
                    
                </div>
                <div className="num-contracts-box flex  bg-gray-400">
                    <h2 className='w-1/2 ml-2 text-2xl md:w-3/5'>{` $ ${premium * numContracts} per contract(s)`}</h2>
                    <div className="number-box flex">
                            <button 
                                className='text-xl bg-gray-300 w-8 h-8 text-center'
                                onClick={handleDecrementClick}
                            >
                                -
                            </button>
                            <input 
                                className='bg-white text-black text-xl w-12 text-center'
                                value={numContracts}
                                type='text'
                                onChange={handleInputChange}
                            />
                            <button 
                                className='text-xl bg-gray-300 w-8 h-8 text-center'
                                onClick={handleIncrementClick}
                            >
                                    +
                            </button>
                        </div>
                </div>

            </div>
        </div>
    );
}

export default MainPage;
