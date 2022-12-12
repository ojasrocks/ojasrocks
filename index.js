const express = require('express');
const bodyParser = require('body-parser');
const axios = require('axios');
const app = express();
const port = 4000;

// Set up pug as view engine
app.set('view engine', 'pug');

app.use(bodyParser.urlencoded({extended: false}));

var access_token;

setInterval(async ()=>{

    try
    {
    const obj_token = 'grant_type=client_credentials&scope='+process.env.SCOPE+'&client_id='+process.env.BITYID+'&client_secret='+process.env.BITY_SECRET;
    const axios_token = await axios.post(process.env.TOKEN_ENDPOINT, 
      obj_token,{
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
        }
      })
      access_token = axios_token.data.access_token;
      }catch (error) {console.log(error);}

},1800000)

app.post('/ojas2bity/order', async (req, res) => {
    try{
        // modify the object with own factor
        var obj = req.body;
        obj.partner_fee.factor = process.env.BASIC;
        const axios_order = await axios.post(
            'https://exchange.api.bity.com/v2/orders',
            obj,
            {
              headers: {
              'Authorization': 'Bearer '+access_token,
              'Content-Type': 'application/json' ,
              },
            }
          );
        const location = axios_order.headers["location"];
        const check_service = (element) => {return element.includes("sessionid")}
        const cookie = axios_order.headers["set-cookie"][0].split(";").find(check_service);
        const retrieve = await axios.get("https://exchange.api.bity.com"+location,{
            headers:{
              'Authorization': 'Bearer '+access_token,
              'Cookie':cookie}
          }) 
        const response_obj = {
          retrieve: retrieve,
          location : location}
        res.send(response_obj);
    }catch(e){console.log(e);
    res.send('error: '+e)}
  });
  
app.post('/ojas2bity/cancel', async (req, res)=>{
  try{
    const axios_order = await axios.post(
      'https://exchange.api.bity.com'+req.body+'/cancel',
      "",
      {
        headers: {
        'Authorization': 'Bearer '+access_token,
        'Content-Type': 'application/json' ,
        },
      }
    );
      res.send('cancelled')
  }catch(e){console.log(e);
    res.send('error: '+e)}
});

app.listen(port, () => {
  console.log(`Success! Your application is running on port ${port}.`);
});