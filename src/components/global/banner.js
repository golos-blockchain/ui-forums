import React, { Component } from 'react'
import { Container, Grid } from 'semantic-ui-react'
import * as CONFIG from '../../../config';

class BannerMenu extends Component {

  render() {
    return (
      <Container>
        <Grid stackable>
          <Grid.Row verticalAlign='middle'>
            <Grid.Column width={10} only='large screen' className='banner'>
              <p dangerouslySetInnerHTML={{__html: (CONFIG.FORUM.footer_banner)}}></p>
            </Grid.Column>
          </Grid.Row>
        </Grid>
      </Container>
    )
  }
}

export default (BannerMenu);
