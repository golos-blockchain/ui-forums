import React from 'react';

import { Grid, Header, Icon, List, Popup, Segment } from 'semantic-ui-react'
import { Link } from 'react-router-dom'

import TimeAgoWrapper from '../../../utils/TimeAgoWrapper'
import PlatformLink from '../../../utils/link/platform'
import AccountAvatar from '../account/avatar'
import AccountLink from '../account/link'
import PostVotes from '../../../containers/post/votes'

export default class PostTitle extends React.Component {
  render() {
    const { content } = this.props
    let rootTitle = false
    if(this.props.op) {
      rootTitle = (
        <Segment inverted color='blue' attached stacked={(this.props.page !== 1)} verticalAlign='top'>
          <Header size='large'>
            <Icon name='comments' />
            <Header.Content as='h1'>
              <Link to={`/${(content.namespace) ? content.namespace : content.category}/@${content._id}`} style={{color: '#ececec'}}>
                {content.title}
              </Link>
            </Header.Content>
          </Header>
        </Segment>
      )
    }
    return (
      <div>
        {rootTitle}
        <Segment secondary attached>
          <Grid>
            <Grid.Row verticalAlign='top'>
              <Grid.Column tablet={8} computer={8} mobile={12}>
                <Header size='medium'>
                  <AccountAvatar username={content.author} />
                  <AccountLink username={content.author} />
                  <Header.Subheader>
                    {'↳ '}
                    <TimeAgoWrapper date={`${content.created}Z`} live={false} />
                  </Header.Subheader>
                </Header>
              </Grid.Column>
              <Grid.Column tablet={8} computer={8} mobile={4} textAlign='right' verticalAlign='middle'>
              </Grid.Column>
            </Grid.Row>
          </Grid>
        </Segment>
      </div>
    )
  }
}
