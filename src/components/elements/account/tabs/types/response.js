import React from 'react';
import { Link } from 'react-router-dom';

import { Header, Segment } from 'semantic-ui-react';

import TimeAgoWrapper from '../../../../../utils/TimeAgoWrapper';
import AccountLink from '../../link';
import { getForumName } from '../../../../../utils/text';
import remarkableStripper from '../../../../../utils/remarkableStripper';

export default class AccountResponse extends React.Component {
    render() {
        let { forum, topic, showForumName } = this.props,
            paginator = false;
        return (
            <Segment
                attached
                key={topic.reply._id}
                onMouseEnter={this.props.onMouseEnter}
                onMouseLeave={this.props.onMouseLeave}
            >
                <Header size='small' style={{ fontWeight: 'normal' }}>
                    <Header.Content>
                        <h3><Link to={topic.reply.url} >
                            RE: {topic.reply.root_title}
                        </Link></h3>
                        {remarkableStripper.render(topic.reply.body)}
                        <div style={{ height: '10px' }}>&nbsp;</div>
                        <Header.Subheader>
                            <Link to={topic.reply.url} style={{color: 'gray'}}>
                                {'↳ '}
                                <TimeAgoWrapper date={`${topic.reply.created}Z`} live={false} />
                                {' • '}
                            </Link>
                            <AccountLink username={topic.reply.author} isBanned={topic.reply.author_banned} />
                            {showForumName ? ' • ' : null}
                            {showForumName ? <Link to={'/f/' + forum._id}>{getForumName(forum)}</Link> : null}
                            {paginator}
                        </Header.Subheader>
                    </Header.Content>
                </Header>
            </Segment>
        );
    }
}
