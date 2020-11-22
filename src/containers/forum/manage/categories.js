import React from 'react';
import { withRouter } from "react-router-dom";
import { bindActionCreators } from 'redux';
import ReactDOMServer from 'react-dom/server';
import { connect } from 'react-redux'
import _ from 'lodash'
import slug from 'slug'
import Noty from 'noty'
import tt from 'counterpart';

import { Button, Dimmer, Divider, Header, Icon, Label, Loader, Modal, Segment, Table } from 'semantic-ui-react'
import { Form } from 'formsy-semantic-ui-react'

import * as types from '../../../actions/actionTypes';
import * as forumActions from '../../../actions/forumActions'

import AccountLink from '../../../components/elements/account/link'

const fields = ['name', 'description', 'tags', 'exclusive']

class ForumCategoriesForm extends React.Component {
    constructor(props) {
        super(props)
        this.state = {
            name: '',
            description: '',
            tags: '',
            exclusive: false,
            awaitingBlock: false,
            processing: false,
            showConfirm: false,
            addingCategory: false,
            tags_detected: []
        }
        const state = {}
        fields.map((field) => state[field] = null)
        this.state = state
    }
    componentWillMount() {
        const { target } = this.props.forum
        fields.map((field) => this.handleChange(false, {
            name: field,
            value: target[field] || false
        }))
        if(target.exclusive) {
            this.setState({
                exclusive: target.exclusive
            })
        }
    }
    componentWillReceiveProps(nextProps) {
        const { forum } = nextProps
        if(forum.last) {
            switch(forum.last.type) {
                case types.FORUM_CONFIG_PROCESSING:
                    this.setState({processing: true})
                    break;
                case types.FORUM_CONFIG_RESOLVED:
                    if (this.state.showConfirm && this.state.processing) {
                        this.setState({
                            processing: false,
                            awaitingBlock: true,
                        })
                        if(this.props.newForum) {
                            this.props.history.push(`/f/${this.props.forum.target._id}`);
                        }
                        this.timeout = setTimeout(() => {
                            this.setState({
                                showConfirm: false,
                                awaitingBlock: false,
                            })
                            new Noty({
                                closeWith: ['click', 'button'],
                                layout: 'topRight',
                                progressBar: true,
                                theme: 'semanticui',
                                text: ReactDOMServer.renderToString(
                                    <Header>
                                      Forum configuration submitted!
                                      <Header.Subheader>
                                        If these changes do not appear immediately - wait a few moment and then refresh the page.
                                      </Header.Subheader>
                                    </Header>
                                ),
                                type: 'success',
                                timeout: 8000
                            }).show();
                        }, 3000)
                    }
                    break;
                default:
                    break;
            }
        }
    }
    handleChange = (e, data) => {
        if (data.value && data.value.constructor === Array) {
            data.value = data.value.join(",")
        }
        if (typeof this.state[data.name] !== 'undefined') {
            if (data.name === 'tags' && data.value) {
                const detected = data.value.split(',').filter((tag) => {
                    return !!tag && tag.trim() !== ''
                }).map((tag) => {
                    return slug(tag, {
                        replacement: '-',
                        remove: /[._]/g,
                        lower: true
                    })
                })
                this.setState({'tags_detected': detected})
            }
            this.setState({[data.name]: data.value})
        }
    }
    toggleExclusivity = (e, data) => {
        this.setState({exclusive: data.checked})
    }

    addCategory = (e) => {
      e.preventDefault()
      this.setState({addingCategory: true})
      return false
    }
    onAddCancel = (e) => {
      e.preventDefault()
      this.setState({addingCategory: false})
      return false
    }

