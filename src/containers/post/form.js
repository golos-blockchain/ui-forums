import React from 'react';
import { bindActionCreators } from 'redux';
import { connect } from 'react-redux';
import uniqueId from 'lodash/uniqueId';
import debounce from 'lodash/debounce';
import store from 'store';
import ReactDOMServer from 'react-dom/server';
import tt from 'counterpart';
import Noty from 'noty';

import { Button, Dimmer, Divider, Header, Loader, Menu, Segment } from 'semantic-ui-react';
import { Form } from 'formsy-semantic-ui-react';

import * as postActions from '../../actions/postActions';
import * as statusActions from '../../actions/statusActions';

import PostFormError from '../../components/elements/post/form/error';
import PostFormFieldBody from '../../components/elements/post/form/field/body';
import PostFormFieldRewards from '../../components/elements/post/form/field/rewards';
import PostFormFieldTags from '../../components/elements/post/form/field/tags';
import PostFormFieldTitle from '../../components/elements/post/form/field/title';

class PostForm extends React.Component {

    state = {};
    drafts = {};
    preview = {};

    handleItemClick = (e, { name }) => this.setState({ activeItem: name });

    constructor(props) {
        super(props);
        const { action, filter, forum, existingPost } = props;
        let tags = (filter) ? [filter] : (forum && forum.tags) ? forum.tags : [];
        if (action === 'edit') {
            try {
                const json_metadata = JSON.parse(existingPost.json_metadata);
                if (json_metadata && json_metadata.tags && json_metadata.tags.length) {
                    tags = json_metadata.tags;
                }
            } catch (jsonParseEx) {}
        }
        this.drafts = props.drafts || {};
        this.state = {
            formId: uniqueId('postform_'),
            activeItem: tt('post_form.tab_post'),
            beneficiaries: {},
            existingPost: (existingPost) ? existingPost : false,
            category: (existingPost) ? existingPost.parent_permlink : (filter) ? filter : (forum && forum.tags) ? forum.tags[0] : false,
            recommended: (forum && forum.tags) ? forum.tags : [],
            submitting: false,
            waitingforblock: false,
            preview: {},
            previewEnabled: false,
            submitted: {},
            tags: tags,
            rewards: 'decline',
        };
    }

    onKeyDown = (e) => {
        if (e.nativeEvent.metaKey) {
            if (e.nativeEvent.keyCode === 13) {
                this.formSubmit.handleClick();
                e.nativeEvent.preventDefault();
                e.stopPropagation();
                return false;
            }
        }
    };

    componentWillMount() {
        const draft = this.drafts[this.getIdentifier()];
        if (draft) {
            new Noty({
                closeWith: ['click', 'button'],
                layout: 'topRight',
                progressBar: true,
                theme: 'semanticui',
                text: ReactDOMServer.renderToString(
                    <Header>
                        {tt('post_form.draft_loaded')}
                        <Header.Subheader>
                            {tt('post_form.draft_loaded_description')}
                        </Header.Subheader>
                    </Header>
                ),
                type: 'success',
                timeout: 4000
            }).show();
            this.setState({ preview: draft || {}, body: draft.body || '' });
        }
    }

    componentWillReceiveProps(nextProps) {
        if (nextProps.post && nextProps.post.submitted) {
            const submitted = nextProps.post.submitted;
            if (submitted.formId === this.state.formId && submitted.ts !== this.state.submitted.ts) {
                if (submitted.hasError) {
                    this.setState({
                        hasError: true,
                        submitted,
                        submitting: false,
                        error: submitted.error
                    });
                } else {
                    // If we have a parent, reload all of the children
                    const t = this;
                    const { parent } = this.props;
                    if (parent) {
                        let parent_author = (parent.root_author) ? parent.root_author : parent.author,
                            parent_permlink = (parent.root_permlink) ? parent.root_permlink : parent.permlink;
                        if (parent.root_post) {
                            [ parent_author, parent_permlink ] = parent.root_post.split('/');
                        }
                        setTimeout(() => {
                            t.props.actions.fetchPostResponses({
                                author: parent_author,
                                category: this.props.forum._id,
                                permlink: parent_permlink
                            })
                        }, 5000);
                    }
                    // Remove the draft from storage
                    this.removeDraft();
                    // Parent callback
                    this.props.onComplete(submitted);
                    // Set our new state
                    this.setState({
                        submitted,
                        submitting: false,
                        hasError: false
                    });
                }
            }
        }
        if (nextProps.replyQuote !== this.props.replyQuote) {
            this.refs.replyBody.setValue(nextProps.replyQuote);
        }
        if (nextProps.replyAuthor !== this.props.replyAuthor) {
            this.refs.replyBody.focus();
        }
    }

