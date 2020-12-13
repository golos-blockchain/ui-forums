import React from 'react';
import { Button, Dimmer, Divider, Grid, Header, Icon, Loader, Message, Modal, Segment } from 'semantic-ui-react';
import Noty from 'noty';
import tt from 'counterpart';

import ForumPostModerationStatus from './moderation/status';
import LoginModal from '../../login/modal';

export default class ForumPostModeration extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            showConfirm: false
        };
    }

    componentWillReceiveProps(nextProps) {
        const { moderation, topic } = nextProps;
        if (moderation.last) {
            const last_topic = moderation.last.payload[1].topic;
            if (last_topic === topic._id) {
                const processing = moderation.last.loading;
                if (!processing) {
                    switch (moderation.last.type) {
                        case "MODERATION_REMOVE_RESOLVED":
                        case "MODERATION_RESTORE_RESOLVED":
                            new Noty({
                                closeWith: ['click', 'button'],
                                layout: 'topRight',
                                progressBar: true,
                                theme: 'semanticui',
                                text: 'Post removal operation successfully broadcast.',
                                type: 'info',
                                timeout: 4000
                            }).show();
                            this.props.removeTopic(last_topic);
                            this.props.onClose();
                            break;
                        default:
                            break;
                    }
                }
            }
        }
    }

    showConfirm = () => {
        this.setState({showConfirm: true});
    }

    hideConfirm = () => {
        this.setState({showConfirm: false});
    }

    handleHidePost = (account, wif) => {
        this.props.actions.moderatorHidePostForum(wif, this.props.account, this.props.topic, this.props.forum);
        setTimeout(() => {
          window.location.reload();},
        500);
    }

    handleRevealPost = (account, wif) => {
        this.props.actions.moderatorRevealPostForum(wif, this.props.account, this.props.topic, this.props.forum);
        setTimeout(() => {
          //window.location.reload();
        },
        500);
    }

    render() {
        const { account, forum, moderation, topic } = this.props;
        const moderatorRemoved = (topic._removedFrom && topic._removedFrom.indexOf(forum['_id']) >= 0);
        if (moderatorRemoved) {
        }
        let processing = false;
        let lastResult = false;
        const isHidden = !!forum.hidden[topic.id];
        /*if (moderation.last) {
          const last_topic = moderation.last.payload[1].topic
          if(last_topic === topic._id) {
            processing = moderation.last.loading
            if(!processing) {
              let requestType = ''
              switch(moderation.last.type) {
                case "MODERATION_REMOVE_RESOLVED":
                  requestType = 'removal'
                  break;
                case "MODERATION_RESTORE_RESOLVED":
                  requestType = 'restore'
                  break;
                default:
                  requestType = 'unknown'
                  break;
              }
              lastResult = (
                <Message icon color='yellow'>
                  <Icon name='circle notched' loading />
                  <Message.Content>
                    <Message.Header>Your {requestType} request has been broadcast to the blockchain.</Message.Header>
                    Please wait up to 5 minutes for your changes to show on chainBB.
                  </Message.Content>
                </Message>
              )
            }
          }
        }*/
        let actions = {signinAccount: isHidden ? this.handleRevealPost : this.handleHidePost,
          onClose: this.hideConfirm};
        return (
            <span>
                <Button size='small'
                    color={isHidden ? 'red' : 'blue'}
                    icon={isHidden ? 'eye' : 'low vision'}
                    onClick={this.showConfirm} />
                <LoginModal authType="active" noButton={true}
                    open={this.state.showConfirm}
                    actions={actions} />
                {/*<Confirm
                  confirmButton={tt('forum_controls.reveal_btn')}
                  cancelButton={tt('g.cancel')}
                  content={tt('forum_controls.reveal_confirm')}
                  open={this.state.promptRevealPost}
                  onCancel={this.handleRevealCancel}
                  onConfirm={this.handleRevealPost}
                />*/}
            </span>
        );
    }
}
