import React from 'react';

import ConversationSearch from '../../../components/elements/messages/ConversationSearch';
import ConversationListItem from '../../../components/elements/messages/ConversationListItem';
import Toolbar from '../../../components/elements/messages/Toolbar';
import ToolbarButton from '../../../components/elements/messages/ToolbarButton';

import './ConversationList.css';

export default class ConversationList extends React.Component {
    render() {
        const { conversationTopLeft,
            conversationSelected, conversationLinkPattern,
            onConversationAdd, onConversationSearch,
            onConversationSelect } = this.props;
        return (
            <div className='conversation-list'>
                <Toolbar
                    leftItems={conversationTopLeft}
                    rightItems={[
                        onConversationAdd ? (<ToolbarButton key='add' icon='ion-ios-add-circle-outline'
                            onClick={onConversationAdd} />) : undefined
                    ]}
                />
                <ConversationSearch onSearch={onConversationSearch} />
                {
                    this.props.conversations.map(conversation =>
                        <ConversationListItem
                            key={conversation.contact}
                            data={conversation}
                            selected={conversationSelected === conversation.contact}
                            conversationLinkPattern={conversationLinkPattern}
                            onConversationSelect={onConversationSelect}
                        />
                    )
                }
            </div>
        );
    }
}
