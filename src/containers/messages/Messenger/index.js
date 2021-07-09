import React from 'react';

import ConversationList from '../ConversationList';
import MessageList from '../MessageList';
import './Messenger.css';

export default class Messages extends React.Component {
    render() {
        const { account, to,
            contacts, conversationTopLeft, conversationLinkPattern,
            onConversationAdd, onConversationSearch, onConversationSelect,
            messagesTopLeft, messagesTopCenter, messagesTopRight, messages, replyingMessage, onCancelReply, onSendMessage,
            onButtonImageClicked,
            selectedMessages, onMessageSelect, onPanelDeleteClick, onPanelReplyClick, onPanelEditClick, onPanelCloseClick } = this.props;

        let isMobile = false;
        if (typeof(window) !== 'undefined') {
            isMobile = window.matchMedia('screen and (max-width: 39.9375em)').matches;
        }

        return (
            <div className='messenger'>
                {(!isMobile || !to) ? <div className='msgs-scrollable msgs-sidebar'>
                    <ConversationList
                        conversationTopLeft={conversationTopLeft}
                        account={account}
                        conversations={contacts}
                        conversationSelected={to}
                        conversationLinkPattern={conversationLinkPattern}
                        onConversationAdd={onConversationAdd}
                        onConversationSearch={onConversationSearch}
                        onConversationSelect={onConversationSelect} />
                </div> : null}

                {(!isMobile || to) ? <div className='msgs-scrollable msgs-content'>
                    <MessageList
                        account={account}
                        to={to}
                        topLeft={messagesTopLeft}
                        topCenter={messagesTopCenter}
                        topRight={messagesTopRight}
                        messages={messages}
                        replyingMessage={replyingMessage}
                        onCancelReply={onCancelReply}
                        onSendMessage={onSendMessage}
                        selectedMessages={selectedMessages}
                        onMessageSelect={onMessageSelect}
                        onPanelDeleteClick={onPanelDeleteClick}
                        onPanelReplyClick={onPanelReplyClick}
                        onPanelEditClick={onPanelEditClick}
                        onPanelCloseClick={onPanelCloseClick}
                        onButtonImageClicked={onButtonImageClicked}
                        />
                </div> : null}
            </div>
        );
    }
}
