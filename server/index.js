const { Router } = require('express');
const routes = Router();
const schedule = require('./schedule');

routes.get('/ping', async  (request, response) => {
  try {
    return response.send('pong');
  } catch (error) {
    return response.send('deu ruim');
  }
  
})

routes.post('/verification', function (req, res) {
    // #swagger.tags = ['Slack']
    try {
        return res.status(200).send(req.body.challenge);
    } catch (e) {
        return response.status(400).send(e);
    }
})
  
routes.post('/webhooks', async (request, response) => {
  try {
    // #swagger.tags = ['Slack']
    
    const typeEvent = request.body.type;
    
    if(typeEvent == 'url_verification'){    
        return response.status(200).send(request.body.challenge);
    }
    
    const event = request.body.event;
    
    if(process.env.SLACK_CHANNEL_ID != event.channel || event.subtype){
        return response.status(300).send('channel invalid');
    }
    
    const message = request.body.event.text;  
    const channelId = request.body.event.channel;
    const timestamp = request.body.event.ts;
    const contentPR = ['https://github.com', 'https://bitbucket.org']
    if(contentPR.find(c => !!~message.indexOf(c))){
        schedule({ channelId, ts : timestamp})
    }

    return response.status(200).send();

  }
  catch(e){
    console.log('>>> error', e);
    return response.status(400).send(e);
  }
  
})


module.exports = routes;