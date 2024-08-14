require('dotenv').config();
const express = require('express');
const axios = require('axios');
const cors = require('cors');
const session = require('express-session');
const { Pool } = require('pg');
const passport = require('passport');
const GoogleStrategy = require('passport-google-oauth20').Strategy


const app = express();
const router = express.Router();
const PORT = 5000;

app.use(cors({
    origin: 'http://localhost:3000',
    credentials: true
}))

const pool = new Pool({
    user: process.env.POSTGRES_USER,
    host: 'db', // Adjust this if using Docker or other setup
    database: process.env.POSTGRES_DB,
    password: process.env.POSTGRES_PASSWORD, // Make sure to include the password
    port: 5432
});


app.use(express.json());

app.use(session({
    secret: 'your-session-secret', // Replace with a strong secret
    resave: false,
    saveUninitialized: false,
    cookie: { secure: false } // Set to true if using HTTPS
}));

app.use(passport.initialize());
app.use(passport.session())

passport.serializeUser((user, done) => {
    console.log("Seralizing User: ", user);
    done(null, user.id);
});

passport.deserializeUser(async (id, done) => {
    console.log('Deserializing user with id:', id); // Add this line
    try {
        const result = await pool.query('SELECT * FROM users WHERE id = $1', [id]);
        console.log('User found:', result.rows[0]); // Add this line
        done(null, result.rows[0]);
    } catch (err) {
        console.error('Error deserializing user:', err); // Add this line
        done(err, null);
    }
});

passport.use(
    new GoogleStrategy(
        {
            clientID: process.env.GOOGLE_CLIENT_ID,
            clientSecret: process.env.GOOGLE_CLIENT_SECRET,
            callbackURL: 'http://localhost:5000/auth/google/callback'
            
        },
        async (token, tokenSecret, profile, done) => {
            try {
                // Try to pull user if it exists
                let user = await pool.query('SELECT * FROM users WHERE google_id = $1', [profile.id]);
                if(user.rowCount.length === 0) {
                    // If we get no rows returned insert the user
                    const result = await pool.query(
                        'INSERT INTO users (email, google_id, username) VALUES ($1, $2, $3) RETURNING *', [profile.emails[0].value, profile.id, profile.displayName]
                    );
                    user = result.rows[0];
                } else {
                    user = user.rows[0];
                }
                console.log('User in Google Strategy:', user); // Add this line for debugging
                return done(null, user);

            } catch(err) {
                console.error('Error in Google Strategy:', err); // Add this line for debugging
                return done(err, null);

            }
        }
       
    )
);

router.get('/auth/google', passport.authenticate('google', {scope: ['https://www.googleapis.com/auth/userinfo.profile', 'https://www.googleapis.com/auth/userinfo.email']}))

router.get('/auth/google/callback', passport.authenticate('google', {failureRedirect: '/auth/failure'}), (req, res) => {
        // Successful authentication, redirect to your desired route
        //res.redirect('/protected')
        //res.redirect('/conversation')
        res.redirect('http://localhost:3000'); // Redirect to the client-side route
})

router.get('/auth/failure', (req, res) => {
    res.send("Failed to authenticate, some went wrong")
})

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
        //console.log(expirations)
    

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

router.post('/expirations', async (req, res) => {
    const {tickerInput} = req.body
    const {expirationTime} = req.body
    console.log(req.body)
    
    try {

        // Get the underlying price for taking the difference

        const quoteResponse = await axios.get('https://sandbox.tradier.com/v1/markets/quotes', {
            params: {
                'symbols': tickerInput
            },
            headers: {
                'Authorization': `Bearer ${process.env.TRADIER_ACCESS_TOKEN}`,
                'Accept': 'application/json'                
            }
        });

        const stockPrice = quoteResponse.data.quotes.quote.last;


        // GET option chains
        const response = await axios.get('https://sandbox.tradier.com/v1/markets/options/chains', {
            params: {
                'symbol': tickerInput,
                'expiration': expirationTime,
                'greeks': true
            },
            headers: {
                'Authorization': `Bearer ${process.env.TRADIER_ACCESS_TOKEN}`,
                'Accept': 'application/json'
            }
        })
        //console.log(response.data)
        optionsChain = response.data.options.option;

        const strikeFilteredOptions = optionsChain.filter(option => {
            const strikePrice = option.strike;
            return Math.abs(strikePrice - stockPrice) <= 5;
        });

        //console.log(strikeFilteredOptions[0]);

        const filteredOptions = strikeFilteredOptions.map(option => ({
            type: option.option_type,
            strike: option.strike,
            bid: option.bid,
            ask: option.ask,
            delta: option.greeks.delta,
            iv: option.greeks.mid_iv,
            expiration: option.expiration_type
        }));

        //ok have now filitered this
        console.log(filteredOptions);

        res.json({options: filteredOptions});
        


        

        // we need to determine the options strike price, to determine its row
        // We need to determine if option is a call or a put
        // we need to send it expiration back
        //whether put or call we need to send back its bid, ask, delta, IV (which one?), and its strike
        // We need to determine if its a standard or a weeklys
    } catch (err) {
        console.error(err)
    }


})



app.use('/', router);

app.listen(PORT, () => {
    console.log(`App is listening on port ${PORT}`);
})