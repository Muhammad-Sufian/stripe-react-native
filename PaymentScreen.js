// PaymentScreen.ts

import React, {useEffect, useState, useRef} from 'react' 

import { CardField, useStripe, useConfirmPayment,loading } from '@stripe/stripe-react-native';
import { TouchableOpacity,View,Text,SafeAreaView, ImageBackground,Image,Animated, ActivityIndicator, Alert } from 'react-native';

const PaymentScreen = () => { 

    const { confirmPayment } = useStripe(); 
    const [loading, setLoading] = useState(false);
    const fadeAnimLogo = useRef(new Animated.Value(0)).current;
    const fadeAnimBttn = useRef(new Animated.Value(0)).current;
    const stripeHeightAnim = useRef(new Animated.Value(0)).current; 
 
    useEffect(() => {
        Animated.sequence([
            Animated.spring(fadeAnimLogo, {
                toValue: 1,
                duration: 1000,
                useNativeDriver:false
              }),
            Animated.timing(stripeHeightAnim, {
                toValue: 60,
                duration: 1000,
                useNativeDriver:false
            }),
            Animated.timing(fadeAnimBttn, {
                toValue: 1,
                duration: 1000,
                useNativeDriver:false
            }),
        ]).start();
        
    }, [])

    const handlePayMethod=async()=>{
        //asking server to create the payment intent, which will return us the client secret key which will be used to make payment
        setLoading(true)

        //fetching client secret key 
        fetch('http://localhost:3001/create-payment-intent',{
            method:"POST"
        })
        .then(res=>res.json()).then(async res_json =>{ 
            let secret_client_key = res_json.clientSecret;

            //making payment
            console.log("secret_client_key: ",secret_client_key)
            const {error, paymentIntent} = await confirmPayment(secret_client_key,{
                type:'Card',
                billingDetails:{
                    email:'test@test.com'
                }
            }) 
            if(error){
                console.log(error)
                setLoading(false)
                Alert.alert(
                    "",
                    "Payment Failed",
                    [
                      
                      { text: "OK", onPress: () => console.log("OK Pressed") }
                    ]
                  );
            }else{ 
                console.log(paymentIntent)
                console.log(paymentIntent.id)
                if(paymentIntent.id != null){

                    //sending payment id back for verification to see if the payment is really created or not
                    fetch('http://localhost:3001/check-transaction?payment_intent='+paymentIntent.id,{
                        method:"GET", 
                    })
                    .then(res=>res.json()).then(res_json =>{ 
                        
                        if(res_json.message == 'paid'){
                            alert('paid') 
                            setLoading(false)
                            Alert.alert(
                                "",
                                'Payment was successful',
                                [
                                  
                                  { text: "OK", onPress: () => console.log("OK Pressed") }
                                ]
                            );
                        }else{
                            alert('unpaid')
                            setLoading(false)
                            Alert.alert(
                                "",
                                'Payment Failed',
                                [
                                  
                                  { text: "OK", onPress: () => console.log("OK Pressed") }
                                ]
                            );
                        }
                    }).catch(res=>{
                        console.log(res)
                        setLoading(false)
                        Alert.alert(
                            "",
                            'Payment Failed',
                            [
                              
                              { text: "OK", onPress: () => console.log("OK Pressed") }
                            ]
                        );
                    })
                }else{
                    setLoading(false)
                    Alert.alert(
                        "",
                        'Payment Failed',
                        [
                          
                          { text: "OK", onPress: () => console.log("OK Pressed") }
                        ]
                    );
                }
                
            }
        }).catch(res=>{
            console.log(res)
            setLoading(false)
            Alert.alert(
                "",
                'Payment Failed',
                [
                  
                  { text: "OK", onPress: () => console.log("OK Pressed") }
                ]
            );
        })
       
    }

  return (
    <SafeAreaView style={{height:'100%',width:'100%',justifyContent:'center',backgroundColor:'black'}}>
        <ImageBackground style={{width:'100%',height:'100%',justifyContent:'center'}} source={require('./assets/angryimg.png')}>
            
        
        <View style={{width:'95%',borderRadius:10,borderWidth:2,borderColor:'white', paddingVertical:30,backgroundColor:'white',alignSelf:'center'}}>
            <Animated.Image style={{alignSelf:'center',width:100,height:100,marginBottom:10,opacity:1, transform: [{ scale: fadeAnimLogo }]}} source={require('./assets/middle.png')}>

            </Animated.Image>

            
                <Animated.View style={{justifyContent:'center',backgroundColor:'white',zIndex:2, padding:10,height:stripeHeightAnim,top:25,alignSelf:'center' }}>
                    <Text style={{alignSelf:'center', color:'#209fd6', fontWeight:'bold', fontSize:26}}>stripe</Text>
                </Animated.View>
                <View style={{borderColor:'#209fd6',borderWidth:2,borderRadius:10,paddingVertical:10}}>
                    <CardField
                        postalCodeEnabled={false}
                        placeholder={{
                            number: '4242 4242 4242 4242',
                        }}
                        cardStyle={{
                            backgroundColor: '#FFFFFF',
                            textColor: '#000000',
                        }}
                        style={{
                            width: '100%',
                            height: 50,
                            marginVertical: 30,
                        }}
                        onCardChange={(cardDetails) => {
                            console.log('cardDetails', cardDetails);
                        }}
                        onFocus={(focusedField) => {
                            console.log('focusField', focusedField);
                        }}
                    />

                    {!loading ?(
                        <Animated.View style={{opacity:fadeAnimBttn}}>
                            <TouchableOpacity style={{height:40,width:90,borderRadius:20,backgroundColor:'#209fd6',justifyContent:'center',alignSelf:'center'}} onPress={()=>handlePayMethod()}>
                                <Text style={{color:'white',alignSelf:'center',fontWeight:'bold'}}>Pay</Text>
                            </TouchableOpacity>
                        </Animated.View>
                       
                    ):(
                        <ActivityIndicator size={25} color='#209fd6' style={{alignSelf:'center'}} />
                    )}
                </View>
        </View>
        </ImageBackground>
       
    </SafeAreaView>
  );
}

export default PaymentScreen;