import React from 'react';

import ForumPostText from '@/elements/forum/post/types/text';

export default class ForumPost extends React.Component {
    constructor(props) {
        super(props)
        const isModerator = props && props.account && props.account.isUser && props.forum &&
            (props.forum.moders.includes(props.account.name) 
            || props.forum.supers.includes(props.account.name));
        this.state = {
            isModerator: isModerator,
            hovering: false,
            moderating: false,
        }
    }

    onMouseEnter = () => this.setState({hovering: true});

    onMouseLeave = () => this.setState({hovering: false});

    onOpen = () => this.setState({moderating: true});

    onClose = (removePost = false) => this.setState({moderating: false});

    render() {
        return (((this.props.topic.post_hidden || this.props.topic.author_banned) && !this.state.isModerator) ? null :
            <ForumPostText
                onMouseEnter={this.onMouseEnter.bind(this)}
                onMouseLeave={this.onMouseLeave.bind(this)}
                onOpen={this.onOpen.bind(this)}
                onClose={this.onClose.bind(this)}
                state={this.state}
                {... this.props}
            />
        );
    }
}
