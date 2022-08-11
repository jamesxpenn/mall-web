const express = require('express');
const path = require('path');
const bodyParser = require('body-parser');
const axios = require('axios');

const app = express();

app.use(express.json());

const port = 8080;


const gateWayUrl = process.env.GATEWAY_URL || "http://mall-gateway:9001";



/**
 *  定义dapr端口和访问地址
 *   
 */
const daprPort = process.env.DAPR_HTTP_PORT || 3500;
const daprUrl = `http://localhost:${daprPort}/v1.0/invoke`;


/**
 *  mall-web pod里面包含两个容器，共享网络栈
 *  1 mall-web容器
 *  2 dapr sidercar容器 
 *  
 *   服务调用的逻辑
 *   1 mall-web容器接收到"/api/user/login"的请求，被转发到dapr sidecar容器，转发规则如下：
 *     {daprUrl}/{daprAppid}/method/{endpointurl}
 *   2 dapr sidecar容器根据daprAppId去dapr域名服务器查找对应的pod ip
 *   3 比如此处malluser 就是被找到的pod
 *   4 malluser pod中的dapr sidecar接收到请求
 *   5 根据endpointurl去寻找malluser app中的方法进行远程调用
 *   6 经过层层返回，最终返回到调用方
 *
 */
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

app.put('/api/*', async (req, res) => {

  const appResponse = await axios.put(
    `${gateWayUrl}${req.originalUrl}`,
	req.body,
    {
      params:req.query,
      headers:req.headers
    }
  )
  return res.send(appResponse.data); 

});

app.delete('/api/*', async (req, res) => {

  const appResponse = await axios.delete(
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
