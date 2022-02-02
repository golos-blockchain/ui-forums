import React from 'react';
import Link from 'next/link';

import { Grid, Header, Icon, Segment } from 'semantic-ui-react';

import TimeAgoWrapper from '@/utils/TimeAgoWrapper';
import AccountAvatar from '@/elements/account/avatar';
import AccountLink from '@/elements/account/link';
import Paginator from '@/elements/forum/post/paginator';
import ForumPostModeration from '@/elements/forum/post/moderation';
import { getForumName } from '@/utils/text';

export default class ForumPostText extends React.Component {
    render() {
        let { account, forum, moderation, topic, showForumName } = this.props,
                moderatorRemoved = (topic._removedFrom && topic._removedFrom.indexOf(forum['_id']) >= 0),
                control =
                        (moderatorRemoved)
                        ? <Icon name='trash' />
                        : (topic.cbb && topic.cbb.sticky)
                        ? <Icon name='pin' />
                        : (topic.children > 50)
                        ? <Icon color='blue' name='chevron right' />
                        : (topic.children > 20)
                        ? <Icon color='blue' name='angle double right' />
                        : (topic.children > 0)
                        ? <Icon color='blue' name='angle right' />
                        : <Icon name='circle outline' />
                ,
                paginator = false,
                last_reply = (
                    <Grid.Column mobile={6} tablet={6} computer={5} largeScreen={4} textAlign="center">
                    </Grid.Column>
                );
        if (topic.children > $GLS_Config.forum.replies_per_page) {
            paginator = (
                <Paginator
                    perPage={$GLS_Config.forum.replies_per_page}
                    total={topic.children}
                    url={topic.url}
                />
            );
        }
        if (topic.last_reply) {
            last_reply = (
                <Grid.Column mobile={6} tablet={6} computer={4} largeScreen={4} widescreen={4}>
                    <AccountAvatar
                        username={topic.last_reply_by}
                        style={{minHeight: '35px', minWidth: '35px', marginBottom: 0}}
                    />
                    <AccountLink username={topic.last_reply_by} />
                    <br/>
                    {(topic.last_reply_url)
                        ? (
                            <Link href={topic.last_reply_url}>
                                <a>
                                    <TimeAgoWrapper date={`${topic.last_reply}Z`} live={false} />
                                </a>
                            </Link>
                        )
                        : (
                            <TimeAgoWrapper date={`${topic.last_reply}Z`} live={false} />
                        )
                    }
                </Grid.Column>
            );
        }
        if (this.props.state.isModerator) {
            control = (
                <ForumPostModeration
                    account={account}
                    actions={this.props.actions}
                    forum={forum}
                    moderation={moderation}
                    topic={topic}
                    onOpen={this.props.onOpen}
                    onClose={this.props.onClose}
                    removeTopic={this.props.removeTopic}
                />
            );
        }
        return (
            <Segment
                attached
                key={topic._id}
                onMouseEnter={this.props.onMouseEnter}
                onMouseLeave={this.props.onMouseLeave}
                tertiary={moderatorRemoved}
            >
                <Grid>
                    <Grid.Row
                        verticalAlign='middle'
                        >
                        <Grid.Column width={1} textAlign="center" className="center aligned tablet or lower hidden">
                            {control}
                        </Grid.Column>
                        <Grid.Column mobile={10} tablet={10} computer={9} largeScreen={9}>
                            <Header size='small'>
                                <Header.Content>
                                    <Link href={topic.url}>
                                        {topic.title}
                                    </Link>
                                    <Header.Subheader>
                                        <Link href={topic.url}>
                                            <a style={{color: 'gray'}}>
                                                {'↳ '}
                                                <TimeAgoWrapper date={`${topic.created}Z`} live={false} />
                                                {' • '}
                                            </a>
                                        </Link>
                                        <AccountLink username={topic.author} isBanned={topic.author_banned} />
                                        {showForumName ? ' • ' : null}
                                        {showForumName ? <Link href={'/f/' + forum._id}>{getForumName(forum)}</Link> : null}
                                        {paginator}
                                    </Header.Subheader>
                                </Header.Content>
                            </Header>
                        </Grid.Column>
                        <Grid.Column width={2} className="center aligned tablet or lower hidden">
                            <Header size='small'>
                                {topic.children}
                            </Header>
                        </Grid.Column>
                        {last_reply}
                    </Grid.Row>
                </Grid>
            </Segment>
        );
    }
}
