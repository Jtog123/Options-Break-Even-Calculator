require('dotenv').config();
const express = require('express');
const axios = require('axios');
const cors = require('cors');

const app = express();
const router = express.Router();
const PORT = 5000;

const apiKey = process.env.TRADIER_ACCESS_TOKEN;

app.use(express.json());

router.post('/input', async (req, res) => {
    const {tickerSymbol} = req.body;
    console.log(tickerSymbol)
    try{
        const[quoteResponse, expirationResponse ,chainResponse] = await Promise.all([
            axios.get('https://sandbox.tradier.com/v1/markets/quotes', {
                params: {
                    'symbols': `${tickerSymbol}`,
                    'greeks': 'false'
                },
                headers: {
                    'Authorization': `Bearer ${process.env.TRADIER_ACCESS_TOKEN}`,
                    'Accept': 'application/json'
                }
            }),
            axios.get('https://sandbox.tradier.com/v1/markets/options/expirations', {
                params: {
                    'symbol': `${tickerSymbol}`,
                    'includeAllRoots': 'true',
                    'strikes': 'false',
                }, 
                headers: {
                    'Authorization': `Bearer ${process.env.TRADIER_ACCESS_TOKEN}`,
                    'Accept': 'application/json'               
                }
            }),
            axios.get('https://sandbox.tradier.com/v1/markets/options/chains', {
                params: {
                    'symbol': `${tickerSymbol}`,
                    'expiration': '2024-09-24'
                    
                },
                headers: {
                    'Authorization': `Bearer ${process.env.TRADIER_ACCESS_TOKEN}`,
                    'Accept': 'application/json'                    
                }
            })
            
        ])
        let ticker = quoteResponse.data.quotes.quote.symbol;
        let companyName = quoteResponse.data.quotes.quote.description;
        let currentPrice = quoteResponse.data.quotes.quote.last;
        let bidPrice = quoteResponse.data.quotes.quote.bid;
        let askPrice = quoteResponse.data.quotes.quote.ask;

        let expirations = expirationResponse.data.expirations.date;
        console.log(expirations)
    

        //we have to have user select the stock
        // then they select their option exipration date from the stock
        // after we return exipration data they pick an exipration date
        //after picking exipration date we send that back and load option chain data

  
        //console.log(chainResponse.data)


        res.send({
            ticker, 
            companyName, 
            currentPrice, 
            bidPrice, 
            askPrice,
            expirations
            
        });

        //const chainResponse = await axios.get('https://sandbox.tradier.com/v1/markets/options/chains')
        //console.log(chainResponse)
        
    } catch (err) {
        console.error('Sorry error', err)
    }
})

/*
router.post('/input', async (req, res) => {
    //console.log("req body is", req.body)
    
    const {tickerSymbol} = req.body;
    try{
        const response = await axios.get('https://sandbox.tradier.com/v1/markets/options/lookup', {
            headers: {
                'Authorization': `Bearer ${process.env.TRADIER_ACCESS_TOKEN}`,
                'Accept': 'application/json'
            },
            params: {
                'underlying' : `${tickerSymbol}`
            }
        });

        console.log(response.data['symbols'][0])
        console.log(response.data['symbols'][0]['rootSymbol'])
        res.send(response.data['symbols'][0]['rootSymbol']);
    } catch(err) {
        console.log(err);
    }
})
*/

app.use(cors({
    origin: 'http://localhost:3000',
    credentials: true
}))

app.use('/', router);

app.listen(PORT, () => {
    console.log(`App is listening on port ${PORT}`);
})