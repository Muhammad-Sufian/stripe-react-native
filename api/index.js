import express from 'express'
import Stripe from 'stripe'
import fetch from 'node-fetch'

const stripe = new Stripe('_secret_key_from_stripe_',{
    apiVersion:'2020-08-27',
    typescript:false
})

const app = express()
app.use(express.json())

//This is the first API which the application will call. The application will send list of services to the system and then the server will calculate the amount and tehen will create payment intent and will send back client secret, which it gets from it.
app.post('/create-payment-intent',async(req,res)=>{
    const paymentIntent = await stripe.paymentIntents.create({
        amount: 400, // 4$
        currency: 'usd',

    })
    // res.send(paymentIntent)
    res.send({
        clientSecret: paymentIntent.client_secret
    })
})

// From clientSecret in the '/create-payment-intent' api, the application in front end will create the payment. If the payment is successfull then the application will return the payment_intent id to this api 'check-transaction/'
//This api will be used to confirm if the payment is really made. The payment_intent will be used to get the information about the payment, and if the paid variable is set tp true then it means the payment is made successfully.
// The server will send the response that payment is made successfully

app.get('/check-transaction/',async(req,res)=>{
    // res.send(req.query.payment_intent)
    let payment_intent = req.query.payment_intent

    var myHeaders = new fetch.Headers()
    myHeaders.append('Authorization', 'Bearer sk_test_51JTRiDASil5ncF5z8O5o6MwSCi1aNK2rP3EQxgfD9pUn5UrX59xnK6tEltGMG8iUTBpilhW3DsEmrDkonUl1Y2ph00TZqrCGQj')

    var requestOptions = {
        method: 'GET',
        headers: myHeaders,
        redirect: 'follow'
    };

    await fetch('https://api.stripe.com/v1/payment_intents/' + payment_intent,requestOptions)
    .then(resp=>resp.json())
    .then(resp_json=>{

        if(resp_json.charges.data.length>0){
            if(resp_json.charges.data[0].paid){
                res.send({'message':'paid'})
                // write in the database
            }else{
                res.send({'message':'not paid'})
            }
        }else{
            res.send({'message':'not paid'})
        }
    }).catch((err)=>{
        res.send({'message':'not paid'})
    })
})

app.listen(3001,()=>console.log('Running'))
