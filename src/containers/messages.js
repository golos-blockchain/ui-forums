import React from 'react';
import { bindActionCreators } from 'redux';
import { connect } from 'react-redux';
import { withRouter } from 'react-router-dom';
import golos from 'golos-lib-js';
import tt from 'counterpart';
import max from 'lodash/max';
import debounce from 'lodash/debounce';

import { Button, Icon, Modal, Dropdown } from 'semantic-ui-react';

import * as accountActions from '../actions/accountActions';
import * as accountsActions from '../actions/accountsActions';
import * as messagesActions from '../actions/messagesActions';

import Messenger from './messages/Messenger';
import LoginModal from '../components/elements/login/modal';
import LogoutItem from '../components/elements/login/logout';
import AccountAvatar from '../components/elements/account/avatar';
import TimeAgoWrapper from '../utils/TimeAgoWrapper';
import AddImageDialog from '../components/dialogs/image';
import PageFocus from '../components/elements/messages/PageFocus';
import { flash, unflash } from '../components/elements/messages/FlashTitle';
import { getMemoKey } from '../utils/MessageUtils';
import { notificationSubscribe, notificationTake } from '../utils/NotifyApiClient';

import './messages.css';

class Messages extends React.Component {
 
    constructor(props) {
        super(props);
        const { to } = this.props.match.params;
        const hasMemo = getMemoKey(props.account);
        this.state = {
            to: to ? to.replace('@', '') : '',
            selectedMessages: {},
            addContactShow: false,
            contactToAdd: '',
            authorLookup: [],
            showLogin: this.needsLogin(props),
            showLoginMemo: props.account && props.account.name && !hasMemo,
            showImageDialog: false,
            notifyErrors: 0,
        };
        if (props.account && hasMemo) {
            this.load(props);
        }
        this.windowFocused = true;
        this.newMessages = 0;
    }

    load(props) {
        if (this.loaded) return;
        this.loaded = true;
        if (this.state.to) {
            props.actions.fetchMessages(props.account, this.state.to);
        }
        props.actions.fetchContacts(props.account);
        setInterval(() =>{
            if (this.windowFocused)
                props.actions.clearAccountNotifications(props.account.name);
        }, 5000);
    }

    onWindowResize = (e) => {
        const isMobile = window.matchMedia('screen and (max-width: 39.9375em)').matches;
        if (isMobile !== this.isMobile) {
            this.forceUpdate();
        }
        this.isMobile = isMobile;
    };

    componentDidMount() {
        const script = document.createElement('script');
        script.src = 'https://unpkg.com/ionicons@5.4.0/dist/ionicons.js';
        script.async = true;
        document.body.appendChild(script);
        window.addEventListener('resize', this.onWindowResize)
    }

    componentWillUnmount() {
        window.removeEventListener('resize', this.onWindowResize);
    }

    flashMessage() {
        ++this.newMessages;

        let title = this.newMessages;
        const plural = this.newMessages % 10;

        if (plural === 1) {
            if (this.newMessages === 11)
                title += tt('messages.new_message5');
            else
                title += tt('messages.new_message1');
        } else if ((plural === 2 || plural === 3 || plural === 4) && (this.newMessages < 10 || this.newMessages > 20)) {
            title += tt('messages.new_message234');
        } else {
            title += tt('messages.new_message5');
        }

        flash(title);
    }

    notifyErrorsClear = () => {
        if (this.state.notifyErrors)
            this.setState({
                notifyErrors: 0,
            });
    };

    notifyErrorsInc = (score) => {
        this.setState({
            notifyErrors: this.state.notifyErrors + score,
        });
    };

    async setCallback(account, removeTaskIds) {
        let subscribed = null;
        try {
            subscribed = await notificationSubscribe(account.data.name);
        } catch (error) {
            console.error('notificationSubscribe', error)
            this.notifyErrorsInc(15);
            setTimeout(() => {
                this.setCallback(this.props.account || account, removeTaskIds);
            }, 5000);
            return;
        }
        if (subscribed) { // if was not already subscribed
            this.notifyErrorsClear();
        }
        try {
            removeTaskIds = await notificationTake(account.data.name, removeTaskIds, (type, op, timestamp, task_id, scope) => {
                if (scope !== 'message') {
                    return;
                }
                const updateMessage = op.from === this.state.to || 
                    op.to === this.state.to;
                const isMine = account.data.name === op.from;
                if (type === 'private_message') {
                    if (op.update) {
                        this.props.actions.messageEdited(op, timestamp, updateMessage, isMine, account);
                    } else if (this.nonce !== op.nonce || this._offchain !== op._offchain) {
                        this.props.actions.messaged(op, timestamp, updateMessage, isMine, account);
                        this.nonce = op.nonce;
                        this._offchain = op._offchain;
                        if (!isMine && !this.windowFocused) {
                            this.flashMessage();
                        }
                    }
                } else if (type === 'private_delete_message') {
                    this.props.actions.messageDeleted(op, updateMessage, isMine);
                } else if (type === 'private_mark_message') {
                    this.props.actions.messageRead(op, timestamp, updateMessage, isMine);
                }
            });
        } catch (err) {
            console.error('notificationTake', err);
            this.notifyErrorsInc(1);
            setTimeout(() => {
                this.setCallback(this.props.account || account, removeTaskIds);
            }, 2000);
            return;
        }

        this.notifyErrorsClear();
        setTimeout(() => {
            this.setCallback(this.props.account || account, removeTaskIds);
        }, 250);
    }

