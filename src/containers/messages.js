import React from 'react';
import { bindActionCreators } from 'redux';
import { connect } from 'react-redux';
import { Link, withRouter } from 'react-router-dom';
import golos from 'golos-classic-js';
import tt from 'counterpart';
import ttGetByKey from '../utils/ttGetByKey';

import { Button, Modal, Dropdown } from 'semantic-ui-react';

import * as CONFIG from '../../config';
import * as messagesActions from '../actions/messagesActions';

import Messenger from './messages/Messenger';
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
        };
        if (this.state.to) {
            this.props.actions.fetchMessages(this.props.account, this.state.to);
        }
        this.props.actions.fetchContacts(this.props.account);
    }

    send = () => {

        /*const nonce = +new Date() * 1000;
        let private_key = PrivateKey.fromWif(this.props.account.memoKey)
        let shared_secret = private_key.get_shared_secret('GLS58g5rWYS3XFTuGDSxLVwiBiPLoAyCZgn6aB9Ueh8Hj5qwQA3r6');
        */


        /*let messages = [...this.state.messages];
        messages.push({
            position: 'right',
            type: 'text',
            text: 'Lorem ipsum dolor sit amet, consectetur adipisicing elit',
            date: new Date(),
        });
        this.setState({
            messages
        }, () =>
         {
            //window.scrollTo(0, document.body.scrollHeight)
            var objDiv = document.getElementById("pm-messagelist");
objDiv.scrollTop = objDiv.scrollHeight;

         });*/
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
        const { account, messages } = this.props;
        this.props.actions.addMessage(account, this.state.to, messages.to.memo_key, message);
    };

    render() {
        return (
            <div>
                <link href="https://unpkg.com/ionicons@4.5.0/dist/css/ionicons.min.css" rel="stylesheet"/>
                <Messenger
                    account={this.props.account}
                    to={this.state.to}
                    conversationTopLeft={[
                        <a href='/'>
                            <strong dangerouslySetInnerHTML={{__html: ttGetByKey(CONFIG.FORUM, 'logo_title')}}></strong>
                        </a>
                    ]}
                    conversationLinkPattern='/msgs/@*'
                    onConversationAdd={this.onConversationAdd}
                    onConversationSelect={this.onConversationSelect}
                    onSendMessage={this.onSendMessage}
                    messages={this.props.messages.messages}
                    messagesTopCenter={[
                        <div style={{fontSize: '14px'}}>{this.state.to}</div>,
                        <div style={{fontSize: '12px'}}>
                            {this.props.messages.to ?
                                <span>
                                    был(а) <TimeAgoWrapper date={`${this.props.messages.to.last_custom_json_bandwidth_update}}Z`} />
                                </span>
                                : null}
                        </div>
                    ]}
                    contacts={this.props.messages.contacts} />
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
        ...messagesActions,
    }, dispatch)};
}

export default withRouter(connect(mapStateToProps, mapDispatchToProps)(Messages));
