import React from 'react';
import { Link } from 'react-router-dom'

import { Grid, Header, Icon, Segment } from 'semantic-ui-react'

import TimeAgoWrapper from '../../../utils/TimeAgoWrapper'
import UserAvatar from '../account/avatar'
import NumericLabel from '../../../utils/NumericLabel'
import ForumLink from '../../../utils/forumlink'

export default class ForumIndex extends React.Component {
  render() {
    const { _id, forum, isMinimized } = this.props;
    let lastPost = (forum.last_post) ? (new Date(forum.last_post['created']).getTime()) : 0,
        lastReply = (forum.last_reply) ? (new Date(forum.last_reply['created']).getTime()) : 0,
        highlight = (forum.highlight),
        newest = (lastPost > lastReply) ? 'last_post' : 'last_reply',
        { author, url, created, title } = (typeof forum[newest] === 'object') ? forum[newest] : {};
        if (newest == 'last_reply' && author) {
            title = forum['last_post'].title;
        }
    let latest_post = null,
        numberFormat = {
          shortFormat: true,
          shortFormatMinValue: 1000
        }
    if(title && title.length > 100) {
      title = title.substring(0, 100) + " ..."
    }
    if(author) {
      latest_post = <Header size='tiny'>
                      <UserAvatar
                          username={author}
                          style={{
                              minHeight: '35px',
                              marginBottom: '1em',
                          }}
                      />
                      <Link
                        to={`${url.split("#")[0]}`}
                        style={{
                          display: 'block',
                          maxHeight: '35px',
                          overflow: 'hidden'
                        }}>
                        {title}
                      </Link>
                      <Header.Subheader textAlign='right'>
                        {newest == 'last_reply' ? '↳ ' : '- '}
                        <Link to={`${url}`}>
                          <TimeAgoWrapper date={`${created}Z`} />
                        </Link>
                      </Header.Subheader>
                    </Header>
    }
    let childs = [];
    if (forum.children)
      for (let [_id, f] of Object.entries(forum.children)) {
        childs.push(<span key={_id}>{" • "}<ForumLink _id={_id} forum={f}/></span>);
      }
    return (
      <Segment
        attached
        key={_id}
        style={{
            background: highlight ? "#ececec" : "",
            display: isMinimized ? "none" : ""
        }}
        >
        <Grid>
          <Grid.Row
            verticalAlign='middle'
            >
            <Grid.Column computer={7} tablet={9} mobile={8}>
              <Header size='medium'>
                <Icon color='blue' name={highlight ? 'pin' : 'list'} />
                <Header.Content>
                  <ForumLink _id={_id} forum={forum}/>
                  <Header.Subheader style={{marginTop: '0.1rem'}}>
                    {
                      (forum.description)
                        ? forum.description
                        : ''
                    }
                  </Header.Subheader>
                  {childs.length ? 
                      <Header.Subheader style={{marginTop: '0.1rem'}}>
                        {childs}
                      </Header.Subheader> : null}
                </Header.Content>
              </Header>
            </Grid.Column>
            <Grid.Column width={2} className='tablet or lower hidden' textAlign='center'>
              <Header size='medium'>
                <NumericLabel params={numberFormat}>{(forum.stats) ? forum.stats.posts : '?'}</NumericLabel>
              </Header>
            </Grid.Column>
            <Grid.Column width={2} className='tablet or lower hidden' textAlign='center'>
              <Header size='medium'>
                <NumericLabel params={numberFormat}>{(forum.stats) ? forum.stats.comments : '?'}</NumericLabel>
              </Header>
            </Grid.Column>
            <Grid.Column computer={5} tablet={6} mobile={8}>
              {latest_post}
            </Grid.Column>
          </Grid.Row>
        </Grid>
      </Segment>
    )
  }
}
