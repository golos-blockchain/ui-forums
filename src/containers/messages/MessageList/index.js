import React from 'react';
import moment from 'moment';

import Compose from '../../../components/elements/messages/Compose';
import Toolbar from '../../../components/elements/messages/Toolbar';
import ToolbarButton from '../../../components/elements/messages/ToolbarButton';
import Message from '../../../components/elements/messages/Message';

import './MessageList.css';

const MY_USER_ID = 'apple';

/*{
    id: 10,
    author: 'orange',
    message: 'It looks like it wraps exactly as it is supposed to. Lets see what a reply looks like!',
    timestamp: new Date().getTime()
},*/
export default class MessageList extends React.Component {
    renderMessages = () => {
        const messages = this.props.messages;
        let i = 0;
        let messageCount = messages.length;
        let tempMessages = [];

        while (i < messageCount) {
            let previous = messages[i - 1];
            let current = messages[i];
            let next = messages[i + 1];
            let isMine = current.author === this.props.account.name;
            let currentMoment = moment(current.timestamp);
            let prevBySameAuthor = false;
            let nextBySameAuthor = false;
            let startsSequence = true;
            let endsSequence = true;
            let showTimestamp = true;

            if (previous) {
                let previousMoment = moment(previous.timestamp);
                let previousDuration = moment.duration(currentMoment.diff(previousMoment));
                prevBySameAuthor = previous.author === current.author;
                
                if (prevBySameAuthor && previousDuration.as('hours') < 1) {
                    startsSequence = false;
                }

                if (previousDuration.as('hours') < 1) {
                    showTimestamp = false;
                }
            }

            if (next) {
                let nextMoment = moment(next.timestamp);
                let nextDuration = moment.duration(nextMoment.diff(currentMoment));
                nextBySameAuthor = next.author === current.author;

                if (nextBySameAuthor && nextDuration.as('hours') < 1) {
                    endsSequence = false;
                }
            }

            tempMessages.push(
                <Message
                    key={i}
                    isMine={isMine}
                    startsSequence={startsSequence}
                    endsSequence={endsSequence}
                    showTimestamp={showTimestamp}
                    data={current}
                />
            );

            // Proceed to the next message.
            i += 1;
        }

        return tempMessages;
    };

    render() {
        const { account, onSendMessage } = this.props;
        return (
            <div className='message-list'>
                <Toolbar
                    title='Conversation Title'
                    rightItems={[
                        <ToolbarButton key='info' icon='ion-ios-information-circle-outline' />,
                        <ToolbarButton key='video' icon='ion-ios-videocam' />,
                        <ToolbarButton key='phone' icon='ion-ios-call' />
                    ]}
                />

                <div className='message-list-container'>{this.renderMessages()}</div>

                <Compose
                    account={account}
                    onSendMessage={onSendMessage}
                    rightItems={[
                        <ToolbarButton key='photo' icon='ion-ios-camera' />,
                        <ToolbarButton key='image' icon='ion-ios-image' />,
                        <ToolbarButton key='audio' icon='ion-ios-mic' />,
                        <ToolbarButton key='money' icon='ion-ios-card' />,
                        <ToolbarButton key='games' icon='ion-logo-game-controller-b' />,
                        <ToolbarButton key='emoji' icon='ion-ios-happy' />
                    ]}/>
            </div>
        );
    }
}
