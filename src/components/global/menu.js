import React, { Component } from 'react'
import { bindActionCreators } from 'redux';
import { connect } from 'react-redux';
import { Link, withRouter } from 'react-router-dom';
import tt from 'counterpart';
import ttGetByKey from '../../utils/ttGetByKey';
import { Asset } from 'golos-lib-js/lib/utils';

import { Button, Container, Dropdown, Grid, Header, Icon, Label, Menu, Popup } from 'semantic-ui-react';

import * as CONFIG from '../../../config';
import * as accountActions from '../../actions/accountActions';
import * as accountsActions from '../../actions/accountsActions';
import * as statusActions from '../../actions/statusActions';

import LoginButton from '../elements/login/button';
import LogoutItem from '../elements/login/logout';
import AccountAvatar from '../elements/account/avatar';
import { authRegisterUrl } from '../../utils/AuthApiClient';

class HeaderMenu extends Component {
    state = {
        isClaiming: false,
        hasBalance: false
    };

    componentDidMount() {
        if (!this.props.account || !this.props.account.data) {
            this.props.actions.fetchAccount(this.props.account.name);
        }

        const fixMemo = (account) => {
            const memoKey = localStorage.getItem('memoKey');
            if (memoKey && !account.memoKey) {
                this.props.actions.signinAccount(account.name, '', memoKey);
            }
        };
        this.interval = setInterval(() => {
            if (localStorage.getItem('notifyEnabled')) {
                const { account} = this.props;
                fixMemo(account);
                this.props.actions.fetchAccount(account.name);
            }
        }, 60000);
        this.intervalNotify = setInterval(() => {
            if (localStorage.getItem('notifyEnabled')) {
                const { account} = this.props;
                fixMemo(account);
                this.props.actions.fetchAccountNotifications(account.name);
            }
        }, 5000);
    }

    componentWillUnmount() {
        clearInterval(this.interval);
        clearInterval(this.intervalNotify);
    }

    UNSAFE_componentWillReceiveProps(nextProps) {
        if (nextProps.account && nextProps.account.data) {
            const { data } = nextProps.account;
            let hasBalance = [data.tip_balance];
            for (let [, obj] of Object.entries(data.uia_balances)) {
                hasBalance.push(obj.tip_balance);
            }
            this.setState({ hasBalance, isClaiming: false });
        }
    }

    handleClaim = () => {
        const account = this.props.account;
        const data = account.data;
        const reward_sbd = data.reward_sbd_balance;
        const reward_steem = data.reward_steem_balance;
        const reward_vests = data.reward_vesting_balance;
        this.setState({ isClaiming: true });
        this.props.actions.claimRewards({ account, reward_sbd, reward_steem, reward_vests });
    };

    vests_to_sp(vests) {
        return Math.round(vests / 1e6 * this.props.status.network.steem_per_mvests * 1000) / 1000;
    }

    toggleLocale = (e, { value }) => {
        if (typeof(window) === 'undefined') return;
        if (localStorage.getItem('locale') === value) return;
        localStorage.setItem('locale', value);
        tt.setLocale(value);
        window.location.reload();
    };

