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
        const response = await axios.get('https://sandbox.tradier.com/v1/markets/quotes', {
            params: {
                'symbols': `${tickerSymbol}`,
                'greeks': 'false'
            },
            headers: {
                'Authorization': `Bearer ${process.env.TRADIER_ACCESS_TOKEN}`,
                'Accept': 'application/json'
            }
        })
        //console.log(response.data)
        let ticker = response.data['quotes']['quote']['symbol']
        let companyName = response.data['quotes']['quote']['description']
        let currentPrice = response.data['quotes']['quote']['last']
        let bidPrice = response.data['quotes']['quote']['bid']
        let askPrice = response.data['quotes']['quote']['ask']

        res.send({ticker, companyName, currentPrice, bidPrice, askPrice});
        
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