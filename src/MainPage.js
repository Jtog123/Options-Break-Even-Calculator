import React, { useState } from 'react';

function MainPage() {
    const [selectedStrategy, setSelectedStrategy] = useState("");
    const [selectedContracts, setSelectedContracts] = useState([]);

    const strategies = {
        "Buy Call(s)": 1,
        "Vertical Spread": 2,
        "Butterfly Spread": 3,
        "Iron Condor": 4,
    };

    const contracts = [
        { id: 1, callBid: "Value 1", callAsk: "Value 2", callDelta: "Value 3", callIV: "Value 4", strike: "Value 5", putBid: "Value 6", putAsk: "Value 7", putDelta: "Value 8", putIV: "Value 9" },
        { id: 2, callBid: "Value 10", callAsk: "Value 11", callDelta: "Value 12", callIV: "Value 13", strike: "Value 14", putBid: "Value 15", putAsk: "Value 16", putDelta: "Value 17", putIV: "Value 18" },
        // Add more contract data as needed
    ];

    const handleStrategyChange = (e) => {
        setSelectedStrategy(e.target.value);
        setSelectedContracts([]);
    };

    const handleCheckboxChange = (contractId) => {
        setSelectedContracts((prevSelectedContracts) => {
            if (prevSelectedContracts.includes(contractId)) {
                return prevSelectedContracts.filter(id => id !== contractId);
            } else if (prevSelectedContracts.length < strategies[selectedStrategy]) {
                return [...prevSelectedContracts, contractId];
            } else {
                return prevSelectedContracts;
            }
        });
    };

    return (
        <div className="outer-container h-screen bg-blue-200 flex justify-center items-center w-full">
            <div className="bg-black h-5/6 w-5/6 md:w-4/6">
                <div className="search-container relative w-full flex justify-center items-center flex-col ">
                    <div className="relative z-10 w-full">
                        <span className="absolute inset-y-0 left-0 bg-green-400 flex items-center text-black z-10 p-2">
                            symbol
                        </span>
                        <input
                            className="h-10 text-xl w-full mr-16 pl-20"
                            type="text"
                            required
                        />
                        <span className="absolute inset-y-0 right-0 flex items-center">
                            <button className="z-10 bg-green-400 h-full p-2">
                                search
                            </button>
                        </span>
                    </div>
                </div>

                <div className="stock-info mt-4 text-black w-full bg-blue-300 min-h-14 flex space-x-10">
                    <div className="ticker-stock-info bg-red-300">
                        <h1 className="text-2xl ml-2">
                            BA
                        </h1>
                        <div className="text-xs ml-2">
                            Boeing Co.
                        </div>
                    </div>
                    <div className="stock-price-info bg-yellow-300">
                        <h1 className="mt-1">
                            $163.79
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
                            $163.65
                        </h1>
                        <h1 className="bid bg-green-300 text-md">
                            $163.89
                        </h1>
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
                    >
                        <option value="" disabled>Select a Strategy</option>
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
                            {contracts.map((contract) => (
                                <tr key={contract.id}>
                                    <td className='px-6 py-4 whitespace-nowrap text-sm text-gray-500'>
                                        <input
                                            type="checkbox"
                                            checked={selectedContracts.includes(contract.id)}
                                            onChange={() => handleCheckboxChange(contract.id)}
                                            disabled={!selectedStrategy}
                                        />
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{contract.callBid}</td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{contract.callAsk}</td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{contract.callDelta}</td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{contract.callIV}</td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{contract.strike}</td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{contract.putBid}</td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{contract.putAsk}</td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{contract.putDelta}</td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{contract.putIV}</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
}

export default MainPage;
