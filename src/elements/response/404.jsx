import React from 'react';
import tt from 'counterpart';

import { Grid, Header, Segment } from 'semantic-ui-react'

export default class Response404 extends React.Component {
  render() {
    return (
      <Grid.Row centered>
        <Grid.Column width={12}>
          <Segment basic padded>
            <Header size='huge' textAlign='center'>
              {tt('forum_controls.no_comments')}
              <Header.Subheader>
                {tt('forum_controls.no_comments_description')}
              </Header.Subheader>
            </Header>
          </Segment>
        </Grid.Column>
      </Grid.Row>
    )
  }
}
