import React from 'react';
import golos, { multiauth } from 'golos-lib-js';
import tt from 'counterpart';
import { connect } from 'react-redux';

import { Button, Checkbox, Dimmer, Form, Header, Icon, Loader, Message, Modal } from 'semantic-ui-react';

import { authRegisterUrl, authUrl } from '@/utils/AuthApiClient';
import { notifyLogin } from '@/utils/notifications';
import { useMultiAuth } from '@/utils/multiauthHelper'

class LoginModal extends React.Component {

    constructor(props) {
        super(props);
        this.state = {
            warningOpen: false, // Warning about active key. Disabled currently
            loginOpen: props.open,
            error: false,
            loading: false,
            signerLoading: false,
            account: props.account,
            key: '',
            rememberMe: true,
        };
        this.signerAvailable = !!golos.config.get('oauth.host')
    }

    UNSAFE_componentWillReceiveProps(nextProps) {
        if (nextProps.open && nextProps.open !== this.state.loginOpen) {
            this.setState({
                loginOpen : nextProps.open ? true : false
            });
        }
        if (nextProps.account !== this.state.account) {
            this.setState({
                account : nextProps.account
            });
        }
    }

    handleOpen = (e) => this.setState({
        warningOpen: false,
        loginOpen: true
    });

    handleSwap = (e) => this.setState({
        warningOpen: false,
        loginOpen: true
    });

    handleClose = (e) => this.setState({
        loading: false,
        key: '',
        warningOpen: false,
        loginOpen: false
    }, () => {
        if (this.props.actions.onClose) this.props.actions.onClose();
    });

    handleChange = (e, { name, value, checked }) => this.setState({ [name]: value || checked });

    handleSubmit = async e => {
        e.preventDefault();
        const { isActive, isMemo } = this.props;
        const { account, key, rememberMe } = this.state
        // Indicate we're loading
        this.setState({
            loading: true,
            error: false
        });
        let res = null;
        try {
            res = await golos.auth.login(account, key)
        } catch (err) {
            let error = (err && err.message) || err
            if (err === 'No such account') {
                error = tt('login.no_such_account_name')
            } else if (err === 'Account is frozen') {
                error = <span>
                        {tt('login.account_frozen')}
                        <a href={authUrl('/sign/unfreeze/' + account)} target='_blank' rel='noopener noreferrer'>&nbsp;{tt('g.more')}</a>
                    </span>
            }
            this.setState({
                loading: false,
                error
            })
            return;
        }
        if (isMemo) {
            if (res.memo) {
                this.props.actions.signinAccount(account, '', res.memo, rememberMe);
                this.handleClose();
                return;
            } else if (res.posting || res.owner || res.active) {
                this.setState({
                    loading: false,
                    error: tt('login.wrong_password_not_memo')
                });
                return;
            }
        } else if (isActive) {
            if (res.active) {
                this.props.actions.signinAccount(account, res.active);
                this.handleClose();
                return;
            } else if (res.posting || res.owner || res.memo) {
                this.setState({
                    loading: false,
                    error: tt('login.wrong_password_not_active')
                });
                return;
            }
        } else {
            if (res.active && !res.password) {
                this.setState({
                    loading: false,
                    error: tt('login.wrong_password_active')
                });
                return;
            }
            if (res.owner && !res.password) {
                this.setState({
                    loading: false,
                    error: tt('login.wrong_password_owner')
                });
                return;
            }
            if (res.posting) {
                // Need for case if previously was signed with OAuth
                golos.config.set('websocket', $GLS_Config.golos_node)
                golos.config.set('chain_id', $GLS_Config.golos_chain_id)
                golos.config.set('credentials', undefined)

                this.props.actions.signinAccount(account, res.posting, res.memo);
                try {
                    await notifyLogin(account, res.posting);
                } catch (error) {
                    console.error('notifyLogin fail', error);
                }
                this.handleClose();
                return;
            }
        }
        this.setState({
            loading: false,
            error: tt('login.wrong_password')
        });
    };

    waitForLogin = async (oAuth = false) => {
        this.setState({ signerLoading: true })
        multiauth.waitForLogin(res => {
            this.setState({ signerLoading: false })
            this.props.actions.signinAccount(res.account, '')
            useMultiAuth(oAuth ? golos.config.get('oauth.host') : null)
            this.handleClose()
        }, () => {
            this.setState({ signerLoading: false })
        }, 180, () => {
            if (this.state.loading || !this.state.loginOpen) {
                this.setState({ signerLoading: false })
                return true
            }
        })
    }

    useOAuth = async (e) => {
        e.preventDefault()
        const permissions = [ 'comment', 'vote', 'donate', 'custom' ]
        await multiauth.login(permissions)
        this.waitForLogin(true)
    }

    useKeychain = async (e) => {
        e.preventDefault()
        try {
            await multiauth.login([], { type: multiauth.AuthType.KEYCHAIN})
        } catch (err) {
            if (err && err.message.includes('Golos Keychain extension is not installed or disabled')) {
                this.setState({ downloadKeychain: true })
                return
            }
            throw err
        }
        this.waitForLogin()
    }

    closeKeychainModal = () => {
        this.setState({ downloadKeychain: false })
    }

