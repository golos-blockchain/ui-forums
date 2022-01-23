import React from 'react';
import ReactDOMServer from 'react-dom/server';
import { Link } from 'react-router-dom';
import tt from 'counterpart';

import { Button, Header, Popup, Segment } from 'semantic-ui-react';

import MarkdownViewer from '../../../../utils/MarkdownViewer';
import PostControls from '../controls';
import PostForm from '../../../../containers/post/form';
import PostFormHeader from '../form/header';

import importNoty from '../../../../utils/importNoty';

export default class PostReplyContent extends React.Component {

    handleResponding = (e) => {
        this.setState({
            responding: (this.state && this.state.responding) ? !this.state.responding : true,
        });
    };

    handleRespondingComplete = async (e) => {
        let Noty = await importNoty();
        if (Noty) new Noty({
            closeWith: [ 'click', 'button' ],
            layout: 'topRight',
            progressBar: true,
            theme: 'semanticui',
            text: ReactDOMServer.renderToString(
                <Header>
                    Your post has been submitted!
                    <Header.Subheader>
                        It may take a few moments to appear on chainBB.com, and will appear at the end of this thread.
                    </Header.Subheader>
                </Header>
            ),
            type: 'success',
            timeout: 8000
        }).show();
        this.setState({
            responding: false
        });
    };

    handleEditing = () => {
        if (this.props.scrollToPost) {
            const { author, permlink } = this.props.content;
            this.props.scrollToPost(author + '/' + permlink);
        }
        this.setState({
            editing: (this.state && this.state.editing) ? !this.state.editing : true,
        });
    };

    handleEditingComplete = async (data) => {
        let Noty = await importNoty();
        if (Noty) new Noty({
            closeWith: [ 'click', 'button' ],
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
    };

    render() {
        let post = this.props.content,
            postContent = false,
            postControls = false,
            postFooter = false,
            quote = this.props.quote,
            title = false,
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
        let postButton = (
            <Popup
                trigger={
                    <Button floated='right'>
                        <i className={'left quote icon'}></i>
                        Reply
                    </Button>
                }
                position='bottom center'
                inverted
                content='You must be logged in to post.'
                basic
            />);
        let postForm = false;
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
                    content='Reply'
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
                    content={tt('forum_controls.edit_your_post')}
                    basic
                />
            );
        }
        if (responding) {
            postForm = (
                <Segment attached>
                    <PostForm
                        action='create'
                        actions={this.props.actions}
                        forum={this.props.topic.forum}
                        formHeader={postFormHeader}
                        elements={['body']}
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
                        action='edit'
                        actions={this.props.actions}
                        formHeader={editFormHeader}
                        forum={this.props.topic.forum}
                        elements={(post.depth === 0) ? ['title', 'body', 'tags'] : ['body']}
                        existingPost={post}
                        account={this.props.account}
                        onCancel={this.handleEditing}
                        onComplete={this.handleEditingComplete}
                    />
                </Segment>
            );
        }
        if (post.depth === 0) {
            let tags = false
            if (post.json_metadata && post.json_metadata.tags && typeof Array.isArray(post.json_metadata.tags)) {
                tags = post.json_metadata.tags.map((tag, i) => (<span key={i}>
                    {!!i && ' • '}
                    <Link to={`/topic/${tag}`}>
                        #{tag}
                    </Link>
                </span>));
            }
            title = (
                <Segment style={{ borderTop: '2px solid #2185D0' }} secondary attached stacked={(this.props.op && this.props.page !== 1)}>
                    <Header size='huge'>
                        <h1 style={{margin: 0}}>
                            {post.title}
                        </h1>
                        <Header.Subheader>
                        {'↳ '}
                        tagged
                        {' '}
                        {tags}
                        </Header.Subheader>
                    </Header>
                </Segment>
            );
        }
        if (!this.props.op || (this.props.op && this.props.page === 1) || this.props.preview) {
            postContent = (
                <Segment padded attached className='thread-post'>
                    {quote}
                    <MarkdownViewer formId={'viewer'} text={post.body} jsonMetadata={{}} large highQualityPost={true}  />
                </Segment>
            );
            if (!this.props.preview) {
                postFooter = (
                    <Segment basic clearing secondary attached='bottom'>
                      <PostControls
                            target={post}
                            onlyButton={true}
                            { ...this.props }
                        />
                        <Button
                            as={Link}
                            to={post.url}
                            basic
                            floated='right'
                            icon='external'
                        />
                        {postButton}
                        {editButton}
                    </Segment>
                );
            }
        }
        return (
            <div>
                {title}
                {(editForm)
                    ? (editForm)
                    : (
                        <div>
                            {postContent}
                            {postControls}
                            {postFooter}
                        </div>
                    )
                }
                {postForm}
            </div>
        );
    }
}
