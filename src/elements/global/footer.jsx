import React, { Component } from 'react'

import { Container, Grid, Segment } from 'semantic-ui-react'

import ttGetByKey from '@/utils/ttGetByKey';

export default class FooterMenu extends Component {
  render() {
    return (
      <Segment inverted vertical className="footer" style={{marginTop: '1em'}}>
        <Container>
          <Grid stackable className="divided equal height stackable">
            <Grid.Column width={16} textAlign='center' style={{margin: '0.5em 0 0.5em 0'}}>
              <h4 className="ui inverted header" dangerouslySetInnerHTML={{__html: ttGetByKey($GLS_Config.forum, 'footer_title')}}></h4>
              <p dangerouslySetInnerHTML={{__html: ttGetByKey($GLS_Config.forum, 'footer_description')}}></p>
            </Grid.Column>
          </Grid>
        </Container>
      </Segment>
    )
  }
}
