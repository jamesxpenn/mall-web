const express = require('express');
const path = require('path');
const bodyParser = require('body-parser');
const axios = require('axios');

const app = express();

app.use(express.json());

const port = 8080;


const daprPort = process.env.DAPR_HTTP_PORT || 3500;

const daprUrl = `http://localhost:${daprPort}/v1.0/invoke`;


const gateWayUrl = process.env.GATEWAY_URL || "http://mall-gateway:9001";


app.post('/api/user/login', async (req, res) => {
  
  const appResponse = await axios.post(`${daprUrl}/malluser/method/user/login`, 
    req.body,
    {
      headers:req.headers
    }
  )

  return res.send(appResponse.data); 

});


app.post('/api/*', async (req, res) => {
  
  const appResponse = await axios.post(`${gateWayUrl}${req.originalUrl}`, 
    req.body,
    {
      headers:req.headers
    }
  )

  return res.send(appResponse.data); 

});

app.get('/api/*', async (req, res) => {

  const appResponse = await axios.get(
    `${gateWayUrl}${req.originalUrl}`,
    {
      params:req.query,
      headers:req.headers
    }
  )
  return res.send(appResponse.data); 

});


// Serve static files
app.use(express.static(path.join(__dirname, 'client/dist')));

// For default home request route to React client
app.get('/', async function (_req, res) {
  return await res.sendFile(path.join(__dirname, 'client/dist', 'index.html'));
});

app.listen(process.env.PORT || port, () => console.log(`Listening on port ${port}!`));