    markMessages() {
        const { messages } = this.props.messages;
        const { account } = this.props;

        let OPERATIONS = golos.messages.makeDatedGroups(messages, (message_object, idx) => {
            return message_object.toMark && !message_object._offchain;
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

    needsLogin = (props) => {
        return !props.account || !props.account.name;
    }

    componentWillReceiveProps(nextProps) {
        if (this.needsLogin(nextProps)) {
            this.setState({
                showLogin: true
            });
            return;
        }
        if (!nextProps.account.data) {
            console.debug('No account data, re-render page');
            return;
        }
        if (!getMemoKey(nextProps.account)) {
            this.setState({
                showLoginMemo: true
            });
            return;
        }
        if (!this.callbackSet) {
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
                const scroll = document.getElementsByClassName('msgs-content')[0];
                if (scroll) scroll.scrollTo(0,scroll.scrollHeight);
            }, 1);
        }
        if (anotherChat && !nextProps.messages.searchContacts) {
            setTimeout(() => {
                const input = document.getElementsByClassName('msgs-compose-input')[0];
                if (input) input.focus();
            }, 1);
        }
        if (anotherChat || msgsUpdated) {
            this.markMessages2();
        }
        if (anotherChat) {
            this.setState({
                replyingMessage: null,
            });
        }
    }

    onLoginClose = () => {
        this.setState({
            showLogin: false
        });
    };

    onLoginMemoClose = () => {
        this.setState({
            showLoginMemo: false
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

    onCancelReply = (event) => {
        this.setState({
            replyingMessage: null,
        }, () => {
            // if editing - cancel edit at all, not just remove reply
            if (this.editNonce) {
                this.restoreInput();
                this.editNonce = undefined;
            }
            this.focusInput();
        });
    };

    onSendMessage = (message, event) => {
        if (!message.length) return;
        const { account, messages } = this.props;

        let editInfo;
        if (this.editNonce) {
            editInfo = { nonce: this.editNonce };
        }

        this.props.actions.sendMessage(account, this.state.to, messages.to.memo_key, message, editInfo, 'text', {}, this.state.replyingMessage);

        if (this.editNonce) {
            this.restoreInput();
            this.focusInput();
            this.editNonce = undefined;
        } else {
            this.setInput('');
        }
        if (this.state.replyingMessage)
            this.setState({
                replyingMessage: null,
            });
    };

    onMessageSelect = (msg, isSelected, event) => {
        if (msg.receive_date.startsWith('19') || msg.deleting) {
            this.focusInput();
            return;
        }
        if (isSelected) {
            this.presaveInput();
            const { account } = this.props;
            const isMine = account.name === msg.from;
            let isImage = false;
            let isInvalid = true;
            const { message } = msg;
            if (message) {
                isImage = message.type === 'image';
                isInvalid = !!message.invalid;
            }
            this.setState({
                selectedMessages: {[msg.nonce]: { editable: isMine && !isImage && !isInvalid }},
            });
        } else {
            this.setState({
                selectedMessages: {},
            }, () => {
                this.restoreInput();
                this.focusInput();
            });
        }
    };

    onPanelDeleteClick = (event) => {
        const { selectedMessages } = this.state;

        const { account, messages } = this.props;

        let OPERATIONS = [];

        for (let message_object of messages.messages) {
            if (!selectedMessages[message_object.nonce]) {
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
            break; // Currently processes only 1 message
        }

        if (OPERATIONS.length)
            this.props.actions.sendOperations(account, this.state.to, OPERATIONS);

        this.setState({
            selectedMessages: {},
        }, () => {
            this.restoreInput();
            this.focusInput();
        });
    };

    onPanelReplyClick = (event) => {
        const nonce = Object.keys(this.state.selectedMessages)[0];
        let message = this.props.messages.messages.filter(message => {
            return message.nonce === nonce;
        });
        // (additional protection - normally invalid messages shouldn't be available for select)
        if (!message[0].message)
            return;
        let quote = golos.messages.makeQuoteMsg({}, message[0]);
        this.setState({
            selectedMessages: {},
            replyingMessage: quote,
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
        // (additional protection - normally invalid messages shouldn't be available for edit)
        if (!message[0].message)
            return;
        this.setState({
            selectedMessages: {},
        }, () => {
            this.editNonce = message[0].nonce;
            if (message[0].message.quote) {
                this.setState({
                    replyingMessage: {quote: message[0].message.quote},
                });
            } else {
                this.setState({
                    replyingMessage: null,
                });
            }
            this.setInput(message[0].message.body);
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

    focusInput = (workOnMobile = false) => {
        if (!workOnMobile && window.IS_MOBILE) return;
        const input = document.getElementsByClassName('msgs-compose-input')[0];
        if (input) input.focus();
    };

    presaveInput = () => {
        if (this.presavedInput === undefined) {
            const input = document.getElementsByClassName('msgs-compose-input')[0];
            if (input) {
                this.presavedInput = input.value;
            }
        }
    };

    setInput = (value) => {
        const input = document.getElementsByClassName('msgs-compose-input')[0];
        if (input) {
            input.value = value;
        }
    };

    restoreInput = () => {
        if (this.presavedInput !== undefined) {
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
            this.props.actions.sendMessage(account, this.state.to, messages.to.memo_key, result.link, undefined, 'image', meta, this.state.replyingMessage);

            if (this.state.replyingMessage)
                this.setState({
                    replyingMessage: null,
                });
        }
    };

    onImageDialogClose = (event) => {
        this.closeImageDialog();
    };

    handleFocusChange = isFocused => {
        this.windowFocused = isFocused;
        if (!isFocused) {
            if (this.newMessages) {
                flash();
            }
        } else {
            this.newMessages = 0;
            unflash();
        }
    }

   _renderMessagesTopLeft = () => {
        let messagesTopLeft = [];
        // mobile only
        messagesTopLeft.push(<a href='/msgs/' key='back-btn' className='msgs-back-btn'>
            <Icon name='chevron left' />
        </a>);
        return messagesTopLeft;
    };

    _renderMessagesTopCenter = () => {
        let messagesTopCenter = [];
        const { to } = this.props.messages;
        if (to) {
            messagesTopCenter.push(<div style={{fontSize: '14px', width: '100%', textAlign: 'center'}}>
                <a href={'/@' + to.name}>@{to.name}</a>
            </div>);
            const { notifyErrors } = this.state;
            if (notifyErrors >= 30) {
                messagesTopCenter.push(<div key='to-last-seen' style={{fontSize: '13px', fontWeight: 'normal', color: 'red'}}>
                    {
                        <span>
                            {tt('messages.sync_error')}
                        </span>
                    }
                </div>);
            } else {
                const dates = [
                    to.last_custom_json_bandwidth_update,
                    to.last_post,
                    to.last_comment,
                    to.created,
                ];
                let lastSeen = max(dates);
                if (!lastSeen.startsWith('19')) {
                    messagesTopCenter.push(<div key='to-last-seen'style={{fontSize: '12px', fontWeight: 'normal'}}>
                        {
                            <span>
                                <TimeAgoWrapper prefix={tt('messages.last_seen')} date={`${lastSeen}Z`} />
                            </span>
                        }
                    </div>);
                }
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
                <Dropdown.Item target='_blank' icon='user' content={<a href={`/@${name}`} style={{ color: 'black' }}>{tt('account.profile')}</a>} />
                <LogoutItem {...this.props} />
            </Dropdown.Menu>
        </Dropdown>)
    };

    render() {
        const { actions } = this.props;
        const { contacts, searchContacts, messages } = this.props.messages;
        /*if (account.name && account.name === this.state.to) {
            window.location.href = '/msgs/';
            return (<div></div>);
        }*/
        return (
            <div>
                <LoginModal cancelIsRegister={true} noButton={true} open={this.state.showLogin} actions={{...actions, onClose: this.onLoginClose}}/>
                <LoginModal authType='memo' rememberMe={true} noButton={true} open={this.state.showLoginMemo} actions={{...actions, onClose: this.onLoginMemoClose}}/>
                <PageFocus onChange={this.handleFocusChange}>
                </PageFocus>
                { this.props.account && this.props.account.name ? (<Messenger
                    account={this.props.account}
                    to={this.state.to}
                    contacts={searchContacts || contacts}
                    conversationTopLeft={[
                        <a href='/'>
                            <img className='msgs-logo' src='/images/messenger.png' alt='Golos Messenger' />
                        </a>
                    ]}
                    conversationLinkPattern='/msgs/@*'
                    onConversationSearch={this.onConversationSearch}
                    onConversationSelect={this.onConversationSelect}
                    messages={messages}
                    messagesTopLeft={this._renderMessagesTopLeft()}
                    messagesTopCenter={this._renderMessagesTopCenter()}
                    messagesTopRight={this._renderMessagesTopRight()}
                    replyingMessage={this.state.replyingMessage}
                    onCancelReply={this.onCancelReply}
                    onSendMessage={this.onSendMessage}
                    selectedMessages={this.state.selectedMessages}
                    onMessageSelect={this.onMessageSelect}
                    onPanelDeleteClick={this.onPanelDeleteClick}
                    onPanelReplyClick={this.onPanelReplyClick}
                    onPanelEditClick={this.onPanelEditClick}
                    onPanelCloseClick={this.onPanelCloseClick}
                    onButtonImageClicked={this.onButtonImageClicked}
                    />) : null }
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
        ...accountsActions,
        ...messagesActions,
    }, dispatch)};
}

export default withRouter(connect(mapStateToProps, mapDispatchToProps)(Messages));
