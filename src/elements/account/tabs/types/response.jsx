import React from 'react';
import Link from 'next/link'

import { Header, Segment } from 'semantic-ui-react';

import TimeAgoWrapper from '@/utils/TimeAgoWrapper';
import AccountLink from '@/elements/account/link';
import { getForumName } from '@/utils/text';
import remarkableStripper from '@/utils/remarkableStripper';

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
                        <h3><Link href={topic.reply.url}>
                            <a>
                                RE: {topic.reply.root_title}
                            </a>
                        </Link></h3>
                        {remarkableStripper.render(topic.reply.body)}
                        <div style={{ height: '10px' }}>&nbsp;</div>
                        <Header.Subheader>
                            <Link href={topic.reply.url} passHref>
                                <a style={{color: 'gray'}}>
                                    {'↳ '}
                                    <TimeAgoWrapper date={`${topic.reply.created}Z`} live={false} />
                                    {' • '}
                                </a>
                            </Link>
                            <AccountLink username={topic.reply.author} isBanned={topic.reply.author_banned} />
                            {showForumName ? ' • ' : null}
                            {showForumName ? <Link href={'/f/' + forum._id}>{getForumName(forum)}</Link> : null}
                            {paginator}
                        </Header.Subheader>
                    </Header.Content>
                </Header>
            </Segment>
        );
    }
}
