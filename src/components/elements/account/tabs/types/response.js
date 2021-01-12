import React from 'react';
import { Link } from 'react-router-dom';

import { Grid, Header, Icon, Segment } from 'semantic-ui-react';

import * as CONFIG from '../../../../../../config';

import TimeAgoWrapper from '../../../../../utils/TimeAgoWrapper';
import AccountAvatar from '../../avatar';
import AccountLink from '../../link';
import Paginator from '../../../forum/post/paginator';
import { getForumName } from '../../../../../utils/text';
import MarkdownViewer from '../../../../../utils/MarkdownViewer';

export default class AccountResponse extends React.Component {
    render() {
        let { account, forum, topic, showForumName } = this.props,
                control = null,
                paginator = false,
                last_reply = (
                    <Grid.Column mobile={6} tablet={6} computer={5} largeScreen={4} textAlign="center">
                    </Grid.Column>
                );
        return (
            <Segment
                attached
                key={topic.reply._id}
                onMouseEnter={this.props.onMouseEnter}
                onMouseLeave={this.props.onMouseLeave}
            >
                <Grid>
                    <Grid.Row
                        verticalAlign='middle'
                        >
                        <Grid.Column mobile={10} tablet={10} computer={9} largeScreen={9}>
                            <Header size='small'>
                                <Header.Content>
                                    <h3><Link to={topic.reply.url} >
                                        RE: {topic.reply.root_title}
                                    </Link></h3>
                                    <MarkdownViewer formId={'viewer'} text={topic.reply.body} jsonMetadata={{}} noImage={true} highQualityPost={false}  />
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
                        </Grid.Column>
                        <Grid.Column width={2} className="center aligned tablet or lower hidden">
                        </Grid.Column>
                        {last_reply}
                    </Grid.Row>
                </Grid>
            </Segment>
        );
    }
}
