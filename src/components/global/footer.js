import React, { Component } from 'react'
import { Container, Grid, Segment } from 'semantic-ui-react'
// import { Link } from 'react-router-dom'
import * as CONFIG from '../../../config';
import ttGetByKey from '../../utils/ttGetByKey';

export default class HeaderMenu extends Component {
  render() {
    return (
      <Segment inverted vertical className="footer" style={{marginTop: '1em'}}>
        <Container>
          <Grid stackable className="divided equal height stackable">
            {/*
            <Grid.Column width={3}>
              <h4 class="ui inverted header">About</h4>
              <List class="ui inverted link list">
                <Link to="#" className="item">Sitemap</Link>
                <Link to="#" className="item">Contact Us</Link>
                <Link to="#" className="item">Religious Ceremonies</Link>
                <Link to="#" className="item">Gazebo Plans</Link>
              </List>
            </Grid.Column>
            <Grid.Column width={3}>
              <h4 class="ui inverted header">Services</h4>
              <List class="ui inverted link list">
                <Link to="#" className="item">Banana Pre-Order</Link>
                <Link to="#" className="item">DNA FAQ</Link>
                <Link to="#" className="item">How To Access</Link>
                <Link to="#" className="item">Favorite X-Men</Link>
              </List>
            </Grid.Column>
            */}
            <Grid.Column width={16} textAlign='center' style={{margin: '0.5em 0 0.5em 0'}}>
              <h4 className="ui inverted header" dangerouslySetInnerHTML={{__html: ttGetByKey(CONFIG.FORUM, 'footer_title')}}></h4>
              <p dangerouslySetInnerHTML={{__html: ttGetByKey(CONFIG.FORUM, 'footer_description')}}></p>
            </Grid.Column>
          </Grid>
        </Container>
      </Segment>
    )
  }
}
