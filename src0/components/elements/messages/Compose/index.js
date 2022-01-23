import React from 'react';
import tt from 'counterpart';
import { Picker } from 'emoji-picker-element';
import TextareaAutosize from 'react-textarea-autosize';

import { Button, Icon } from 'semantic-ui-react';

import { displayQuoteMsg } from '../../../../utils/MessageUtils';

import './Compose.css';

export default class Compose extends React.Component {
    onKeyDown = (e) => {
        if (!window.IS_MOBILE && e.keyCode === 13) {
            if (e.shiftKey) {
            } else {
                e.preventDefault();
                const { onSendMessage } = this.props;
                onSendMessage(e.target.value, e);
            }
        }
    };

    onSendClick = (e) => {
        e.preventDefault();
        const { onSendMessage } = this.props;
        const input = document.getElementsByClassName('msgs-compose-input')[0];
        input.focus();
        onSendMessage(input.value, e);
    };

    init = () => {
        this._tooltip = document.querySelector('.msgs-emoji-picker-tooltip');
        if (!this._tooltip)
            return;

        if (this._tooltip.childNodes.length)
            return;

        this._picker = new Picker({
            locale: tt.getLocale(),
            i18n: tt('emoji_i18n'),
        });

        this._picker.addEventListener('emoji-click', this.onEmojiSelect);

        this._tooltip.appendChild(this._picker);

        setTimeout(() => {
            const button = document.querySelector('.msgs-emoji-picker-opener');
            if (button) {
                button.addEventListener('click', this.onEmojiClick);
                document.body.addEventListener('click', this.onBodyClick);
            }
        }, 500);
    };

    componentDidMount() {
        this.init();
    }

    componentDidUpdate() {
        this.init();
    }

    onEmojiClick = (event) => {
        event.stopPropagation();
        this._tooltip.classList.toggle('shown');
        if (!this._tooltip.classList.contains('shown')) {
            const input = document.getElementsByClassName('msgs-compose-input')[0];
            if (input) {
                input.focus();
            }
        }
    };

    onBodyClick = (event) => {
        if (!this._tooltip) return;
        if (event.target.tagName.toLowerCase() === 'emoji-picker') return;
        this._tooltip.classList.remove('shown');
    };

    insertAtCursor(myField, myValue) {
        //IE support
        if (document.selection) {
            myField.focus();
            let sel = document.selection.createRange();
            sel.text = myValue;
        }
        //MOZILLA and others
        else if (myField.selectionStart || myField.selectionStart === '0') {
            let startPos = myField.selectionStart;
            let endPos = myField.selectionEnd;
            myField.value = myField.value.substring(0, startPos)
                + myValue
                + myField.value.substring(endPos, myField.value.length);
        } else {
            myField.value += myValue;
        }
    }

    onEmojiSelect = (event) => {
        this._tooltip.classList.toggle('shown');

        const input = document.getElementsByClassName('msgs-compose-input')[0];
        if (input) {
            input.focus();
            this.insertAtCursor(input, ' ' + event.detail.unicode + ' ');
        }
    };

    onPanelDeleteClick = (event) => {
        if (this.props.onPanelDeleteClick) {
            this.props.onPanelDeleteClick(event);
        }
    }

    onPanelReplyClick = (event) => {
        if (this.props.onPanelReplyClick) {
            this.props.onPanelReplyClick(event);
        }
    }

    onPanelEditClick = (event) => {
        if (this.props.onPanelEditClick) {
            this.props.onPanelEditClick(event);
        }
    }

    onPanelCloseClick = (event) => {
        if (this.props.onPanelCloseClick) {
            this.props.onPanelCloseClick(event);
        }
    }

    onCancelReply = (event) => {
        if (this.props.onCancelReply) {
            this.props.onCancelReply(event);
        }
    }

    onHeightChange = (height) => {
        const cont = document.getElementsByClassName('message-list-container')[0];
        if (cont) {
            const oldPB = parseInt(cont.style.paddingBottom, 10) || 0; // if NaN, will be 0
            const newPB = 30 + height;
            cont.style.paddingBottom = newPB + 'px';

            const delta = newPB - oldPB;

            if (delta > 0) {
                const scroll = document.getElementsByClassName('msgs-content')[0];
                if (scroll) scroll.scrollTop += delta;
            }
        }
    }

    render() {
        const { rightItems, replyingMessage } = this.props;
        const { onPanelDeleteClick, onPanelReplyClick, onPanelEditClick, onPanelCloseClick } = this;

        const selectedMessages = Object.entries(this.props.selectedMessages);
        let selectedMessagesCount = 0;
        let selectedEditablesCount = 0;
        for (let [, info] of selectedMessages) {
            selectedMessagesCount++;
            if (info.editable) {
                selectedEditablesCount++;
            }
        }

        let quote = null;
        if (replyingMessage) {
            quote = (<div className='msgs-compose-reply'>
                    <div className='msgs-compose-reply-from'>
                        {replyingMessage.quote.from}
                    </div>
                    {displayQuoteMsg(replyingMessage.quote.body)}
                    <Icon name='close' className='msgs-compose-reply-close' onClick={this.onCancelReply} />
                </div>);
        }

        const sendButton = selectedMessagesCount ? null :
            (<Button primary circular icon='envelope' className='msgs-compose-send' title={tt('g.submit')}
                    onClick={this.onSendClick}
                >
            </Button>);

        return (
            <div className='msgs-compose'>
                {
                    !selectedMessagesCount ? rightItems : null
                }
                {!selectedMessagesCount ? (<div className='msgs-compose-input-panel'>
                        {quote}
                        <TextareaAutosize
                            className='msgs-compose-input'
                            placeholder={tt('messages.type_a_message')}
                            onKeyDown={this.onKeyDown}
                            minRows={2}
                            maxRows={14}
                            onHeightChange={this.onHeightChange}
                        />
                    </div>) : null}

                {sendButton}

                {selectedMessagesCount ? (<div className='msgs-compose-panel'>
                    {(selectedMessagesCount === 1) ? (<Button
                        icon='chat'
                        color='blue'
                        content={!window.IS_MOBILE ? tt('g.reply') : null}
                        onClick={onPanelReplyClick} />) : null}
                    <Button
                        color='blue'
                        content={tt('g.cancel')}
                        inverted
                        className='cancel-button' onClick={onPanelCloseClick} />
                    <Button
                        icon='remove'
                        inverted
                        color='red'
                        content={!window.IS_MOBILE ? tt('g.remove') : null}
                        className='delete-button' onClick={onPanelDeleteClick} />
                    {(selectedMessagesCount === 1 && selectedEditablesCount === 1) ? (<Button
                        icon='pencil'
                        inverted
                        color='blue'
                        content={!window.IS_MOBILE ? tt('g.edit') : null}
                        className='edit-button' onClick={onPanelEditClick} />) : null}
                </div>) : null}
            </div>
        );
    }
}
