import React from 'react';

import { Dropdown, Header, Icon, Menu, Segment } from 'semantic-ui-react';
import AccountAvatar from './avatar';
//import AccountFollow from './follow';
import AccountBan from './ban';
import AccountLink from './link';
import AccountSidebarInfo from './sidebar/info';
import tt from 'counterpart';

export default class AccountSidebar extends React.Component {
    constructor(props) {
        super(props)
        const { username } = props.match.params;
        this.state = { username };
        props.actions.getAccounts([username]);
    }

    componentWillReceiveProps(nextProps) {
        const { username } = nextProps.match.params;
        if (username !== this.state.username) {
            this.setState({username});
            nextProps.actions.getAccounts([username]);
        }
    }

    render() {
        const { username } = this.state;
        const { account } = this.props;
        const withMsgsButton = (account && account.name && account.name !== username) || (!account || !account.name);
        const { isBanned, canIBan } = this.props;
        let sidebar = (<Segment padded='very' loading />);
        if (this.props.chainstate && this.props.chainstate.accounts && this.props.chainstate.accounts[username]) {
            sidebar = (<AccountSidebarInfo {...this.props} />);
        }
        return (
            <div>
                <Segment basic className='thread-author center aligned'>
                    <AccountAvatar
                        className='ui centered spaced rounded image'
                        noPopup={true}
                        size={150}
                        username={username}
                    />
                    <Header size='large'>
                        <AccountLink
                            noPopup={true}
                            username={username}
                            isBanned={isBanned}
                            withMsgsButton={withMsgsButton}
                        />
                    </Header>
                    {/*<AccountFollow
                        who={username}
                        {...this.props}
                    />*/}
                    {canIBan ? <AccountBan
                        who={username}
                        isBanned={isBanned}
                        {...this.props}
                    /> : null }
                </Segment>
                <Menu color='blue' inverted fluid vertical>
                    <Dropdown color='blue' text={tt('sidebar.view_this_account')} size='small' pointing='left' className='link item'>
                        <Dropdown.Menu>
                            <a href={`https://golos.id/@${username}`} target='_blank' rel='noreferrer' className='item'>
                                <Icon name='external' />
                                golos.id
                            </a>
                            <a href={`https://golos.in/@${username}`} target='_blank' rel='noreferrer' className='item'>
                                <Icon name='external' />
                                golos.in
                            </a>
                            <a href={`https://dpos.space/golos/profiles/${username}`} target='_blank' rel='noreferrer' className='item'>
                                <Icon name='external' />
                                dpos.space
                            </a>
                            <a href={`https://golos.cf/@${username}`} target='_blank' rel='noreferrer' className='item'>
                                <Icon name='external' />
                                golos.cf
                            </a>
                        </Dropdown.Menu>
                    </Dropdown>
                </Menu>
                {sidebar}
            </div>
        );
    }
}
