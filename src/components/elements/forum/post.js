import React from 'react';
import slug from 'slug'

import ForumPostText from './post/types/text'
// import ForumPostThumbnail from './post/types/thumbnail'

export default class ForumPost extends React.Component {
    constructor(props) {
        super(props)
        const isModerator = props && props.account && props.account.isUser && 
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

    changeFilter = (e, data) => {
        const tag = slug(data.value).toString();
        this.props.changeFilter(tag);
    }

    render() {
        return ((this.props.topic.hidden && !this.state.isModerator) ? null :
            <ForumPostText
                onMouseEnter={this.onMouseEnter.bind(this)}
                onMouseLeave={this.onMouseLeave.bind(this)}
                onOpen={this.onOpen.bind(this)}
                onClose={this.onClose.bind(this)}
                state={this.state}
                {... this.props}
            />
            // <ForumPostThumbnail
            //   state={this.state}
            //   {... this.props}
            // />
        )
    }
}
