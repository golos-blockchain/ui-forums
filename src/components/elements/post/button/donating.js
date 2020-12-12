import React from 'react';
import tt from 'counterpart';

import { Button, Popup, Dropdown, Icon, Label, Modal, Divider } from 'semantic-ui-react'
import { Form } from 'formsy-semantic-ui-react'
//import VoteButtonOptions from './vote/options'
import translateError from '../../../../utils/translateError'

export default class Donating extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            modalOpen: false,
            amount: parseFloat(0).toFixed(3)
        };
        const { category, author, permlink } = this.props.post;
        this.props.fetchPostDonates({category, author, permlink});
    }

    onHandleSubmit = (formData) => {
        setTimeout(() => {
            const {author, permlink, category} = this.props.post;
            this.props.onDonateCast({
                account: this.props.account,
                author: author,
                permlink: permlink,
                amount: parseFloat(formData.amount).toFixed(3) + ' GOLOS'
            });
            this.props.fetchAccount(this.props.account.name);
            this.setState({
                modalOpen: false
            });
        }, 500);
    }

    showModal = (e) => {
        e.preventDefault();
        this.setState({
            modalOpen: true
        });
        return false;
    }
    hideModal = (e) => {
        e.preventDefault();
        this.setState({
            modalOpen: false
        });
        return false;
    }

    onAmountChange = (e) => {
        if (e.key != '.' && (e.key < '0' || e.key > '9')) {
            e.preventDefault();
        }
    }

    onPresetClick = (e, data) => {
        this.setState({
          amount: data.amount
        });
    }

    openVoter = (e, data) => {
        let win = window.open('/@' + data.text, '_blank');
        win.focus();
    }

    render() {
        if (this.props.error) {
            alert(translateError('donate', this.props.error));
            this.props.clearDonateError();
        }
        let post = this.props.post;

        // for Dropdown
        let donate_sum = parseInt(parseFloat(post.donates.split(' ')[0])) + ' GOLOS';
        if (post.donates_uia != 0) {
            donate_sum += ' (+' + post.donates_uia + ')';
        }
        let donates = [];
        let donatesJoined = {};
        for (let item of post.donate_list) {
            if (item.app != 'golos-id') continue;
            if (!donatesJoined[item.from]) {
                donatesJoined[item.from] = {amount: parseFloat(item.amount.split(' ')[0])};
                continue;
            }
            donatesJoined[item.from].amount += parseFloat(item.amount.split(' ')[0]);
        }
        let i = 0;
        for (let [from, item] of Object.entries(donatesJoined)) {
            donates.push(<Dropdown.Item
                text={from}
                description={parseInt(item.amount) + ' GOLOS'}
                key={i}
                onClick={this.openVoter} />);
            i++;
        }


        // for Modal
        let presets = [5, 10, 25, 50, 100];
        for (const i in presets) {
            presets[i] = (<Button color='blue' animated='fade' amount={presets[i]} onClick={this.onPresetClick}>
                <Button.Content visible>{presets[i]}</Button.Content>
                <Button.Content hidden>+{presets[i]}</Button.Content>
            </Button>);
        }
        let tip_balance = 0.0;
        let tip_balance_str = '0 GOLOS';
        if (this.props.account.data) {
            tip_balance = parseFloat(this.props.account.data.tip_balance.split(' ')[0]);
            tip_balance_str = <span>{tt('account.tip_balance')}: &nbsp;<b>{parseInt(tip_balance) + ' GOLOS'}</b></span>;
        }

        const errorLabel = <Label color="red" pointing/>
        return (<div style={{float: 'left'}}>
            &nbsp;&nbsp;&nbsp;
            <Button as='div' labelPosition='right'>
                <Button color='blue' onClick={this.showModal}>
                    <Icon name='dollar' />
                    {tt('donating.donate')}
                </Button>
                <Label as='a' basic color='blue' pointing='left'>
                    <Dropdown text={donate_sum}>
                        <Dropdown.Menu>
                            {donates}
                        </Dropdown.Menu>
                    </Dropdown>
                </Label>
            </Button>

            <Modal size='small' open={this.state.modalOpen}>
                <Modal.Header>{tt('transfer.transfer')}</Modal.Header>
                <Modal.Content>
                    <Modal.Description>
                        <Button.Group>
                            {presets}
                        </Button.Group>
                        &nbsp;&nbsp;&nbsp;&nbsp;
                        <Dropdown floating trigger={tip_balance_str}>
          
                        </Dropdown><br/><br/>
                        <Form
                            ref={ref => this.form = ref }
                            onValidSubmit={this.onHandleSubmit}
                        >
                            <Form.Input
                                name="amount"
                                label={tt('transfer.amount')}
                                required
                                focus
                                autoFocus
                                onKeyPress={this.onAmountChange}
                                label={tt('transfer.amount')}
                                value={this.state.amount}
                                validations={{
                                    isFloat: true,
                                    isGood: (values, value) => {
                                        let v = parseFloat(value);
                                        //if (isNaN(v)) return true; // it is isFloat case
                                        if (v <= 0) return tt('g.this_field_required');
                                        if (v > tip_balance) return tt('donating.not_enough');
                                        return true;
                                    } 
                                }}
                                validationErrors={{
                                    isDefaultRequiredValue: tt('g.this_field_required'),
                                    isFloat: 'Неверная сумма'
                                }}
                                errorLabel={ errorLabel }
                            />
                            <Form.Input
                                name="note"
                                label={tt('transfer.note')}
                                focus
                                placeholder={tt('transfer.note_placeholder')}
                                errorLabel={ errorLabel }
                            />
                            <Divider hidden />
                            <Button floated='right' animated primary>
                                <Button.Content visible>{tt('transfer.transfer_btn')}</Button.Content>
                                <Button.Content hidden>{tt('donating.thanks')}</Button.Content>
                            </Button>
                            <Button color='orange' onClick={this.hideModal}>{tt('g.cancel')}</Button>
                        </Form>
                    </Modal.Description>
                </Modal.Content>
            </Modal>
        </div>);
    }
}
