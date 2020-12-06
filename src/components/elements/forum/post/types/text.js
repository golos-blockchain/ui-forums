import React from 'react';
import { Grid, Header, Icon, Segment } from 'semantic-ui-react'
import { Link } from 'react-router-dom'

import * as CONFIG from '../../../../../../config';

import TimeAgoWrapper from '../../../../../utils/TimeAgoWrapper'
import AccountAvatar from '../../../account/avatar'
import AccountLink from '../../../account/link'
import Paginator from '../paginator'
import ForumPostModeration from '../moderation'

export default class ForumPostText extends React.Component {
  render() {
    let { account, forum, moderation, topic } = this.props,
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
            : <Icon name='circle thin' />
        ,
        paginator = false,
        last_reply = (
          <Grid.Column mobile={6} tablet={6} computer={5} largeScreen={4} textAlign="center">
            No Replies
          </Grid.Column>
        )
    if(topic.children > 10) {
      paginator = (
        <Paginator
          perPage={10}
          total={topic.children}
          url={topic.url}
        />
      )
    }
    if(topic.last_reply) {
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
              <Link to={topic.last_reply_url}>
                <TimeAgoWrapper date={`${topic.last_reply}Z`} live={false} />
              </Link>
            )
            : (
              <TimeAgoWrapper date={`${topic.last_reply}Z`} live={false} />
            )
          }
        </Grid.Column>
      )
    }
    if(this.props.state.isModerator && (this.props.state.hovering || this.props.state.moderating)) {
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
      )
    }
    const forum_url_prefix = '/fm-' + CONFIG.FORUM._id + '-';
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
                  <Link to={'/' + topic.url.substring(forum_url_prefix.length)}>
                    {topic.title}
                  <Header.Subheader>
                    {'↳ '}
                    <TimeAgoWrapper date={`${topic.created}Z`} live={false} />
                    {' • '}
                    <AccountLink username={topic.author} />
                    {paginator}
                  </Header.Subheader>
                  </Link>
                </Header.Content>
              </Header>
            </Grid.Column>
            <Grid.Column width={2} className="center aligned tablet or lower hidden">
              <Header size='small'>
                {topic.children}
              </Header>
            </Grid.Column>
          </Grid.Row>
        </Grid>
      </Segment>
    )
  }
}
