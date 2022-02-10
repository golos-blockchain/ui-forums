import React from 'react'
import tt from 'counterpart'

import { Dropdown, Header, Icon, Menu, Segment } from 'semantic-ui-react'

import AccountAvatar from '@/elements/account/avatar'
import AccountBan from '@/elements/account/ban'
import AccountLink from '@/elements/account/link'
import AccountSidebarInfo from '@/elements/account/sidebar/info'

export default class AccountSidebar extends React.Component {
    constructor(props) {
        super(props)
    }

    render() {
        const { username } = this.props.router.query
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
