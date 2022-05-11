const minutesDelay = process.env.DELAY || 5;
const delay = minutesDelay * 60 * 1000;
const { getLinkMessage, publishMessage, readMessage} = require('./slack.api');
const reactions = ['pr_approved', 'pr_reviewing', 'pr_disapproved'];
let queuePR = [];

async function schedule({ channelId, ts }) {
    if(queuePR.find(prId => prId == ts)){
        return
    }
    queuePR.push(ts)
    setTimeout(async () => {
    
        const oldMessage = await readMessage(channelId, ts);
        oldMessage.reactions = oldMessage.reactions && oldMessage.reactions.length ? oldMessage.reactions : [];

        if(reactions.find(react => oldMessage.reactions.find(r => r.name == react))){
            popQueue(ts)
            return
        }
    
        await publishMessage(channelId, `<${process.env.SLACK_GROUP_ID}> This pull-request timed out. ${getLinkMessage({ channelId, ts})}`);

        popQueue(ts);

        schedule({ channelId, ts });
    
    } , delay)
}

function popQueue(ts){
    queuePR = queuePR.filter(prId => prId != ts)
}

function getQueue(){
    return queuePR;
}

function resetQueue(){
    queuePR = [];
}

module.exports = { schedule, resetQueue, getQueue };

