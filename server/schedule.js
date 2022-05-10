const minutesDelay = process.env.DELAY || 5;
console.log('>>> minutesDelay', minutesDelay);
const delay = minutesDelay * 60 * 1000;

const { getLinkMessage, publishMessage, readMessage} = require('./slack.api');
const reactions = ['pr_approved', 'pr_reviewing', 'pr_disapproved'];

async function schedule({ channelId, ts }) {
    
    setTimeout(async () => {
    
        const oldMessage = await readMessage(channelId, ts);

        oldMessage.reactions = oldMessage.reactions && oldMessage.reactions.length ? oldMessage.reactions : [];

        if(reactions.find(react => oldMessage.reactions.find(r => r.name == react))){
            return
        }
    
        const linkPR = getLinkMessage({ channelId, ts})
    
        await publishMessage(channelId, `<@${process.env.SLACK_GROUP_ID}> This pull-request timed out. ${linkPR}`);
        
        schedule({ channelId, ts })

    } , delay)
}

module.exports = schedule;