    handleCancel = (e) => {
        e.preventDefault();
        // Remove any drafts upon cancel
        this.removeDraft();
        // Clear the preview
        this.setState({ preview: {} });
        // Reset the form
        this.form.formsyForm.reset();
        // Parent callback
        this.props.onCancel();
        e.preventDefault();
        return false;
    };

    handlePreview = (e) => {
        this.setState({ previewEnabled: !this.state.previewEnabled });
    };

    removeDraft = () => {
        const identifier = this.getIdentifier();
        const drafts = store.get('drafts') || {};
        delete drafts[identifier];
        store.set('drafts', drafts);
        this.drafts = drafts;
    };

    handleChange = (e, { name, value }) => {
        this.setState({ [name]: value }, () => {
            const drafts = this.drafts || store.get('drafts') || {};
            const identifier = this.getIdentifier();
            try {
                drafts[identifier][name] = value;
                store.set('drafts', drafts);
                this.drafts = drafts;
            } catch (e) {}
        });
    };

    handleBeneficiariesUpdate = (beneficiaries) => this.setState({ beneficiaries });

    handleOnChange = debounce((data) => {
        const drafts = this.drafts || store.get('drafts') || {};
        const identifier = this.getIdentifier();
        const { title, body, rewards } = data;
        const preview = { body, title, rewards, updated: +new Date() };
        // Store the preview as a draft
        if (title || body || rewards) {
            drafts[identifier] = { ...preview, beneficiaries: this.state.beneficiaries }
            store.set('drafts', drafts);
        }
        this.drafts = drafts;
    }, 50);

    handleOnBlur = () => {
        this.setState({ preview: this.drafts[this.getIdentifier()] || {} });
    }

    addTag = (e, data) => {
        let additionalTag = this.state.additionalTag,
            tags = this.state.tags;
        if (tags.indexOf(additionalTag) === -1 && tags.length < 5) {
            tags.push(additionalTag);
            this.setState({
                tags: tags
            });
        }
        e.preventDefault();
    };

    removeTag = (e, data) => {
        let tags = this.state.tags,
            idx = tags.indexOf(data.content);
        if (idx !== -1) {
            tags.splice(idx, 1);
            this.setState({ tags: tags });
        }
        e.preventDefault();
    };

    submit = (e) => {
        const form = this.form.formsyForm;
        const model = form.getModel();
        const _id = (this.props.forum) ? this.props.forum._id : false;
        const data = {
            ...model,
            ...this.state,
            forum: this.props.forum,
            namespace: _id,
        };
        if (this.props.replyAuthor) {
            data.body = this.props.replyAuthor + data.body;
        }
        const { action, account, parent, replyAuthor } = this.props;
        let realParent = null;
        if (replyAuthor && replyAuthor.indexOf('#')) {
            realParent = replyAuthor.split('#')[1];
            if (realParent) {
                realParent = realParent.split('/');
                realParent = { author: realParent[0].substring(1), permlink: realParent[1].split(')')[0] };
            }
        }
        this.props.actions.submit(account, data, realParent || parent, this.props.forum, action);
        this.setState({
            submitting: true
        });
        return false;
    };

    cancelSubmitting = (e) => {
        e.preventDefault();
        window.location.reload();
        return false;
    };

    dismissError = (e) => this.setState({
        hasError: false,
        errorMsg: false
    });

    getIdentifier = () => {
        let identifier = this.state.category;
        let { action, existingPost, parent } = this.props;
        if (!action) action = 'post';
        if (existingPost) {
            identifier = [action, existingPost.author, existingPost.permlink].join('/');
        }
        if (parent) {
            identifier = [action, parent.author, parent.permlink].join('/');
        }
        return identifier;
    };

