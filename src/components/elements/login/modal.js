import React from 'react';
import golos from 'golos-classic-js';
import tt from 'counterpart';
import { connect } from 'react-redux';

import { Button, Form, Header, Icon, Message, Modal } from 'semantic-ui-react';

class LoginModal extends React.Component {

    constructor(props) {
        super(props);
        this.state = {
            warningOpen: false, // Warning about active key. Disabled currently
            loginOpen: false,
            error: false,
            loading: false,
            account: props.account,
            key: ''
        };
    }

    componentWillReceiveProps(nextProps) {
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

    handleChange = (e, { name, value }) => this.setState({ [name]: value });

    handleSubmit = async e => {
        e.preventDefault();
        const { isActive } = this.props;
        const { account, key } = this.state,
              t = this;
        // Indicate we're loading
        t.setState({
            loading: true,
            error: false
        });
        let res = null;
        try {
            res = await golos.auth.login(account, key)
        } catch (err) {
            if (err.message === 'No such account'){
                t.setState({
                    loading: false,
                    error: tt('login.no_such_account_name')
                });
            }
            return;
        }
        if (isActive) {
            if (res.active) {
                t.props.actions.signinAccount(account, res.active);
                t.handleClose();
                return;
            } else if (res.posting || res.owner || res.memo) {
                t.setState({
                    loading: false,
                    error: tt('login.wrong_password_not_active')
                });
                return;
            }
        } else {
            if (res.active && !res.password) {
                t.setState({
                    loading: false,
                    error: tt('login.wrong_password_active')
                });
                return;
            }
            if (res.owner && !res.password) {
                t.setState({
                    loading: false,
                    error: tt('login.wrong_password_owner')
                });
                return;
            }
            if (res.posting) {
                t.props.actions.signinAccount(account, res.posting);
                t.handleClose();
                return;
            }
        }
        t.setState({
            loading: false,
            error: tt('login.wrong_password')
        });
    };

    render() {
        let {
            noButton,
            buttonColor,
            buttonFloated,
            buttonFluid,
            buttonIcon,
            buttonText,
            isActive
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
            modal = (
                <Modal
                    open={this.state.loginOpen}
                    size='small'
                >
                    <Header icon='lock' content={isActive ? tt('login.active_title') : tt('login.sign_in')} />
                    <Modal.Content>
                        {/*<Message>
                            <Message.Header>Before you login, please note:</Message.Header>
                            <Message.List>
                                <Message.Item>chainBB uses Steem&lsquo;s Post Beneficiaries feature at 5% of all posts. This reward is split between the users who operate the forums and the chainBB developers.</Message.Item>
                                <Message.Item>You can login to chainBB using your Steem posting key (WIF format, starts with the number 5). These keys are currently stored unencrypted in your browser and used for posting and voting.</Message.Item>
                                <Message.Item>chainBB is currently in <strong>BETA</strong> and may contain bugs.</Message.Item>
                            </Message.List>
                        </Message>*/}
                        {isActive ?
                            <Message>
                            {tt('login.active_description')}
                            </Message>
                        : null}
                        <Form
                            error={(this.state.error) ? true : false}
                            loading={this.state.loading}>
                            <Form.Input placeholder={tt('login.account_name')} autoFocus={!isActive} disabled={isActive} name='account' value={this.state.account} onChange={this.handleChange} />
                            <Form.Input placeholder={isActive ? tt('login.password_active') : tt('login.password')} autoFocus={isActive} type='password' name='key' value={this.state.key} onChange={this.handleChange} />
                            {/*<p>
                                Need help finding your <strong>Posting (Private Key)</strong>?
                                {' '}
                                <a rel='nofollow' target='_blank' href='https://steemit.com/steemit-guides/@rgeddes/getting-your-posting-key---made-easy'>
                                    Read this post by @rgeddes on steemit.com.
                                </a>
                            </p>*/}
                            <Message
                                error
                                header={tt('g.error')}
                                content={this.state.error}
                            />
                        </Form>
                    </Modal.Content>
                    <Modal.Actions>
                        <Button color='orange' onClick={this.handleClose}>{tt('g.cancel')}</Button>
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
        isActive: ownProps.authType === 'active'
    };
}

export default connect(mapStateToProps)(LoginModal);