    render() {
        let {
            noButton,
            buttonColor,
            buttonFloated,
            buttonFluid,
            buttonIcon,
            buttonText,
            isActive,
            isMemo,
            authType,
            cancelIsRegister,
            rememberMe,
        } = this.props;
        let modal = (
            <Modal
                trigger={!noButton ? (
                    <Button
                        fluid={buttonFluid}
                        color={buttonColor}
                        floated={buttonFloated}
                        content={buttonText || tt('login.sign_in')}
                        icon={buttonIcon}
                        onClick={this.handleOpen}
                    />
                ) : null}
                open={this.state.warningOpen}
                onOpen={this.open}
                onClose={this.close}
                basic
                size='small'
                className='modal-warning'
            >
                <Header icon='warning' content={tt('login.key_warn')} />
                <Modal.Content>
                    <h4>{tt('login.key_warn_description')}</h4>
                </Modal.Content>
                <Modal.Actions>
                    <Button color='orange' onClick={this.handleClose}>{tt('g.cancel')}</Button>
                    <Button color='green' icon onClick={this.handleSwap}>{tt('g.proceed')} <Icon name='right chevron' /></Button>
                </Modal.Actions>
            </Modal>
        )
        if (this.state.loginOpen) {
            let signer = null
            if (this.signerAvailable) {
                const keychainLink = (browser) => {
                    if (!$GLS_Config.app_updater) return '#'
                    return new URL('/api/exe/keychain/' + browser + '/latest', $GLS_Config.app_updater.host).toString()
                }
                const { signerLoading } = this.state
                signer = (
                    <span style={{ float: 'left'}}>
                        <Dimmer.Dimmable as='span' dimmed={signerLoading}>
                            <Dimmer inverted active={signerLoading} style={{ background: 'transparent' }}>
                                <Loader size='small' />
                            </Dimmer>
                            <span style={{ opacity: signerLoading ? 0 : 1, fontSize: '1.025rem' }}>
                                <span style={{ marginTop: '0.3rem', display: 'inline-block' }}>
                                    <a href='#' onClick={this.useOAuth}>
                                        <span style={{ verticalAlign: 'middle' }}>{tt('login.sign_in_with')}</span>
                                        <img style={{ verticalAlign: 'middle', marginLeft: '0.3rem', marginRight: '0.3rem' }} src='/images/signer24x24.png' />
                                        <span style={{ verticalAlign: 'middle' }}>{tt('login.sign_in_with_signer')}</span>
                                    </a>
                                    <span style={{ verticalAlign: 'middle' }}>{' ' + tt('g.or') + ' '}</span>
                                    <a href='#' onClick={this.useKeychain}>
                                        <span style={{ verticalAlign: 'middle' }}>{tt('login.sign_in_with_keychain')}</span>
                                    </a>
                                    <Modal open={this.state.downloadKeychain}>
                                        <Modal.Content>
                                            {tt('login.keychain_not_installed')}
                                            <a href={keychainLink('firefox')}>
                                                Firefox
                                            </a>
                                            {' ' + tt('g.or') + ' '}
                                            <a href={keychainLink('chrome')}>
                                                Chrome
                                            </a>
                                            .
                                        </Modal.Content>
                                        <Modal.Actions>
                                            <Button color='orange' onClick={this.closeKeychainModal}>{tt('g.close')}</Button>
                                        </Modal.Actions>
                                    </Modal>
                                </span>
                            </span>
                        </Dimmer.Dimmable>
                    </span>)
            }
            modal = (
                <Modal
                    open={this.state.loginOpen}
                    size='small'
                >
                    <Header icon='lock' content={tt(`login.${authType}_title`)} />
                    <Modal.Content>
                        {/*<Message>
                            <Message.Header>Before you login, please note:</Message.Header>
                            <Message.List>
                                <Message.Item>chainBB uses Steem&lsquo;s Post Beneficiaries feature at 5% of all posts. This reward is split between the users who operate the forums and the chainBB developers.</Message.Item>
                                <Message.Item>You can login to chainBB using your Steem posting key (WIF format, starts with the number 5). These keys are currently stored unencrypted in your browser and used for posting and voting.</Message.Item>
                                <Message.Item>chainBB is currently in <strong>BETA</strong> and may contain bugs.</Message.Item>
                            </Message.List>
                        </Message>*/}
                        {authType ?
                            <Message>
                            {tt(`login.${authType}_description`)}
                            </Message>
                        : null}
                        <Form
                            error={(this.state.error) ? true : false}
                            loading={this.state.loading}>
                            <Form.Input placeholder={tt('login.account_name')} autoFocus={!isActive && !isMemo} disabled={isActive || isMemo} name='account' value={this.state.account} onChange={this.handleChange} />
                            <Form.Input placeholder={tt(`login.password_${authType}`)} autoFocus={isActive || isMemo} type='password' name='key' value={this.state.key} onChange={this.handleChange} />
                            <Message
                                error
                                header={tt('g.error')}
                                content={this.state.error}
                            />
                        </Form>
                        { rememberMe ? (<Checkbox
                            label={tt(`login.remember_${authType}`, {fallback: tt('login.remember_me')})}
                            name='rememberMe'
                            checked={this.state.rememberMe}
                            onChange={this.handleChange}
                            />) : null }
                    </Modal.Content>
                    <Modal.Actions>
                        {signer}
                        {cancelIsRegister && !isMemo ?
                            (<Button as='a' href={authRegisterUrl()} target='_blank' color='orange'>{tt('login.sign_up')}</Button>) : null}
                        {!cancelIsRegister && !isMemo ?
                            (<Button color='orange' onClick={this.handleClose}>{tt('g.cancel')}</Button>) : null}
                        <Button color='blue' icon onClick={this.handleSubmit}>{tt('login.sign_in')} <Icon name='right chevron' /></Button>
                    </Modal.Actions>
                </Modal>
            );
        }
        return modal;
    }
}

function mapStateToProps(state, ownProps) {
    return {
        account: state.account ? state.account.name : '',
        isActive: ownProps.authType === 'active',
        isMemo: ownProps.authType === 'memo',
        authType: ownProps.authType || '',
    };
}

export default connect(mapStateToProps)(LoginModal);