    render() {
        const { account } = this.props;
        const { name, notifications } = account;
        const notifiLabel = notifications && notifications.message > 0 ?
            (<Label content={notifications.message} color='red' />) : null
        const { hasBalance } = this.state;
        let data = {};
        let avatar = false;
        let pendingBalance = false;
        let locale = (typeof(localStorage) !== 'undefined' && localStorage.getItem('locale')) || 'ru';
        const options = [
            { key: 1, text: 'RU', value: 'ru' },
            { key: 2, text: 'EN', value: 'en' },
        ];
        let localeSelect = (
            <Menu.Item>
                <Dropdown
                    text={locale.toUpperCase()}
                    onChange={this.toggleLocale}
                    options={options}
                    value={locale}>
                </Dropdown>
            </Menu.Item>
        );
        let userItem = (
            <Menu.Item>
                <Button
                    as='a' href={authRegisterUrl()}
                    content={tt('login.sign_up')}
                    color='blue'
                    inverted/>
                &nbsp;&nbsp;
                <LoginButton {... this.props}/>
            </Menu.Item>
        );
        /*const indicator = (!loading) ? (
            <Popup
                trigger={
                    <Icon name='checkmark' />
                }
                position='bottom center'
                inverted
                content={`Golos Blockchain - OK`}
                basic
            />
        ) : (
            <Popup
                trigger={
                    <Icon loading name='asterisk' />
                }
                position='bottom center'
                inverted
                content={`Connecting to the Golos blockchain`}
                basic
            />
        );*/
        if (name) {
            if (account) {
                data = account.data;
            }
            avatar = (
                <AccountAvatar
                    className=''
                    noLink={true}
                    size={35}
                    style={{margin: 0}}
                    username={name}
                    notifications={notifications ? Math.max(notifications.message, 0) : 0}
                />
            );
            /*userItem = (
                <Dropdown style={{padding: '0 1.1em'}} item trigger={avatar} pointing='top right' icon={null} className='icon'>
                    <Dropdown.Menu>
                        <Dropdown.Item as={Link} to={`/@${name}`} icon='user' content={tt('account.profile')} />
                        <Dropdown.Item as={Link} to={`/accounts`} icon='users' content='Accounts' />
                        <LogoutItem {...this.props} />
                    </Dropdown.Menu>
                </Dropdown>
            );*/
            userItem = (
                <Dropdown style={{padding: '0 1.1em'}} item trigger={avatar} pointing='top right' icon={null} className='icon'>
                    <Dropdown.Menu>
                        <Dropdown.Item as={Link} to={`/@${name}`} icon='user' content={tt('account.profile')} />
                        <Dropdown.Item as={Link} to={`/@${name}/responses`} icon='comments' content={tt('account.responses')} />
                        <Dropdown.Item as={Link} label={notifiLabel} target='_blank' to={`/msgs/`} icon='envelope' content={tt('g.messages')} />
                        <Dropdown.Item as={Link} target='_blank' to={`https://golos.id/@${name}`} icon='users' content={tt('account.blogs')} />
                        <LogoutItem {...this.props} />
                    </Dropdown.Menu>
                </Dropdown>
            );
            if (data) {
                if (hasBalance.length > 0) {
                    pendingBalance = (
                        <Popup
                            trigger={
                                <Menu.Item style={{padding: '0 1.1em'}}>
                                    <Icon name='gift' size='big' style={{margin: 0}} />
                                    &nbsp;{hasBalance[0]}
                                </Menu.Item>
                            }
                            hoverable
                        >
                            <Grid>
                                <Grid.Row columns={1}>
                                    <Grid.Column>
                                        <Header>
                                            {tt('account.tip_balance')}
                                            <Header.Subheader>
                                                {tt('account.tip_balance_desc')}
                                            </Header.Subheader>
                                        </Header>
                                    </Grid.Column>
                                </Grid.Row>
                                <Grid.Row columns={1}>
                                    {hasBalance.map((field) => {
                                        const asset = Asset(field);
                                        return (
                                            <Grid.Column key={asset.symbol} textAlign='right'>
                                                  <Header color={asset.symbol === 'GOLOS' ? 'green' : 'yellow'}>
                                                      {asset.toString().split(' ')[0]}{' '}<small>{asset.symbol}</small>
                                                  </Header>
                                            </Grid.Column>
                                        );
                                    })}
                                </Grid.Row>
                                <Grid.Row columns={1}>
                                    <Grid.Column>
                                        <Button as='a' target='_blank' href={'https://golos.id/@' + name + '/transfers'} color='purple' fluid size='small'>
                                            {tt('account.open_wallet')}
                                        </Button>
                                    </Grid.Column>
                                </Grid.Row>
                            </Grid>
                        </Popup>
                    );
                }
            }
        }
        return (
            <Menu color='blue' size='large' inverted style={{borderBottom: '3px solid #767676'}}>
                <Container>
                    <Link to='/' className='title active item mobile hidden'>
                        <strong dangerouslySetInnerHTML={{__html: ttGetByKey(CONFIG.forum, 'logo_title')}}></strong>
                    </Link>
                    {/*
                    <Link to='/' className='title item'>General</Link>
                    <Link to='/forums/steem' className='title item'>Steem</Link>
                    <Link to='/forums/crypto' className='title item'>Crypto</Link>
                    */}
                    {<Menu.Menu position='right'>
                        {localeSelect}
                        {pendingBalance}
                        {userItem}
                        {/*<Menu.Item>
                            {indicator}
                        </Menu.Item>*/}
                    </Menu.Menu>}
                </Container>
            </Menu>
        );
    }
}


function mapStateToProps(state, ownProps) {
    return {
        account: state.account,
        accounts: state.accounts,
        preferences: state.preferences,
        status: state.status
    };
}

function mapDispatchToProps(dispatch) {
    return {actions: bindActionCreators({
        ...accountActions,
        ...accountsActions,
        ...statusActions
    }, dispatch)};
}

export default withRouter(connect(mapStateToProps, mapDispatchToProps)(HeaderMenu));
