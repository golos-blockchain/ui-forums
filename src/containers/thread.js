import React from 'react';
import { Helmet } from 'react-helmet';
import { bindActionCreators } from 'redux';
import { connect } from 'react-redux';
import { goToTop, goToAnchor } from 'react-scrollable-anchor';
import ReactDOMServer from 'react-dom/server';
import truncate from 'lodash/truncate';

import { Divider, Grid, Header, Segment } from 'semantic-ui-react';

import * as CONFIG from '../../config';
import * as accountActions from '../actions/accountActions';
import * as postActions from '../actions/postActions';
import * as preferenceActions from '../actions/preferenceActions';
import * as statusActions from '../actions/statusActions';

import Post from '../components/elements/post';
import PostForm from './post/form';
import Post404 from '../components/elements/post/404';
import Response from '../components/elements/response';
import Paginator from '../components/global/paginator';
import tt from 'counterpart';
import { getPageTitle } from '../utils/text';

let Noty; if (typeof(document) !== 'undefined') Noty = import('noty');

const regexPage = /#comments-page-(\d+)+$/;
const regexPost = /#@?([A-Za-z0-9\-_]+)\/([A-Za-z0-9\-_]+)$/;

class Thread extends React.Component {
    constructor(props) {
        super(props);
        this.state = Object.assign({}, props.params, {
            page: 1,
            replyAuthor: '',
            scrollTo2: '',
        });
    }

    componentWillMount() {
        this.fetchPost(this.state);
    }

    componentDidMount() {
        const { hash } = window.location;
        let matchesPage = hash.match(regexPage);
        if (matchesPage) {
            this.setState({
                page: parseInt(matchesPage[1], 10)
            });
        }
    }

    componentDidUpdate() {
        const { hash } = window.location;
        let matchesPost = hash.match(regexPost);
        if (matchesPost) {
            const anchor = '@' + matchesPost[1] + '/' + matchesPost[2];
            if (this.state.scrollTo2 !== '+' + anchor && this.state.scrollTo2 !== anchor) {
                this.setState({
                    scrollTo2: anchor
                });
            }
            if (this.state.scrollTo2.startsWith('@')) {
                const anc = this.state.scrollTo2
                const page = this.getPageForPost(anc);
                if (!page) return;
                setTimeout(() => {
                    goToAnchor(anc)
                }, 50);
                this.setState({
                    scrollTo2: '+' + this.state.scrollTo2,
                    page: this.getPageForPost(anc)
                });
            }
        }
    }

    fetchPost(params) {
        if (!process.browser) return;
        goToTop();
        this.props.actions.resetPostState();
        this.props.actions.fetchPost(params);
        this.props.actions.fetchPostResponses(params);
        if (!this.props.account) {
            this.props.actions.fetchAccount();
        }
    }

    scrollToPost = (id) => {
        let page = this.getPageForPost(id)
        if (page === false) return false;
        this.changePage(page, id)
        return true;
    };

    getPageForPost = (id) => {
        let collection = this.props.post.responses,
            perPage = CONFIG.FORUM.replies_per_page || 10,
            position = false;
        for (var i = 0; i < collection.length; i++) {
            const { author, permlink } = collection[i];
            if ('@' + author + '/' + permlink === id) {
                position = i;
            }
        }
        if (position === false) return position;
        return Math.floor(position / perPage) + 1;
    };

    changePage = (page = false, scrollTo = false) => {
        let state = {};
        if (page) {
            state.page = page;
        }
        if (scrollTo) {
            state.scrollTo = scrollTo;
        } else {
            goToTop();
        }
        this.setState(state);
        if (page) window.location.hash = page > 1 ? 'comments-page-' + page : '';
    };

    goReply = (replyAuthor, replyQuote = null) => {
        goToAnchor('reply');
        if (replyQuote) {
            let quoteLines = replyQuote.split('\n');
            let newText = '';
            for (let ql of quoteLines) {
                newText += '> ' + ql + '\n';
            }
            this.setState({
                replyAuthor,
                replyQuote: newText + '\n'
            });
        } else {
            this.setState({
                replyAuthor
            });
        }
    };

    handleCancel = () => {
    };

    handleResponse = (submitted) => {
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
        let anchor = '@' + submitted.post.author + '/' + submitted.post.permlink;
        this.setState({
            submitted: new Date(),
            scrollTo2: anchor
        });
        window.location.hash = anchor;
    };

