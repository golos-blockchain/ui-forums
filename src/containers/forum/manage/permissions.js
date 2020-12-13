import React from 'react';
import golos from 'golos-classic-js';
import tt from 'counterpart';

import { Header, Icon, Segment, Table, Dropdown, Button } from 'semantic-ui-react';

import * as CONFIG from '../../../../config';

import AccountLink from '../../../components/elements/account/link';
import LoginModal from '../../../components/elements/login/modal';

export default class ForumPermissions extends React.Component {
    constructor(props, state) {
        super(props);
        const { moders, supers, admins } = props;
        this.state = {
            moders,
            supers,
            admins,
            moders_edit: this.arrToEdit(moders),
            supers_edit: this.arrToEdit(supers),
            admins_edit: this.arrToEdit(admins),
            showConfirm: false
        };
    }

    arrToList = (arr) => {
        let list = [];
        for (let item of arr) {
            list.push(<span style={{float: 'left'}}><AccountLink username={item}/>&nbsp;&nbsp;</span>);
        }
        return list;
    }

    arrToEdit = (arr) => {
        let edit = [];
        for (let item of arr) {
            edit.push({text: item, value: item});
        }
        return edit;
    }

    onModerChange = (e, { value }) => this.setState({ moders: value });

    onSuperChange = (e, { value }) => this.setState({ supers: value });

    onAdminChange = (e, { value }) => this.setState({ admins: value });

    onAddModer = (e, { value }) => {
        this.setState((prevState) => ({
            moders_edit: [{ text: value, value }, ...prevState.moders_edit],
        }))
    }

    onAddSuper = (e, { value }) => {
        this.setState((prevState) => ({
            supers_edit: [{ text: value, value }, ...prevState.supers_edit],
        }))
    }

    onAddAdmin = (e, { value }) => {
        this.setState((prevState) => ({
            admins_edit: [{ text: value, value }, ...prevState.admins_edit],
        }))
    }

    handleApply = (data) => {
        this.setState({showConfirm: true})
    }
    hideConfirm = () => this.setState({showConfirm: false})

    broadcast = async (account, wif) => {
        try {
            await golos.broadcast.customJson(wif, [account], [], "account_notes",
                JSON.stringify(['set_value', {
                    account: account,
                    key: 'g.f.' + CONFIG.FORUM._id.toLowerCase() + '.hidmsg.lst.accs',
                    value: JSON.stringify(this.state.moders)
                }]));
            await golos.broadcast.customJson(wif, [account], [], "account_notes",
                JSON.stringify(['set_value', {
                    account: account,
                    key: 'g.f.' + CONFIG.FORUM._id.toLowerCase() + '.hidacc.lst.accs',
                    value: JSON.stringify(this.state.supers)
                }]));
            /*await golos.broadcast.customJson(wif, [account], [], "account_notes",
                JSON.stringify(['set_value', {
                    account: account,
                    key: 'g.f.' + CONFIG.FORUM._id.toLowerCase() + '.banacc.lst.accs',
                    value: JSON.stringify(this.state.admins)
                }]));*/
        } catch (err) {
            console.log(err);
            alert(err);
        }
    }

    render() {
        const { account } = this.props;
        const { moders, supers, admins, moders_edit, supers_edit, admins_edit, showConfirm } = this.state;
        let moder_list = null;
        let super_list = null;
        let admin_list = null;
        if (account.name === CONFIG.FORUM.creator) {
            moder_list = (
                <Dropdown
                    options={moders_edit}
                    value={moders}
                    onChange={this.onModerChange}
                    placeholder={tt('permissions.placeholder')}
                    noResultsMessage={null}
                    search
                    selection
                    fluid
                    multiple
                    allowAdditions
                    onAddItem={this.onAddModer}
                />)
            super_list = (
                <Dropdown
                    options={supers_edit}
                    value={supers}
                    onChange={this.onSuperChange}
                    placeholder={tt('permissions.placeholder')}
                    noResultsMessage={null}
                    search
                    selection
                    fluid
                    multiple
                    allowAdditions
                    onAddItem={this.onAddSuper}
                />)
            /*admin_list = (
                <Dropdown
                    options={admins_edit}
                    value={admins}
                    onChange={this.onAdminChange}
                    placeholder={tt('permissions.placeholder')}
                    noResultsMessage={null}
                    search
                    selection
                    fluid
                    multiple
                    allowAdditions
                    onAddItem={this.onAddAdmin}
                />)*/
        } else {
            moder_list = this.arrToList(moders);
            super_list = this.arrToList(supers);
            /*admin_list = this.arrToList(admins);*/
        }

        let submit = null;
        if (account.name === CONFIG.FORUM.creator) {
            submit = (
                <Button fluid color='blue' onClick={this.handleApply}>
                    {tt('forum_controls.submit_changes')}
                </Button>
            )
        }
        let actions = {signinAccount: this.broadcast, onClose: this.hideConfirm};
        return(
            <div>
                <LoginModal authType="active" noButton={true} open={showConfirm} actions={actions}/>
                <Segment padded attached='top' secondary color='purple'>
                    <Header size='large'>
                        {tt('permissions.title')}
                        <Header.Subheader>
                            {tt('permissions.description')}
                        </Header.Subheader>
                    </Header>
                </Segment>
                <Header attached>
                {tt('permissions.moderators')}
                    <Header.Subheader>
                        {tt('permissions.moderators_desc')}
                    </Header.Subheader>
                </Header>
                <Table attached size='large'>
                    <Table.Body>
                        <Table.Row>
                            <Table.Cell collapsing>
                                <Icon color='green' name='checkmark' />
                            </Table.Cell>
                            <Table.Cell>
                                {moder_list}
                            </Table.Cell>
                        </Table.Row>
                    </Table.Body>
                </Table>
                <Header attached>
                {tt('permissions.super_moderators')}
                    <Header.Subheader>
                        {tt('permissions.super_moderators_desc')}
                    </Header.Subheader>
                </Header>
                <Table attached size='large'>
                    <Table.Body>
                        <Table.Row>
                            <Table.Cell collapsing>
                                <Icon color='green' name='checkmark' />
                            </Table.Cell>
                            <Table.Cell>
                                {super_list}
                            </Table.Cell>
                        </Table.Row>
                    </Table.Body>
                </Table>
                {/*<Header attached>
                    {tt('permissions.admins')}
                    <Header.Subheader>
                        {tt('permissions.admins_desc')}
                    </Header.Subheader>
                </Header>
                <Table attached size='large'>
                    <Table.Body>
                        <Table.Row>
                            <Table.Cell collapsing>
                                <Icon color='green' name='checkmark' />
                            </Table.Cell>
                            <Table.Cell>
                                {admin_list}
                            </Table.Cell>
                        </Table.Row>
                    </Table.Body>
                </Table>*/}
                {submit}
            </div>
        );
    }
}
