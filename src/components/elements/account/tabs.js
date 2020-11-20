import React from 'react';

import { Menu } from 'semantic-ui-react'
import AccountPosts from './tabs/posts'
import AccountReplies from './tabs/replies'
import AccountResponses from './tabs/responses'
import tt from 'counterpart';

export default class AccountActivity extends React.Component {
  constructor(props) {
    super(props)
    this.state = {
      tab: 'posts'
    }
  }
  changeTab = (e, props) => {
    this.setState({tab: props.name})
  }
  render() {
    const { tab } = this.state;
    let content = false
    switch(tab) {
      case "responses": {
        content = <AccountResponses {...this.props} />
        break;
      }
      case "replies": {
        content = <AccountReplies {...this.props} />
        break;
      }
      default: {
        content = <AccountPosts {...this.props} />
        break;
      }
    }
    return (
      <div>
        <Menu pointing color="blue" attached="top" size="large" secondary>
          <Menu.Item name='posts' active={tab === 'posts'} onClick={this.changeTab}>{tt('account.posts')}</Menu.Item>
          <Menu.Item name='responses' active={tab === 'responses'} onClick={this.changeTab}>{tt('account.responses')}</Menu.Item>
          <Menu.Item name='replies' active={tab === 'replies'} onClick={this.changeTab}>{tt('account.replies')}</Menu.Item>
        </Menu>
        {content}
      </div>
    )
  }
}
