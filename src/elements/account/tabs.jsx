import React from 'react';
import tt from 'counterpart';

import { Menu } from 'semantic-ui-react';

import AccountAbout from '@/elements/account/tabs/about';
import AccountPosts from '@/elements/account/tabs/posts';
import AccountResponses from '@/elements/account/tabs/responses';
import AccountDonates from '@/elements/account/tabs/donates';

class AccountTabs extends React.Component {
    constructor(props) {
        super(props);
    }

    getSection(props = undefined) {
        let section = (this.props || props).router.query.section
        section = section ? section[0] : 'about'
        return section
    }

    changeTab = (e, props) => {
        this.setState({tab: props.name});
        // Push the history if the tab has changed
        if (this.getSection() !== props.name) {
            const { username } = this.props.router.query
            this.props.router.push(`/@${username}/${props.name}`)
        }
    };

    render() {
        const tab = this.getSection()
        let content = false;
        switch (tab) {
            case 'responses': {
                content = (<AccountResponses {...this.props} />);
                break;
            }
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

export default AccountTabs