    render() {
        const { activeItem } = this.state;
        const { action, account, replyQuote } = this.props;
        const identifier = this.getIdentifier(),
                    draft = this.drafts[identifier] || {};
        const disableAutoFocus = this.props.disableAutoFocus || false;
        let formHeader = this.props.formHeader,
                { existingPost, tags, previewEnabled } = this.state,
                enableMenu = false,
                formFieldTitle = false,
                formNotice = false,
                menu = false,
                menuDisplay = false;

        if (this.props.elements.indexOf('title') !== -1) {
            formFieldTitle = (
                <PostFormFieldTitle
                    value={(draft.title) ? draft.title : (existingPost) ? existingPost.title : ''}
                />
            );
        }

        if (this.props.elements.length > 2) {
            enableMenu = true;
            const items = [
                {
                    key: 'post',
                    active: (activeItem === tt('post_form.tab_post')),
                    name: tt('post_form.tab_post'),
                    onClick: this.handleItemClick
                },
            ];
            if (this.props.elements.indexOf('rewards') !== -1) {
                items.push({
                    key: 'rewards',
                    active: (activeItem === tt('post_form.tab_rewards')),
                    name: tt('post_form.tab_rewards'),
                    onClick: this.handleItemClick
                });
            }
            // items.push({
            //     key: 'debug',
            //     active: (activeItem === 'debug'),
            //     name: 'debug',
            //     onClick: this.handleItemClick
            // });
            menu = (
                <Menu
                    attached
                    tabular
                    items={items}
                    onItemClick={this.handleItemClick}
                />
            );
        }
        if (enableMenu) {
            menuDisplay = (
                <div>
                    <Segment attached='bottom' padded className={`${activeItem === 'debug' ? 'active ' : ''}tab`}>
                        <code>
                            <pre>
                                {JSON.stringify((this.form) ? this.form.formsyForm.getModel() : {}, null, 2)}
                            </pre>
                        </code>
                    </Segment>
                    <Segment attached='bottom' padded className={`${activeItem === 'tags' ? 'active ' : ''}tab`}>
                        <PostFormFieldTags
                            additionalTag={this.state.additionalTag}
                            addTag={this.addTag}
                            filter={this.props.filter}
                            forum={this.props.forum}
                            handleChange={this.handleChange}
                            removeTag={this.removeTag}
                            tags={tags}
                        />
                    </Segment>
                    <Segment attached='bottom' padded className={`${activeItem === tt('post_form.tab_post') ? 'active ' : ''}tab`}>
                        {formFieldTitle}
                        <PostFormFieldBody
                            ref='replyBody'
                            disableAutoFocus={disableAutoFocus}
                            handleChange={this.handleChange}
                            rootUsage={action !== 'threadReply'}
                            previewEnabled={previewEnabled}
                            value={ window._isMobile ? replyQuote : ((draft.body) ? draft.body : (existingPost) ? existingPost.body : '') }
                        />
                    </Segment>
                    <Segment attached='bottom' padded className={`${activeItem === tt('post_form.tab_rewards') ? 'active ' : ''}tab`}>
                        <PostFormFieldRewards
                            author={account.name}
                            draft={draft}
                            forum={this.props.forum}
                            handleBeneficiariesUpdate={this.handleBeneficiariesUpdate}
                        />
                    </Segment>
                </div>
            );
        } else {
            menuDisplay = (
                <div>
                {formFieldTitle}
                <PostFormFieldBody
                    ref='replyBody'
                    disableAutoFocus={disableAutoFocus}
                    handleChange={this.handleChange}
                    rootUsage={action !== 'threadReply'}
                    previewEnabled={previewEnabled}
                    value={ window._isMobile ? replyQuote : ((draft.body) ? draft.body : (existingPost) ? existingPost.body : '') }
                />
                </div>
            );
        }
        return (
            <div>
                <Dimmer inverted active={this.state.submitting} style={{minHeight: '100px'}}>
                    <Loader size='large' indeterminate>
                        <Header>
                            {tt('post_form.submitting')}
                        </Header>
                        <Button onClick={this.cancelSubmitting}>{tt('g.cancel')}</Button>
                    </Loader>
                </Dimmer>
                <Dimmer inverted active={this.state.waitingforblock} style={{minHeight: '100px'}}>
                    <Loader size='large' content='Waiting for next Block'/>
                </Dimmer>
                <PostFormError
                    error={this.state.error}
                    open={this.state.hasError}
                    onClose={this.dismissError}
                />
                <Form
                    ref={ref => this.form = ref }
                    onChange={ this.handleOnChange }
                    onKeyDown={this.onKeyDown}
                    onBlur={this.handleOnBlur}
                >
                    {formHeader}
                    {formNotice}
                    {menu}
                    {menuDisplay}
                    <Divider hidden />
                    <Button color='orange' style={{opacity: (action !== 'threadReply' ? 1 : 0)}} onClick={this.handleCancel}>{tt('post_form.cancel')}</Button>
                    
                    {window._isMobile ? null : <Button color={previewEnabled? 'blue' : 'gray'} floated='right' icon='eye' onClick={this.handlePreview}></Button>}
                    <Button
                        ref={ref => this.formSubmit = ref}
                        floated='right'
                        primary
                        onClick={this.submit}
                    >
                        {tt('post_form.submit')}
                    </Button>
                </Form>
            </div>
        );
    }
}

function mapStateToProps(state, ownProps) {
    const drafts = store.get('drafts');
    return {
        account: state.account,
        post: state.post,
        drafts: (typeof drafts === 'object') ? drafts : {}
    };
}

function mapDispatchToProps(dispatch) {
    return {actions: bindActionCreators({
        ...postActions,
        ...statusActions
    }, dispatch)};
}

export default connect(mapStateToProps, mapDispatchToProps)(PostForm);
