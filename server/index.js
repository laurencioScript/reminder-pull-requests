const { Router } = require('express');
const routes = Router();
const { schedule, resetQueue, getQueue } = require('./schedule');

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
    
    const typeEvent = request.body.type;
    
    if(typeEvent == 'url_verification'){    
        return response.status(200).send(request.body.challenge);
    }
    
    const event = request.body.event;
    
    
    if(process.env.SLACK_CHANNEL_ID != event.channel ){
        return response.status(300).send('channel invalid');
    }

    if(event.subtype && event.subtype != 'message_changed'){
      return response.status(300).send('channel invalid');
    }
    
    if(event.parent_user_id){
      return response.status(300).send('message in sub thread is invalid');
    }

    const message = event.subtype == 'message_changed' ? event.message.text  : event.text;  
    const contentPR = ['@ignore-bot'];
    const channelId = event.channel;
    const timestamp = event.subtype == 'message_changed' ? event.message.ts  : event.ts;

    if(contentPR.find(c => !!~message.indexOf(c))){
        return 
    }
    
    return response.status(200).send(schedule({ channelId, ts : timestamp}));

  }
  catch(e){
    console.log('>>> error', e);
    return response.status(400).send(e);
  }
  
})

routes.get('/reset', async (request, response) => {
  try {
    // #swagger.tags = ['Slack']
    
    resetQueue()

    return response.status(200).send({reset:true});

  }
  catch(e){
    console.log('>>> error', e);
    return response.status(400).send(e);
  }
  
})

routes.get('/queue', async (request, response) => {
  try {
    // #swagger.tags = ['Slack']

    return response.status(200).send(getQueue());

  }
  catch(e){
    console.log('>>> error', e);
    return response.status(400).send(e);
  }
  
})



module.exports = routes;