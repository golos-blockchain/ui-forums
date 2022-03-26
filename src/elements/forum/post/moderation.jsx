import React from 'react';

import { Button } from 'semantic-ui-react';

import { withRouter } from '@/utils/withRouter'

class ForumPostModeration extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
        };
    }

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
        const isHidden = !!forum.hidden[topic.id];
        let action = isHidden ? this.handleRevealPost : this.handleHidePost
        return (
            <span>
                <Button size='small'
                    color={isHidden ? 'red' : 'blue'}
                    disabled={topic.author_banned}
                    icon={isHidden ? 'low vision' : 'eye'}
                    onClick={action} />
            </span>
        );
    }
}

export default withRouter(ForumPostModeration)
