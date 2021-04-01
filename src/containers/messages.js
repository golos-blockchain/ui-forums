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
import AddImageDialog from '../components/dialogs/image';

class Messages extends React.Component {
 
    constructor(props) {
        super(props);
        const { to } = this.props.match.params;
        this.state = {
            to: to ? to.replace('@', '') : '',
            messages: [],
            selectedMessages: {},
            addContactShow: false,
            contactToAdd: '',
            authorLookup: [],
            showConfirm: false,
            showImageDialog: false,
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
        const script = document.createElement('script');
        script.src = 'https://unpkg.com/ionicons@5.4.0/dist/ionicons.js';
        script.async = true;
        document.body.appendChild(script);
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
        const { account } = this.props;

        let OPERATIONS = golos.messages.makeGroups(messages, (message_object, idx) => {
            return message_object.toMark;
        }, (group, indexes, results) => {
            const json = JSON.stringify(['private_mark_message', {
                from: this.state.to,
                to: account.name,
                ...group,
            }]);
            return ['custom_json',
                {
                    id: 'private_message',
                    required_posting_auths: [account.name],
                    json,
                }
            ];
        }, messages.length - 1, -1);

        this.props.actions.sendOperations(account, this.state.to, OPERATIONS);
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

    onMessageSelect = (message, isSelected, event) => {
        if (message.receive_date.startsWith('19') || message.deleting) {
            this.focusInput();
            return;
        }
        if (isSelected) {
            this.presaveInput();
            const { account } = this.props;
            const isMine = account.name === message.from;
            this.setState({
                selectedMessages: {...this.state.selectedMessages, [message.nonce]: { editable: isMine }},
            });
        } else {
            let selectedMessages = {...this.state.selectedMessages};
            delete selectedMessages[message.nonce];
            this.setState({
                selectedMessages,
            }, () => {
                this.restoreInput();
                this.focusInput();
            });
        }
    };

    onPanelDeleteClick = (event) => {
        const { messages } = this.state;

        const { account, accounts, to } = this.props;

        // TODO: use makeGroups

        /*let OPERATIONS = [];
        for (let message_object of messages) {
            if (!this.state.selectedMessages[message_object.nonce]) {
                continue;
            }
            const json = JSON.stringify(['private_delete_message', {
                requester: account.name,
                from: message_object.from,
                to: message_object.to,
                start_date: '1970-01-01T00:00:00',
                stop_date: '1970-01-01T00:00:00',
                nonce: message_object.nonce,
            }]);
            OPERATIONS.push(['custom_json',
                {
                    id: 'private_message',
                    required_posting_auths: [account.name],
                    json,
                }
            ]);
        }

        this.props.sendOperations(account, accounts[to], OPERATIONS);*/

        this.setState({
            selectedMessages: {},
        }, () => {
            this.restoreInput();
            this.focusInput();
        });
    };

    onPanelEditClick = (event) => {
        const nonce = Object.keys(this.state.selectedMessages)[0];
        let message = this.props.messages.messages.filter(message => {
            return message.nonce === nonce;
        });
        this.setState({
            selectedMessages: {},
        }, () => {
            this.editNonce = message[0].nonce;
            this.setInput(message[0].message);
            this.focusInput();
        });
    };

    onPanelCloseClick = (event) => {
        this.setState({
            selectedMessages: {},
        }, () => {
            this.restoreInput();
            this.focusInput();
        });
    };

    focusInput = () => {
        const input = document.getElementsByClassName('compose-input')[0];
        if (input) input.focus();
    };

    presaveInput = () => {
        if (!this.presavedInput) {
            const input = document.getElementsByClassName('compose-input')[0];
            if (input) {
                this.presavedInput = input.value;
            }
        }
    };

    setInput = (value) => {
        const input = document.getElementsByClassName('compose-input')[0];
        if (input) {
            input.value = value;
        }
    };

    restoreInput = () => {
        if (this.presavedInput) {
            this.setInput(this.presavedInput);
            this.presavedInput = undefined;
        }
    };

    onButtonImageClicked = (event) => {
        this.setState({
            showImageDialog: true,
        });
    };

    closeImageDialog = () => {
        this.setState({
            showImageDialog: false,
        }, () => {
            this.focusInput();
        });
    };

    onImageDialogResult = (result) => {
        if (result) {
            this.closeImageDialog();

            let meta = {
                width: result.width,
                height: result.height,
            };

            const { account, messages } = this.props;
            this.props.actions.addMessage(account, this.state.to, messages.to.memo_key, result.link, 'image', meta);
        }
    };

    onImageDialogClose = (event) => {
        this.closeImageDialog();
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
                    onSendMessage={this.onSendMessage}
                    selectedMessages={this.state.selectedMessages}
                    onMessageSelect={this.onMessageSelect}
                    onPanelDeleteClick={this.onPanelDeleteClick}
                    onPanelEditClick={this.onPanelEditClick}
                    onPanelCloseClick={this.onPanelCloseClick}
                    onButtonImageClicked={this.onButtonImageClicked}
                    />
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
                <AddImageDialog open={this.state.showImageDialog}
                    onResult={this.onImageDialogResult}
                    onClose={this.onImageDialogClose} />
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
