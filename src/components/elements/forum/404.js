import React from 'react';
import tt from 'counterpart';

import { Button, Divider, List, Header, Popup, Segment } from 'semantic-ui-react'
import { Link } from 'react-router-dom'

export default class Forum404 extends React.Component {

  render() {
    let forum = this.props.forum,
        isUser = this.props.isUser,
        showNewPost = this.props.showNewPost,
        button = (
          <Popup
            trigger={
              <Button size='large'>
                <i className='pencil icon'></i>
                {tt('forum_controls.be_first_button')}
              </Button>
            }
            position='bottom center'
            inverted
            content={tt('forum_controls.you_must_be_logged_in_to_post')}
            basic
          />
        )
    if(isUser) {
      button = (
        <Button primary onClick={showNewPost}>
          <i className='pencil icon'></i>
          {tt('forum_controls.be_first_button')}
        </Button>
      )
    }
    return (
      <Segment textAlign='center' padded='very'>
        <Header size='huge'>
          {tt('forum_controls.no_posts')}
          <Header.Subheader>
            <p>{tt('forum_controls.no_posts_description')}</p>
            {button}
          </Header.Subheader>
        </Header>
      </Segment>
    )
  }
}
