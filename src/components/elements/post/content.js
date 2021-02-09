import React from 'react';
import ReactDOMServer from 'react-dom/server';
import tt from 'counterpart';

import { Button, Divider, Header, Popup, Segment } from 'semantic-ui-react';

import MarkdownViewer from '../../../utils/MarkdownViewer';
import PostControls from './controls';

import PostForm from '../../../containers/post/form';
import PostFormHeader from './form/header';
import PostTitle from './title';

import importNoty from '../../../utils/importNoty';

export default class PostContent extends React.Component {

    handleResponding = (e) => {
        this.props.goReply('[@' + this.props.content.author + '](' + this.props.content.url + '), ');
        /*this.setState({
            responding: (this.state && this.state.responding) ? !this.state.responding : true,
        });*/
    };

    handleRespondingWithQuote = (e) => {
        this.props.goReply('[@' + this.props.content.author + '](' + this.props.content.url + '), \n', this.props.content.body);
    };

    handleRespondingComplete = async (e) => {
        let Noty = await importNoty();
        if (Noty) new Noty({
            closeWith: ['click', 'button'],
            layout: 'topRight',
            progressBar: true,
            theme: 'semanticui',
            text: ReactDOMServer.renderToString(
                <Header>
                    {tt('forum_controls.submitted')}
                    <Header.Subheader>
                        {tt('forum_controls.submitted_desc')}
                    </Header.Subheader>
                </Header>
            ),
            type: 'success',
            timeout: 8000
        }).show();
        this.setState({
            responding: false
        });
    }

    handleEditing = () => {
        if (this.props.scrollToPost) {
            const { author, permlink } = this.props.content;
            this.props.scrollToPost(author + '/' + permlink);
        }
        this.setState({
            editing: (this.state && this.state.editing) ? !this.state.editing : true,
        });
    }

    handleEditingComplete = async (data) => {
        let Noty = await importNoty();
        if (Noty) new Noty({
            closeWith: ['click', 'button'],
            layout: 'topRight',
            progressBar: true,
            theme: 'semanticui',
            text: ReactDOMServer.renderToString(
                <Header>
                    {tt('forum_controls.submitted_edit')}
                    <Header.Subheader>
                        {tt('forum_controls.submitted_desc')}
                    </Header.Subheader>
                </Header>
            ),
            type: 'success',
            timeout: 8000
        }).show();
        this.setState({
            editing: false,
            updatedPost: data.post
        });
    }

    render() {
        let post = this.props.content,
            postContent = false,
            postControls = false,
            postTitle = false,
            quote = this.props.quote,
            postFormHeader = (
                <PostFormHeader
                    title='Leave a Reply'
                    subtitle=''
                    />
            ),
            editFormHeader = (
                <PostFormHeader
                    title={tt('forum_controls.edit_your_post')}
                    color='green'
                    subtitle=''
                    />
            ),
            responding = (this.state && this.state.responding) ? this.state.responding : false,
            editing = (this.state && this.state.editing) ? this.state.editing : false,
            editButton = false,
            editForm = false;
        const isBanned = this.props.post.forum && !!this.props.post.forum.banned[this.props.account.name];
        let postButton = (
                <Popup
                    trigger={
                        <Button floated='right'>
                            <i className={'left reply icon'}></i>
                            {tt('g.reply')}
                        </Button>
                    }
                    position='bottom center'
                    inverted
                    content={isBanned ? tt('forum_controls.you_are_blocked') : tt('forum_controls.you_must_be_logged_in_to_post')}
                    basic
                />
            );
        let quoteButton = (
                <Popup
                    trigger={
                        <Button floated='right' icon='left quote'>
                        </Button>
                    }
                    position='bottom center'
                    inverted
                    content={isBanned ? tt('forum_controls.you_are_blocked') : tt('forum_controls.you_must_be_logged_in_to_post')}
                    basic
                />
            );
        let postForm = false;
        if (this.state && this.state.updatedPost) {
            const { updatedPost } = this.state;
            post.title = updatedPost.title;
            post.body = updatedPost.body;
            if (updatedPost.json_metadata && updatedPost.json_metadata.tags) {
                post.json_metadata.tags = updatedPost.json_metadata.tags;
            }
        }
        if (this.props.account && this.props.account.isUser && !isBanned) {
            postButton = (
                <Button
                    onClick={this.handleResponding}
                    color='green'
                    icon='left reply'
                    content={tt('g.reply')}
                    floated='right'
                />
            );
            quoteButton = (
                <Popup
                    trigger={
                        <Button
                            onClick={this.handleRespondingWithQuote}
                            color='gray'
                            icon='left quote'
                            floated='right'
                        />
                    }
                    position='bottom center'
                    inverted
                    content={tt('g.reply_with_quote')}
                    basic
                />
            );
        }
        if (this.props.account && this.props.account.name === post.author) {
            editButton = (
                <Popup
                    trigger={
                      <Button
                        basic
                        onClick={this.handleEditing}
                        color='grey'
                        icon='pencil'
                        floated='right'
                      />
                    }
                    position='bottom center'
                    inverted
                    content={tt('g.edit')}
                    basic
                />
            );
        }
        if (responding) {
            postForm = (
                <Segment secondary color='green'>
                    <PostForm
                        action='create'
                        actions={this.props.actions}
                        formHeader={postFormHeader}
                        elements={['body']}
                        forum={this.props.post.forum}
                        parent={post}
                        onCancel={this.handleResponding}
                        onComplete={this.handleRespondingComplete}
                    />
                </Segment>
            );
        }
        if (editing) {
            editForm = (
                <Segment basic>
                    <PostForm
                        account={this.props.account}
                        action='edit'
                        actions={this.props.actions}
                        formHeader={editFormHeader}
                        elements={(post.depth === 0) ? ['title', 'body', 'tags'] : ['body']}
                        existingPost={post}
                        onCancel={this.handleEditing}
                        onComplete={this.handleEditingComplete}
                    />
                </Segment>
            );
        }
        if (!this.props.op || (this.props.op && this.props.page === 1) || this.props.preview) {
            postContent = (
                <Segment attached clearing className='thread-post'>
                    {quote}
                    <MarkdownViewer formId={'viewer'} text={post.body} jsonMetadata={{}} large highQualityPost={true}  />
                    <Divider hidden></Divider>
                </Segment>
            );
            if (!this.props.preview) {
                postControls = (
                    <PostControls
                        target={post}
                        editButton={editButton}
                        postButton={postButton}
                        quoteButton={quoteButton}
                        { ...this.props }
                        />
                );
                postTitle = (
                    <PostTitle
                        content={post}
                        {...this.props}
                    />
                );
            }
        }
        return (
            <div>
                <a name={'@' + post.author + '/' + post.permlink}></a>
                {(editForm)
                    ? (editForm)
                    : (
                        <div>
                            {postTitle}
                            {postContent}
                            {postControls}
                        </div>
                    )
                }
                {postForm}
            </div>
        );
    }
}