    handleSubmit = (data) => {
        this.setState({showConfirm: true})
    }
    hideConfirm = () => this.setState({showConfirm: false})
    broadcast = () => {
        const settings = {
            description: this.state.description,
            exclusive: this.state.exclusive,
            name: this.state.name,
            tags: this.state.tags_detected,
        }
        const namespace = this.props.forum.target._id
        this.props.actions.forumConfig(this.props.account, namespace, settings)
    }
    render() {
        const { account, forum } = this.props
        const { target } = forum
        const { _id } = target
        const { name, description, tags, addingCategory } = this.state
        const tag_labels = (this.state.tags) ? this.state.tags_detected.map((tag) => (
            <Label as='a' color='blue' key={tag}>
                <Icon name='tag' />
                {tag}
            </Label>
        )) : []
        const errorLabel = <Label color="red" pointing/>
        let submit = (
            <Button fluid disabled>
                {tt('forum_controls.only_creator_can_edit')}
            </Button>
        )
        if (account.name === target.creator) {
            submit = (
                <Button fluid color='blue' type='submit'>
                    {tt('forum_controls.submit_changes')}
                </Button>
            )
        }
        let modal = false
        if (this.state.showConfirm) {
            let { awaitingBlock, processing } = this.state
            modal = (
                <Modal
                    open={true}
                    closeIcon={true}
                    color='blue'
                    onClose={this.hideConfirm}
                    size='small'
                >
                    <Segment basic style={{marginTop: 0}} color='orange'>
                        <Dimmer active={processing}>
                            <Loader>Submitting...</Loader>
                        </Dimmer>
                        <Dimmer active={awaitingBlock}>
                            <Loader indeterminate>Waiting for next block...</Loader>
                        </Dimmer>
                        <Header icon='wait' content='Confirm Information' style={{marginTop: 0}} />
                        <Modal.Content>
                            <Segment basic padded>
                                <p style={{fontSize: '1.33em'}}>
                                    Please review this information to ensure it is correct. Broadcast the transaction once completed.
                                </p>
                                <Table definition>
                                    <Table.Row>
                                        <Table.Cell collapsing>Account</Table.Cell>
                                        <Table.Cell><AccountLink username={account.name} /></Table.Cell>
                                    </Table.Row>
                                    <Table.Row>
                                        <Table.Cell collapsing>Namespace</Table.Cell>
                                        <Table.Cell>{target._id}</Table.Cell>
                                    </Table.Row>
                                    <Table.Row>
                                        <Table.Cell collapsing>Exclusive</Table.Cell>
                                        <Table.Cell>
                                            {(this.state.exclusive)
                                                ? <Icon color='green' name='checkmark' />
                                                : <Icon color='red' name='close' />
                                            }
                                        </Table.Cell>
                                    </Table.Row>
                                    <Table.Row>
                                        <Table.Cell collapsing>Name</Table.Cell>
                                        <Table.Cell>{this.state.name}</Table.Cell>
                                    </Table.Row>
                                    <Table.Row>
                                        <Table.Cell collapsing>Description</Table.Cell>
                                        <Table.Cell>{this.state.description}</Table.Cell>
                                    </Table.Row>
                                    <Table.Row>
                                        <Table.Cell collapsing>Tags</Table.Cell>
                                        <Table.Cell>{tag_labels}</Table.Cell>
                                    </Table.Row>
                                </Table>
                                <Segment basic textAlign='center'>
                                    <Button
                                        color='blue'
                                        content='Confirmed - Broadcast Transaction'
                                        onClick={this.broadcast}
                                    />
                                </Segment>
                            </Segment>
                        </Modal.Content>
                    </Segment>
                </Modal>
            )
        }
        let newForumDisplay = false
        if (this.props.newForum) {
            newForumDisplay = (
                <Segment>
                    <Header size='large'>
                        <Icon name='checkmark box' />
                        <Header.Content>
                            Reservation confirmed!
                            <Header.Subheader>
                                This forum has successfully been created.
                            </Header.Subheader>
                        </Header.Content>
                    </Header>
                    <Segment padded>
                        <Header>
                            <Icon name='square outline' />
                            <Header.Content>
                                Step #3 - Finish configuring the forum settings
                                <Header.Subheader>
                                    The last step is to configure how this forum will be displayed and interact with the blockchain. You can revisit these page and alter these settings whenever you'd like to make changes.
                                </Header.Subheader>
                            </Header.Content>
                        </Header>
                    </Segment>
                </Segment>
            )
        }
        return (
            <div>
                {modal}
                {newForumDisplay}
                <Form
                    loading={this.state.loading}
                    onValidSubmit={this.handleSubmit}
                    >
                    <Segment padded attached='top' secondary color='orange'>
                        <Header size='large'>
                            {tt('categories.title')}
                            <Header.Subheader>
                                {tt('categories.description')}
                            </Header.Subheader>
                        </Header>
                    </Segment>
                    <Segment attached>
                          <Button
                            color='purple'
                            onClick={this.addCategory}
                          >
                            {tt('g.add')}
                          </Button>
                          <Table size='small' verticalAlign='middle'>
                            <Table.Header>
                              <Table.Row>
                                <Table.HeaderCell>{tt('categories.tag')}</Table.HeaderCell>
                                <Table.HeaderCell>{tt('categories.name_ru')}</Table.HeaderCell>
                                <Table.HeaderCell>{tt('categories.name')}</Table.HeaderCell>
                                <Table.HeaderCell />
                              </Table.Row>
                            </Table.Header>
                            <Table.Body />
                          </Table>
                        <Divider section />
                        {submit}
                    </Segment>
                      <Modal size='small' open={addingCategory}>
                        <Modal.Header>{tt('categories.add')}</Modal.Header>
                        <Modal.Content>
                          <Modal.Description>
                            <Form
                              ref={ref => this.form = ref }
                            >
                              <Form.Input
                                name="name_ru"
                                label={tt('categories.name_ru')}
                                required
                                focus
                                autoFocus
                                validationErrors={{
                                  isDefaultRequiredValue: tt('g.this_field_required')
                                }}
                                errorLabel={ errorLabel }
                              />
                              <Form.Input
                                name="name_en"
                                label={tt('categories.name')}
                                required
                                focus
                                validationErrors={{
                                  isDefaultRequiredValue: tt('g.this_field_required')
                                }}
                                errorLabel={ errorLabel }
                              />
                              <Form.Input
                                name="tag"
                                label={tt('categories.tag')}
                                required
                                focus
                                placeholder={tt('categories.tag')}
                                validationErrors={{
                                  isDefaultRequiredValue: tt('g.this_field_required')
                                }}
                                errorLabel={ errorLabel }
                              />
                              <Divider hidden />
                              <Button floated='right' primary>{tt('categories.add')}</Button>
                              <Button color='orange' 
                                onClick={this.onAddCancel}>{tt('g.cancel')}</Button>
                            </Form>
                          </Modal.Description>
                        </Modal.Content>
                      </Modal>
                </Form>
            </div>
        )
    }
}

function mapStateToProps(state, ownProps) {
    return {
        account: state.account,
        forum: state.forum,
        preferences: state.preferences,
        status: state.status
    }
}

function mapDispatchToProps(dispatch) {
    return {actions: bindActionCreators({
        ...forumActions
    }, dispatch)}
}

export default withRouter(connect(mapStateToProps, mapDispatchToProps)(ForumCategoriesForm));
