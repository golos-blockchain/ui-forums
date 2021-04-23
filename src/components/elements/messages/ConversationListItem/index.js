import React from 'react';
import { Link } from 'react-router-dom';
//import shave from 'shave';
import truncate from 'lodash/truncate';

import './ConversationListItem.css';

export default class ConversationListItem extends React.Component {
    makeLink = () => {
        const { conversationLinkPattern } = this.props;
        if (conversationLinkPattern) {
            const {  contact } = this.props.data;
            return conversationLinkPattern.replace('*', contact);
        }
        return null;
    };

    onClick = (event) => {
        const { onConversationSelect } = this.props;
        if (onConversationSelect) {
            event.preventDefault();
            onConversationSelect(this.props.data, this.makeLink(), event);
        }
    };

    render() {
        const { selected } = this.props;
        const { avatar, isSystemMessage, contact, last_message, size } = this.props.data;

        const link = this.makeLink();

        let last_body = null;
        if (last_message) {
            const { message } = last_message;
            if (message) {
                last_body = message.body;
            }
        }

        const unreadMessages = size && size.unread_inbox_messages;

        return (
            <Link to={isSystemMessage ? '/msgs/' : link} onClick={this.onClick} className={'conversation-list-item' + (selected ? ' selected' : '')}>
                <img className='conversation-photo' src={avatar} alt='404 :(' />
                <div className='conversation-info'>
                    <h1 className='conversation-title'>{contact}</h1>
                    <div className='conversation-snippet'>{last_body && truncate(last_body, {length: 35})}
                    </div>
                    {unreadMessages ? <div className='conversation-unread'>{unreadMessages}</div> : null}
                </div>
            </Link>
        );
    }
}
