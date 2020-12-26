import React from 'react';
import tt from 'counterpart';
import { Asset } from 'golos-classic-js/lib/utils';

import { Button, Popup, Dropdown, Icon, Label, Modal, Divider } from 'semantic-ui-react';
import { Form } from 'formsy-semantic-ui-react';

import * as CONFIG from '../../../../../config';

//import VoteButtonOptions from './vote/options';
import translateError from '../../../../utils/translateError';

export default class Donating extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            modalOpen: false,
            amount: parseFloat(0).toFixed(3),
            symbol: 'GOLOS',
            prec: 3,
            valid: false
        };
        const { category, author, permlink } = this.props.post;
        this.props.fetchPostDonates({category, author, permlink});
    }

    onValid = () => {
        this.setState({ valid: true });
    };

    onInvalid = () => {
        this.setState({ valid: false });
    };

    onHandleSubmit = (formData) => {
        setTimeout(() => {
            const { author, permlink, category } = this.props.post;
            const { symbol, prec } = this.state;
            this.props.onDonateCast({
                account: this.props.account,
                author: author,
                permlink: permlink,
                amount: parseFloat(formData.amount).toFixed(prec) + ' ' + symbol
            });
            this.props.fetchAccount(this.props.account.name);
            this.setState({
                modalOpen: false
            });
        }, 500);
    };

    showModal = (e) => {
        e.preventDefault();
        this.setState({
            modalOpen: true
        });
        return false;
    };
    hideModal = (e) => {
        e.preventDefault();
        this.setState({
            modalOpen: false
        });
        return false;
    };

    onAmountChange = (e) => {
        if (e.key != '.' && (e.key < '0' || e.key > '9')) {
            e.preventDefault();
        }
    };

    onPresetClick = (e, data) => {
        this.setState({
            amount: data.amount
        });
    };

    openVoter = (e, data) => {
        let win = window.open('/@' + data.text, '_blank');
        win.focus();
    };

    changeSym = (e, data) => {
        this.setState({
            symbol: data.sym,
            prec: parseInt(data.prec)
        });
    };

    renderDonateList(donate_list) {
        let donates = [];
        let donatesJoined = {};
        let donate_count = 0;
        for (let item of donate_list) {
            if (item.app != 'golos-id') continue;
            if (donate_count == CONFIG.FORUM.donates_per_page) break;
            const asset = Asset(item.amount);
            if (donatesJoined[item.from]) {
                let fromList = donatesJoined[item.from].assets;
                if (fromList[asset.symbol]) {
                    fromList[asset.symbol].amount += asset.amount;
                    continue;
                }
            } else {
                donatesJoined[item.from] = {banned: item.from_banned, assets: {}};
            }
            donatesJoined[item.from].assets[asset.symbol] = asset;
            ++donate_count;
        }
        let i = 0;
        for (let [from, item] of Object.entries(donatesJoined)) {
            for (let [sym, asset] of Object.entries(item.assets)) {
                donates.push(<Dropdown.Item
                    text={from}
                    description={asset.toString(0)}
                    key={i}
                    style={{textDecoration: donatesJoined[from].banned ? 'line-through' : undefined}}
                    onClick={this.openVoter} />);
                i++;
            }
        }
        if (donate_count < donate_list.length) {
            donates.push(<Dropdown.Header content={tt('donating.has_more_DONATES', {DONATES: donate_list.length - donate_count})} />);
        }
        return donates;
    }

    render() {
        if (this.props.error) {
            alert(translateError('donate', this.props.error));
            this.props.clearDonateError();
        }
        let post = this.props.post;

        // for Dropdown

        let donate_uia_sum = null;
        let donate_sum = Asset(post.donates).toString(0);
        if (post.donates_uia != 0) {
            donate_uia_sum =  '  +' + post.donates_uia + ' UIA';
        }
        let donates = this.renderDonateList(post.donate_list);
        let donates_uia = this.renderDonateList(post.donate_uia_list);

        // for Modal

        let presets = [5, 10, 25, 50, 100];
        for (const i in presets) {
            presets[i] = (<Button color='blue' animated='fade' amount={presets[i]} onClick={this.onPresetClick}>
                <Button.Content visible>{presets[i]}</Button.Content>
                <Button.Content hidden>+{presets[i]}</Button.Content>
            </Button>);
        }

        const {symbol} = this.state;
        let balances = [];

        let tip_balance = 0.0;
        let tip_balance_str = '0 GOLOS';
        if (this.props.account.data) {
            tip_balance = Asset(this.props.account.data.tip_balance).amountFloat;

            balances.push(<Dropdown.Item
                text={Asset(this.props.account.data.tip_balance).toString(0)}
                key='GOLOS'
                sym='GOLOS'
                prec='3'
                onClick={this.changeSym} />);

            for (let [sym, obj] of Object.entries(this.props.account.data.uia_balances)) {
                const asset = Asset(obj.tip_balance);
                const asset_str = asset.toString(0);
                if (asset_str.startsWith('0 ')) continue;
                balances.push(<Dropdown.Item
                    text={asset_str}
                    key={asset.symbol}
                    sym={asset.symbol}
                    prec={asset.precision}
                    onClick={this.changeSym} />);

                if (sym === symbol) {
                    tip_balance = asset.amountFloat;
                }
            }

            tip_balance_str = (<span>{tt('account.tip_balance')}: &nbsp;<b>{parseInt(tip_balance) + ' ' + symbol}</b></span>);
        }

        let button = (<Button color='blue' onClick={this.showModal}>
            <Icon name='dollar' />
            {tt('donating.donate')}
        </Button>);

        if (!this.props.account.isUser) {
            button = (
                <Popup
                    trigger={button}
                    position='bottom center'
                    inverted
                    content={tt('donating.you_must_be_logged_in_to_donate')}
                    basic
                />
            );
        }

        const errorLabel = <Label color="red" pointing/>
        return (<div style={{float: 'left'}}>
            &nbsp;&nbsp;&nbsp;
            <Button as='div' labelPosition='right'>
                {button}
                <Label as='a' basic color='blue' pointing='left'>
                    <Dropdown text={donate_sum} icon={donate_sum == '0 GOLOS' ? null : undefined}>
                        <Dropdown.Menu>
                            {donates}
                        </Dropdown.Menu>
                    </Dropdown>
                    {donate_uia_sum != null ? <span>&nbsp;&nbsp;&nbsp;&nbsp;|&nbsp;&nbsp;&nbsp;<Dropdown text={donate_uia_sum}>
                        <Dropdown.Menu>
                            {donates_uia}
                        </Dropdown.Menu>
                    </Dropdown></span> : null}
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
                            <Dropdown.Menu>
                                {balances}
                            </Dropdown.Menu>
                        </Dropdown><br/><br/>
                        <Form
                            ref={ref => this.form = ref }
                            onValidSubmit={this.onHandleSubmit}
                            onValid={this.onValid}
                            onInvalid={this.onInvalid}
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
                                        const v = parseFloat(value);
                                        if (v <= 0) return tt('g.this_field_required');
                                        if (v > tip_balance) return tt('donating.not_enough');

                                        const { prec } = this.state;
                                        let valuePrec = null;
                                        try {
                                            valuePrec = Asset(value.toString()).precision;   
                                        } catch (ex) {}
                                        if (valuePrec && valuePrec > prec) {
                                            return tt('donating.over_precision_PREC', {PREC: prec});
                                        }

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
                            <Button floated='right' animated={this.state.valid} primary={this.state.valid}>
                                <Button.Content visible>{tt('transfer.transfer_btn')}</Button.Content>
                                {this.state.valid ? <Button.Content hidden>{tt('donating.thanks')}</Button.Content> : null}
                            </Button>
                            <Button color='orange' onClick={this.hideModal}>{tt('g.cancel')}</Button>
                        </Form>
                    </Modal.Description>
                </Modal.Content>
            </Modal>
        </div>);
    }
}
