import React from 'react';
import { bindActionCreators } from 'redux';
import { connect } from 'react-redux';
import { withRouter } from 'react-router-dom';
import golos from 'golos-classic-js';
import tt from 'counterpart';
import ttGetByKey from '../utils/ttGetByKey';
import max from 'lodash/max';
import debounce from 'lodash/debounce';

import { Button, Modal, Dropdown } from 'semantic-ui-react';

import * as CONFIG from '../../config';
import * as accountActions from '../actions/accountActions';
import * as messagesActions from '../actions/messagesActions';

import Messenger from './messages/Messenger';
import LoginModal from '../components/elements/login/modal';
import LogoutItem from '../components/elements/login/logout';
import AccountAvatar from '../components/elements/account/avatar';
import TimeAgoWrapper from '../utils/TimeAgoWrapper';

class Messages extends React.Component {
 
    constructor(props) {
        super(props);
        const { to } = this.props.match.params;
        this.state = {
            to: to ? to.replace('@', '') : '',
            messages: [],
            addContactShow: false,
            contactToAdd: '',
            authorLookup: [],
            showConfirm: false,
        };
        if (props.account.memoKey) {
            this.load(props);
        }
    }

    load(props) {
        if (this.loaded) return;
        this.loaded = true;
        if (this.state.to) {
            props.actions.fetchMessages(props.account, this.state.to);
        }
        props.actions.fetchContacts(props.account);
        setInterval(() =>{
            props.actions.clearAccountNotifications(props.account.name);
        }, 5000);
    }

    componentDidMount() {
        const { account } = this.props;
        if (!account.memoKey) {
            this.setState({
                showConfirm: true
            });
        }
    }

    setCallback(account) {
        golos.api.setPrivateMessageCallback({select_accounts: [account.data.name]},
            (err, result) => {
                if (err) {
                    this.setCallback(this.props.account || account);
                    return;
                }
                if (!result || !result.message) {
                    return;
                }
                const updateMessage = result.message.from === this.state.to || 
                    result.message.to === this.state.to;
                const isMine = account.data.name === result.message.from;
                if (result.type === 'message') {
                    if (this.nonce !== result.message.nonce) {
                        this.props.actions.messaged(result.message, updateMessage, isMine, account);
                        this.nonce = result.message.nonce
                    }
                } else if (result.type === 'mark') {
                    this.props.actions.messageRead(result.message, updateMessage, isMine);
                }
            });
    }

    markMessages() {
        const { messages } = this.props.messages;
        if (!messages.length) return;
        let ranges = [];
        let range = null;
        for (let i = messages.length - 1; i >=0; --i) {
            const message = messages[i];
            if (!range) {
                if (message.toMark) {
                    range = {
                        start_date: message.receive_date,
                        stop_date: message.receive_date,
                    };
                }
            } else {
                if (message.toMark) {
                    range.start_date = message.receive_date;
                } else {
                    ranges.push({...range});
                    range = null;
                }
            }
        }
        if (range) {
            ranges.push({...range});
        }
        const { account } = this.props;
        this.props.actions.markMessages(account, this.state.to, ranges);
    }

    markMessages2 = debounce(this.markMessages, 1000);

    componentWillReceiveProps(nextProps) {
        if (nextProps.account && nextProps.account.memoKey && !this.callbackSet) {
            this.load(nextProps);
            this.callbackSet = true;
            const { account } = nextProps;
            this.setCallback(account);
        }
        const anotherChat = nextProps.to !== this.state.to;
        const msgsUpdated =
            nextProps.messages.messages.length > this.props.messages.messages.length
            || nextProps.messages.messagesUpdate !== this.props.messages.messagesUpdate;
        if (msgsUpdated || anotherChat) {
            setTimeout(() => {
                const scroll = document.getElementsByClassName('scrollable')[1];
                if (scroll) scroll.scrollTo(0,scroll.scrollHeight);
            }, 1);
        }
        if (anotherChat && !nextProps.messages.searchContacts) {
            setTimeout(() => {
                const input = document.getElementsByClassName('compose-input')[0];
                if (input) input.focus();
            }, 1);
        }
        if (anotherChat || msgsUpdated) {
            this.markMessages2();
        }
    }

    onConfirmClose = () => {
        this.setState({
            showConfirm: false
        });
    };

    onConversationAdd = (event) => {
        this.setState({
            addContactShow: true
        });
    };

    handleAuthorLookup = (e) => {
        if (e.keyCode === 13) return;
        golos.api.lookupAccounts(e.target.value.toLowerCase(), 6, (err, data) => {
            let options = data.map((name) => {
                return {text: name, value: name};
            });
            options.unshift({text: tt('g.author'), value: ''});
            this.setState({
                authorLookup: options
            });
        });
    };
    handleAuthorChange = (e, { value }) => {
        this.setState({
            contactToAdd: value
        })
    };
    addContact = (e) => {
        this.props.history.push('/msgs/@' + this.state.contactToAdd);
        this.setState({
            to: this.state.contactToAdd,
            addContactShow: false,
            contactToAdd: '',
        }, () => {
            this.props.actions.fetchMessages(this.props.account, this.state.to);
        });
    };
    addContactCancel = (e) => {
        this.setState({
            addContactShow: false,
        });
    };

