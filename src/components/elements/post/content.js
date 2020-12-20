import React from 'react';
import ReactDOMServer from 'react-dom/server';
import Noty from 'noty';
import tt from 'counterpart';

import { Button, Divider, Header, Popup, Segment } from 'semantic-ui-react';

import MarkdownViewer from '../../../utils/MarkdownViewer';
import PostControls from './controls';

import PostForm from '../../../containers/post/form';
import PostFormHeader from './form/header';
import PostTitle from './title';

export default class PostContent extends React.Component {

    handleResponding = (e) => {
        this.props.goReply('<a href="' + this.props.content.url.split('#')[0] +'#' + this.props.content.author + '/' + this.props.content.permlink + '">@' + this.props.content.author + '</a>, ');
        /*this.setState({
            responding: (this.state && this.state.responding) ? !this.state.responding : true,
        });*/
    };

    handleRespondingComplete = (e) => {
        new Noty({
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

    handleEditingComplete = (data) => {
        new Noty({
            closeWith: ['click', 'button'],
            layout: 'topRight',
            progressBar: true,
            theme: 'semanticui',
            text: ReactDOMServer.renderToString(
                <Header>
                    Your post has been edited
                    <Header.Subheader>
                        It may take a few moments to update throughout chainBB.com.
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
            editForm = false,
            postButton = (
                <Popup
                    trigger={
                        <Button floated='right'>
                            <i className={'left quote icon'}></i>
                            {tt('g.reply')}
                        </Button>
                    }
                    position='bottom center'
                    inverted
                    content={tt('forum_controls.you_must_be_logged_in_to_post')}
                    basic
                />
            ),
            postForm = false;
        if (this.state && this.state.updatedPost) {
            const { updatedPost } = this.state;
            post.title = updatedPost.title;
            post.body = updatedPost.body;
            if (updatedPost.json_metadata && updatedPost.json_metadata.tags) {
                post.json_metadata.tags = updatedPost.json_metadata.tags;
            }
        }
        if (this.props.account && this.props.account.isUser) {
            postButton = (
                <Button
                    onClick={this.handleResponding}
                    color='green'
                    icon='left quote'
                    content={tt('g.reply')}
                    floated='right'
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
                <a name={!this.props.op ? ('@' + post.author + '/' + post.permlink) : ''}></a>
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
