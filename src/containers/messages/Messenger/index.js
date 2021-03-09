import React from 'react';

import ConversationList from '../ConversationList';
import MessageList from '../MessageList';
import './Messenger.css';

export default class Messages extends React.Component {
    render() {
        const { account, to,
            contacts, conversationTopLeft, conversationLinkPattern,
            onConversationAdd, onConversationSelect,
            messages, onSendMessage } = this.props;
        return (
            <div className='messenger'>
                {/* <Toolbar
                    title='Messenger'
                    leftItems={[
                        <ToolbarButton key='cog' icon='ion-ios-cog' />
                    ]}
                    rightItems={[
                        <ToolbarButton key='add' icon='ion-ios-add-circle-outline' />
                    ]}
                /> */}

                {/* <Toolbar
                    title='Conversation Title'
                    rightItems={[
                        <ToolbarButton key='info' icon='ion-ios-information-circle-outline' />,
                        <ToolbarButton key='video' icon='ion-ios-videocam' />,
                        <ToolbarButton key='phone' icon='ion-ios-call' />
                    ]}
                /> */}

                <div className='scrollable sidebar'>
                    <ConversationList
                        conversationTopLeft={conversationTopLeft}
                        account={account}
                        conversations={contacts}
                        conversationSelected={to}
                        conversationLinkPattern={conversationLinkPattern}
                        onConversationAdd={onConversationAdd}
                        onConversationSelect={onConversationSelect} />
                </div>

                <div className='scrollable content'>
                    <MessageList
                        account={account}
                        messages={messages}
                        onSendMessage={onSendMessage} />
                </div>
            </div>
        );
    }
}
