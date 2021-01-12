import React from 'react';
import { withRouter } from 'react-router-dom';
import tt from 'counterpart';

import { Menu } from 'semantic-ui-react';

import AccountAbout from './tabs/about';
import AccountPosts from './tabs/posts';
//import AccountReplies from './tabs/replies0';
import AccountResponses from './tabs/responses';
import AccountDonates from './tabs/donates';

class AccountActivity extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            tab: this.props.match.params.section || 'about'
        };
    }

    changeTab = (e, props) => {
        this.setState({tab: props.name});
        // Push the history if the tab has changed
        if (this.props.match.params.section !== props.name) {
            this.props.history.push(`/@${this.props.match.params.username}/${props.name}`);
        }
    };

    render() {
        const { tab } = this.state;
        let content = false;
        switch (tab) {
            case 'responses': {
                content = (<AccountResponses {...this.props} />);
                break;
            }
            /*case 'replies': {
                content = (<AccountReplies {...this.props} />);
                break;
            }*/
            case 'posts': {
                content = (<AccountPosts {...this.props} />);
                break;
            }
            case 'donates_from': {
                content = (<AccountDonates {...this.props} direction={'from'} />);
                break;
            }
            case 'donates_to': {
                content = (<AccountDonates {...this.props} direction={'to'} />);
                break;
            }
            default: {
                content = (<AccountAbout {...this.props} />);
                break;
            }
        }
        return (
            <div>
                <Menu pointing color='blue' attached='top' size='large' secondary>
                    <Menu.Item name='about' active={tab === 'about'} onClick={this.changeTab}>{tt('account.about')}</Menu.Item>
                    <Menu.Item name='posts' active={tab === 'posts'} onClick={this.changeTab}>{tt('account.posts')}</Menu.Item>
                    <Menu.Item name='responses' active={tab === 'responses'} onClick={this.changeTab}>{tt('account.responses')}</Menu.Item>
                    <Menu.Item name='donates_from' active={tab === 'donates_from'} onClick={this.changeTab}>{tt('account.donates_from')}</Menu.Item>
                    <Menu.Item name='donates_to' active={tab === 'donates_to'} onClick={this.changeTab}>{tt('account.donates_to')}</Menu.Item>
                </Menu>
                {content}
            </div>
        );
    }
}

export default withRouter(AccountActivity);
