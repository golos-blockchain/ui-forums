import React from 'react';

import { Button } from 'semantic-ui-react';

import LoginModal from '@/elements/login/modal';
import { withRouter } from '@/utils/withRouter'

class ForumPostModeration extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            showConfirm: false
        };
    }

    showConfirm = () => {
        this.setState({showConfirm: true});
    };

    hideConfirm = () => {
        this.setState({showConfirm: false});
    };

    reload = () => {
        setTimeout(() => {
            this.props.router
                .withQuery('__preloading', '1', false)
                .push({
                    scroll: false,
                })
        }, 2000)
    }

    handleHidePost = () => {
        const moderator = this.props.account;
        this.props.actions.moderatorHidePostForum(moderator.key, moderator, this.props.topic, this.props.forum._id, this.props.forum)
        this.reload()
    };

    handleRevealPost = () => {
        const moderator = this.props.account;
        this.props.actions.moderatorRevealPostForum(moderator.key, moderator, this.props.topic, this.props.forum._id, this.props.forum)
        this.reload()
    };

    render() {
        const { forum, topic } = this.props; // account, moderation
        const moderatorRemoved = (topic._removedFrom && topic._removedFrom.indexOf(forum['_id']) >= 0);
        if (moderatorRemoved) {
        }
        //let processing = false;
        //let lastResult = false;
        const isHidden = !!forum.hidden[topic.id];
        /*if (moderation.last) {
            const last_topic = moderation.last.payload[1].topic;
            if (last_topic === topic._id) {
                processing = moderation.last.loading;
                if (!processing) {
                    let requestType = '';
                    switch (moderation.last.type) {
                        case 'MODERATION_REMOVE_RESOLVED':
                            requestType = 'removal'
                            break;
                        case 'MODERATION_RESTORE_RESOLVED':
                            requestType = 'restore'
                            break;
                        default:
                            requestType = 'unknown'
                            break;
                    }
                    lastResult = (
                        <Message icon color='yellow'>
                            <Icon name='circle notched' loading />
                            <Message.Content>
                                <Message.Header>Your {requestType} request has been broadcast to the blockchain.</Message.Header>
                                Please wait up to 5 minutes for your changes to show on chainBB.
                            </Message.Content>
                        </Message>
                    );
                }
            }
        }*/
        let actions = {signinAccount: isHidden ? this.handleRevealPost : this.handleHidePost,
            onClose: this.hideConfirm};
        return (
            <span>
                <Button size='small'
                    color={isHidden ? 'red' : 'blue'}
                    disabled={topic.author_banned}
                    icon={isHidden ? 'low vision' : 'eye'}
                    onClick={actions.signinAccount} />
                <LoginModal authType='active' noButton={true}
                    open={this.state.showConfirm}
                    actions={actions} />
            </span>
        );
    }
}

export default withRouter(ForumPostModeration)
