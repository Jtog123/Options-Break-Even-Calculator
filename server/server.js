require('dotenv').config();
const express = require('express');
const axios = require('axios');
const cors = require('cors');

const app = express();
const router = express.Router();
const PORT = 5000;

const apiKey = process.env.TRADIER_ACCESS_TOKEN;

app.use(express.json());

//now use the requests data to make a request to Tradier API
//send the ticker to tradier api make sure it exists
//

/*
    const fetchData = async () => {
        try {
            const response = await axios.get('https://sandbox.tradier.com/v1/markets/options/lookup', {
                headers: {
                    'Authorization': `Bearer ${process.env.TRADIER_ACCESS_TOKEN}`,
                    'Accept': 'application/json'
                },
                params: {
                    'underlying': 'tickerSymbol'
                }
            });
*/

router.post('/input', async (req, res) => {
    console.log(req.body)
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

        console.log(response.data['symbols'][0]['rootSymbol'])
        res.send(response.data['symbols'][0]['rootSymbol']);
    } catch(err) {
        console.log(err);
    }
})


app.use(cors({
    origin: 'http://localhost:3000',
    credentials: true
}))

app.use('/', router);

app.listen(PORT, () => {
    console.log(`App is listening on port ${PORT}`);
})