    render() {
        let page = (this.state) ? this.state.page : 1,
            perPage = CONFIG.FORUM.replies_per_page || 10,
            responses = (this.props.post) ? this.props.post.responses : 0,
            content = (this.props.post) ? this.props.post.content : false,
            postForm = false;
        if (content.author === '' || content.post_hidden || content.author_banned) {
            const isModerator = this.props && this.props.account && this.props.account.isUser && 
                this.props.post.forum &&
                (this.props.post.forum.moders.includes(this.props.account.name) 
                || this.props.post.forum.supers.includes(this.props.account.name));
            if (!isModerator) return (<Post404/>);
        }
        let comments_nav = (
            <Segment basic>
                <Grid id={(page ? `comments-page-${page}` : '')}>
                    <Grid.Row verticalAlign='middle'>
                        <Grid.Column className='mobile hidden' width={8}>
                            <Header>
                                {tt('forum_controls.comments')} ({responses.length})
                            </Header>
                        </Grid.Column>
                        <Grid.Column mobile={16} tablet={8} computer={8}>
                            <Paginator
                                page={page}
                                perPage={perPage}
                                total={responses.length}
                                callback={this.changePage}
                                />
                        </Grid.Column>
                    </Grid.Row>
                </Grid>
            </Segment>
        );
        const isBanned = this.props.post.forum && !!this.props.post.forum.banned[this.props.account.name];
        let nav = (
            <Segment basic>
                <Grid id={(page ? `comments-page-${page}` : '')}>
                    <Grid.Row verticalAlign='middle'>
                        <Grid.Column className='mobile hidden' width={8}>
                            <Header>
                                <a href='#reply' name='reply' style={{ color: 'black' }}>{!isBanned && tt('forum_controls.write_your_reply')}</a>
                            </Header>
                        </Grid.Column>
                        <Grid.Column mobile={16} tablet={8} computer={8}>
                            <Paginator
                                page={page}
                                perPage={perPage}
                                total={responses.length}
                                callback={this.changePage}
                              />
                        </Grid.Column>
                    </Grid.Row>
                </Grid>
            </Segment>
        );
        if (this.props.post && this.props.post.content && this.props.account && this.props.account.isUser && !isBanned) {
            postForm = (
                <Segment secondary>
                    <PostForm
                        key={this.state.submitted}
                        action='threadReply'
                        actions={this.props.actions}
                        disableAutoFocus={true}
                        elements={['body']}
                        noCancelButton='true'
                        forum={this.props.post.forum}
                        parent={this.props.post.content}
                        replyAuthor={this.state.replyAuthor}
                        replyQuote={this.state.replyQuote}
                        onCancel={this.handleCancel}
                        onComplete={this.handleResponse}
                        { ... this.props } />
                  </Segment>
            );
        }
        let image = 'https://i.imgur.com/0AeZtdV.png';
        if (content && content.json_metadata && content.json_metadata.image && content.json_metadata.image.length > 0) {
            image = content.json_metadata.image[0];
        }
        const title = getPageTitle(content.title);
        const metaDesc = truncate(content.body, {length: 150});
        return (
            <div>
                <Helmet>
                    <title>{title}</title>                    
                    <meta name='description' content={metaDesc} />
                    <meta name='twitter:title' content={title} />
                    <meta name='twitter:description' content={metaDesc} />
                    <meta name='twitter:image:src' content={image} />
                    <meta property='og:title' content={title} />
                    <meta property='og:description' content={metaDesc} />
                    <meta property='og:image' content={image} />
                </Helmet>
                <Post
                    action={this.state.action}
                    page={page}
                    changePage={this.changePage}
                    scrollToPost={this.scrollToPost}
                    goReply={this.goReply}
                    { ...this.props } />
                { comments_nav }
                <Response
                    page={page}
                    perPage={perPage}
                    changePage={this.changePage}
                    scrollToPost={this.scrollToPost}
                    goReply={this.goReply}
                    { ...this.props } />
                { nav }
                <Divider />
                <Grid>
                    <Grid.Row>
                        <Grid.Column mobile={16} tablet={16} computer={16}>
                            {postForm}
                        </Grid.Column>
                    </Grid.Row>
                </Grid>
                <Divider />
            </div>
        );
    }
}

function mapStateToProps(state, ownProps) {
    return {
        account: state.account,
        post: ownProps.post || state.post,
        preferences: state.preferences,
        status: state.status
    };
}

function mapDispatchToProps(dispatch) {
    return {actions: bindActionCreators({
        ...accountActions,
        ...postActions,
        ...preferenceActions,
        ...statusActions
    }, dispatch)}
}

export default connect(mapStateToProps, mapDispatchToProps)(Thread);
