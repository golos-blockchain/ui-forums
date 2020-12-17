import React from 'react';
import tt from 'counterpart';

import { Menu } from 'semantic-ui-react';

import AccountAbout from './tabs/about';
import AccountPosts from './tabs/posts';
import AccountReplies from './tabs/replies';
import AccountResponses from './tabs/responses';

export default class AccountActivity extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            tab: 'about'
        };
    }

    changeTab = (e, props) => {
        this.setState({tab: props.name});
    };

    render() {
        const { tab } = this.state;
        let content = false;
        switch (tab) {
            case "responses": {
                content = (<AccountResponses {...this.props} />);
                break;
            }
            case "replies": {
                content = (<AccountReplies {...this.props} />);
                break;
            }
            case "posts": {
                content = (<AccountPosts {...this.props} />);
                break;
            }
            default: {
                content = (<AccountAbout {...this.props} />);
                break;
            }
        }
        return (
            <div>
                <Menu pointing color="blue" attached="top" size="large" secondary>
                    <Menu.Item name='about' active={tab === 'about'} onClick={this.changeTab}>{tt('account.about')}</Menu.Item>
                    {/*<Menu.Item name='posts' active={tab === 'posts'} onClick={this.changeTab}>{tt('account.posts')}</Menu.Item>
                    <Menu.Item name='responses' active={tab === 'responses'} onClick={this.changeTab}>{tt('account.responses')}</Menu.Item>
                    <Menu.Item name='replies' active={tab === 'replies'} onClick={this.changeTab}>{tt('account.replies')}</Menu.Item>*/}
                </Menu>
                {content}
            </div>
        );
    }
}
