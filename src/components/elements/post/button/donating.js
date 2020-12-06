import React from 'react';
import tt from 'counterpart';

import { Button, Popup, Dropdown, Icon, Label } from 'semantic-ui-react'
//import VoteButtonOptions from './vote/options'
import translateError from '../../../../utils/translateError'

export default class Donating extends React.Component {
  render() {
    let post = this.props.post;
    let donates = parseInt(parseFloat(post.donates.split(' ')[0])) + ' GOLOS';
    if (post.donates_uia != 0) {
      donates += ' (+' + post.donates_uia + ')';
    }
    return (<div style={{float: 'left'}}>
      &nbsp;&nbsp;&nbsp;
        <Button as='div' labelPosition='right'>
          <Button color='blue'>
            <Icon name='dollar' />
            {tt('donating.donate')}
          </Button>
          <Label as='a' basic color='blue' pointing='left'>
            <Dropdown text={donates}>
            <Dropdown.Menu>
              <Dropdown.Item text='1' description='2' key='0'/>
            </Dropdown.Menu>
            </Dropdown>
          </Label>
        </Button>
      </div>)
  }
}
