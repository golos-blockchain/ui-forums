import React from 'react';
import { withRouter } from "react-router-dom";
import { bindActionCreators } from 'redux';
import ReactDOMServer from 'react-dom/server';
import { connect } from 'react-redux'
import _ from 'lodash'
import slug from 'slug'
import Noty from 'noty'
import tt from 'counterpart';
import golos from 'golos-classic-js'

import { Button, Dimmer, Divider, Header, Icon, Label, Loader, Modal, Segment, Table, List, Popup } from 'semantic-ui-react'
import { Form } from 'formsy-semantic-ui-react'

import * as types from '../../../actions/actionTypes';
import * as forumActions from '../../../actions/forumActions'
import * as CONFIG from '../../../../config';

import AccountLink from '../../../components/elements/account/link'
import LoginModal from '../../../components/elements/login/modal'

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
            addEditParentIds: null,
            editCatId: null,
            tags_detected: [],
        }
        this.state.categories = props.categories
    }

    componentWillReceiveProps(nextProps) {
        /*const { forum } = nextProps
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
        }*/
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

    getParentCat = (categories, parentIds) => {
      let subcats = categories;
      let parent = {children: subcats};
      for (let parentId of parentIds) {
        parent = subcats[parentId];
        subcats = parent.children;
      }
      return parent;
    }

    addEditCategory = (e, data) => {
      e.preventDefault()
      this.setState({
        addEditParentIds: data.parentIds,
        editCatId: data.editCatId ? data.editCatId : null
      })
      return false
    }
    onAddEditCancel = (e) => {
      e.preventDefault();
      this.setState({addEditParentIds: null, editCatId: null});
      return false;
    }
    onAddEdit = (formData) => {
      let categories = Object.assign({}, this.state.categories);
      let parentCat = this.getParentCat(categories, this.state.addEditParentIds)
      if (!parentCat.children) parentCat.children = {}; // There are no guarantee what category has children - account_notes not stores empty children to reduce HDD usage 
      let cats = parentCat.children;

      if (!this.state.editCatId) {
        cats[formData.tag] = {name: formData.name, name_ru: formData.name_ru};
      } else {
        let cat = cats[this.state.editCatId];
        cat.name = formData.name;
        cat.name_ru = formData.name_ru;
      }
      this.setState({
        addEditParentIds: null,
        editCatId: null,
        categories
      });
    }

    removeCategory = (e, data) => {
      e.preventDefault();
      let categories = Object.assign({}, this.state.categories);
      let subcats = this.getParentCat(categories, data.parentIds).children // There IS guarantee what parent category has children
      delete subcats[data.catId]; 
      this.setState({categories});
      return false;
    }

    handleSubmit = (data) => {
        this.setState({showConfirm: true})
    }
    hideConfirm = () => this.setState({showConfirm: false})
    broadcast = (account, wif) => {
        let values = JSON.stringify(this.state.categories);

        golos.broadcast.customJson(wif, [account], [], "account_notes",
          JSON.stringify(['set_value', {
            account: account,
            key: 'g.f.' + CONFIG.FORUM._id,
            value: values
          }]),
          function (err, result) {
            if (err) {
                alert(err);
                return;
            }
          });
    }
    render() {
        const { account } = this.props
        const { name, description, tags, categories, addEditParentIds, editCatId, showConfirm } = this.state

        let catsToItems = (cats, parentIds=[]) => {
          let listItems = [];
          for (let [_id, forum] of Object.entries(cats)) {
            let innerList = null;
            if (forum.children && Object.keys(forum.children).length) {
              innerList = (
                <List.List>
                  {catsToItems(forum.children, parentIds.concat(_id))}
                </List.List>
              );
            }
            listItems.push(
                <List.Item>
                  <List.Icon name={innerList ? 'folder' : 'file'} />
                  <List.Content>
                    <table>
                    <tbody><tr><td>
                      <List.Header>{forum.name_ru}</List.Header>
                      <List.Description>
                        {forum.name}
                      </List.Description>
                    </td><td>&nbsp;&nbsp;&nbsp;</td><td>
                      <Popup
                        trigger={
                          <Button
                            icon='add'
                            size='mini'
                            color='green'
                            parentIds={parentIds.concat(_id)}
                            onClick={this.addEditCategory}
                          />
                        }
                        content={tt('categories.add_sub')}
                        inverted
                      />
                      {/*<Popup
                        trigger={
                          <Button
                            basic
                            icon='chevron up'
                            size='mini'
                            color='blue'
                          />
                        }
                        content={tt('categories.move_up')}
                        inverted
                      />*/}
                      <Popup
                        trigger={
                          <Button
                            basic
                            icon='pencil'
                            size='mini'
                            color='orange'
                            parentIds={parentIds}
                            editCatId={_id}
                            onClick={this.addEditCategory}
                          />
                        }
                        content={tt('g.edit')}
                        inverted
                      />
                      <Popup
                        trigger={
                          <Button
                            basic
                            icon='cancel'
                            size='mini'
                            color='red'
                            catId={_id}
                            parentIds={parentIds}
                            onClick={this.removeCategory}
                          />
                        }
                        content={tt('g.remove')}
                        inverted
                      />
                    </td></tr></tbody></table>
                    {innerList}
                  </List.Content>
                </List.Item>
            );
          }
          return listItems;
        };
        let listItems = catsToItems(categories);

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
        if (account.name === CONFIG.FORUM.creator) {
            submit = (
                <Button fluid color='blue' type='submit'>
                    {tt('forum_controls.submit_changes')}
                </Button>
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
        let editCat = null;
        if (editCatId) {
            let cats = this.getParentCat(categories, this.state.addEditParentIds).children;
            editCat = cats[editCatId];
        }
        let actions = {signinAccount: this.broadcast, onClose: this.hideConfirm};
        return (
            <div>
                <LoginModal authType="active" noButton={true} open={showConfirm} actions={actions}/>
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
                            parentIds={[]}
                            onClick={this.addEditCategory}
                          >
                            {tt('g.add')}
                          </Button>
                            <List>
                            {listItems}
                            </List>
                        <Divider section />
                        {submit}
                    </Segment>
                      <Modal size='small' open={addEditParentIds != null}>
                        <Modal.Header>{(addEditParentIds == null || !addEditParentIds.length) ? tt('categories.add') : tt('categories.add_sub') + ' ' + this.getParentCat(categories, addEditParentIds).name_ru}</Modal.Header>
                        <Modal.Content>
                          <Modal.Description>
                            <Form
                              ref={ref => this.form = ref }
                              onValidSubmit={this.onAddEdit}
                            >
                              <Form.Input
                                name="name_ru"
                                label={tt('categories.name_ru')}
                                required
                                focus
                                autoFocus
                                value={editCat ? editCat.name_ru : undefined}
                                validationErrors={{
                                  isDefaultRequiredValue: tt('g.this_field_required')
                                }}
                                errorLabel={ errorLabel }
                              />
                              <Form.Input
                                name="name"
                                label={tt('categories.name')}
                                required
                                focus
                                value={editCat ? editCat.name : undefined}
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
                                value={editCat ? editCatId : undefined}
                                disabled={editCat != null}
                                placeholder={tt('categories.tag')}
                                validationErrors={{
                                  isDefaultRequiredValue: tt('g.this_field_required')
                                }}
                                errorLabel={ errorLabel }
                              />
                              <Divider hidden />
                              <Button floated='right' primary>{editCat ? tt('categories.edit') : tt('categories.add')}</Button>
                              <Button color='orange' 
                                onClick={this.onAddEditCancel}>{tt('g.cancel')}</Button>
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