    onConversationSearch = (event) => {
        this.props.actions.searchContacts(this.props.account.name, event.target.value)
    };

    onConversationSelect = (conversation, link, event) => {
        if (this.state.to === conversation.contact) return;

        this.props.history.push(link);
        this.setState({
            to: conversation.contact
        }, () => {
            this.props.actions.fetchMessages(this.props.account, this.state.to);
        });
    };

    onSendMessage = (message, event) => {
        if (!message.length) return;
        const { account, messages } = this.props;
        if (!account.memoKey) {
            this.setState({
                showConfirm: true
            });
            return;
        }
        this.props.actions.addMessage(account, this.state.to, messages.to.memo_key, message);
    };

    _renderMessagesTopCenter = () => {
        let messagesTopCenter = [];
        const { to } = this.props.messages;
        if (to) {
            messagesTopCenter.push(<div style={{fontSize: '14px', width: '100%', textAlign: 'center'}}>
                <a href={'/@' + to.name}>@{to.name}</a>
            </div>);
            const dates = [
                to.last_custom_json_bandwidth_update,
                to.last_post,
                to.last_comment,
                to.created,
            ];
            let lastSeen = max(dates);
            if (!lastSeen.startsWith('19')) {
                messagesTopCenter.push(<div style={{fontSize: '12px', fontWeight: 'normal'}}>
                    {
                        <span>
                            <TimeAgoWrapper prefix={tt('messages.last_seen')} date={`${lastSeen}Z`} />
                        </span>
                    }
                </div>);
            }
        }
        return messagesTopCenter;
    };

    _renderMessagesTopRight = () => {
        const { name } = this.props.account;
        let avatar = (
            <AccountAvatar
                className=''
                noLink={true}
                size={35}
                style={{margin: 0}}
                username={name}
            />
        );
        return (<Dropdown title={'@' + name} style={{padding: '0 1.1em'}} item trigger={avatar} pointing='top right' icon={null} className='icon'>
            <Dropdown.Menu>
                <Dropdown.Item target='_blank' icon='user' content={<a href={`/@${name}`}>{tt('account.profile')}</a>} />
                <LogoutItem {...this.props} />
            </Dropdown.Menu>
        </Dropdown>)
    };

    render() {
        const { account, actions } = this.props;
        const { contacts, searchContacts, messages } = this.props.messages;
        if (!account.name) {
            window.location.href = '/';
            return (<div></div>);
        }
        return (
            <div>
                <LoginModal authType='memo' noButton={true} open={this.state.showConfirm} actions={{...actions, onClose: this.onConfirmClose}}/>
                <link href="https://unpkg.com/ionicons@4.5.0/dist/css/ionicons.min.css" rel="stylesheet"/>
                <Messenger
                    account={this.props.account}
                    to={this.state.to}
                    contacts={searchContacts || contacts}
                    conversationTopLeft={[
                        <a href='/'>
                            <h3 dangerouslySetInnerHTML={{__html: ttGetByKey(CONFIG.FORUM, 'logo_title')}}></h3>
                        </a>
                    ]}
                    conversationLinkPattern='/msgs/@*'
                    onConversationSearch={this.onConversationSearch}
                    onConversationSelect={this.onConversationSelect}
                    messages={messages}
                    messagesTopCenter={this._renderMessagesTopCenter()}
                    messagesTopRight={this._renderMessagesTopRight()}
                    onSendMessage={this.onSendMessage} />
                <Modal size='small' open={this.state.addContactShow}>
                        <Modal.Header>Добавить контакт</Modal.Header>
                        <Modal.Content>
                            <Dropdown
                                options={this.state.authorLookup}
                                placeholder={tt('g.author')}
                                noResultsMessage=''
                                search
                                selection
                                clearable
                                onChange={this.handleAuthorChange}
                                onKeyUp={this.handleAuthorLookup}
                            /><br/><br/>
                            <Button primary onClick={this.addContact}>{tt('g.add')}</Button>
                            <Button color='orange' onClick={this.addContactCancel}>{tt('g.cancel')}</Button>
                        </Modal.Content>
                </Modal>
            </div>
        );
    }
}

function mapStateToProps(state, ownProps) {
    return {
        account: state.account,
        messages: state.messages
    };
}

function mapDispatchToProps(dispatch) {
    return {actions: bindActionCreators({
        ...accountActions,
        ...messagesActions,
    }, dispatch)};
}

export default withRouter(connect(mapStateToProps, mapDispatchToProps)(Messages));
