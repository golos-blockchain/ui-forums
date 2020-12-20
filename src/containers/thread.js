import React from 'react';
import { Helmet } from 'react-helmet';
import { bindActionCreators } from 'redux';
import { connect } from 'react-redux';
import { goToTop, goToAnchor } from 'react-scrollable-anchor';
import ReactDOMServer from 'react-dom/server';
import Noty from 'noty';
import tt from 'counterpart';
import { getPageTitle } from '../utils/text';

import { Divider, Grid, Header, Segment } from 'semantic-ui-react';

import * as accountActions from '../actions/accountActions';
import * as postActions from '../actions/postActions';
import * as preferenceActions from '../actions/preferenceActions';
import * as statusActions from '../actions/statusActions';

import Post from '../components/elements/post';
import PostForm from './post/form';
import PostFormHeader from '../components/elements/post/form/header';
import Response from '../components/elements/response';
import Paginator from '../components/global/paginator';

const regexPage = /#comments-page-(\d+)+$/;
const regexPost = /#@?([A-Za-z0-9\-_]+)\/([A-Za-z0-9\-_]+)$/;

class Thread extends React.Component {

    constructor(props) {
        super(props);
        this.state = Object.assign({}, props.params, {
            page: 1,
            replyQuote: ''
        });
    }

    componentWillMount() {
        this.fetchPost(this.state);
    }

    fetchPost(params) {
        goToTop();
        this.props.actions.resetPostState();
        this.props.actions.fetchPost(params);
        this.props.actions.fetchPostResponses(params);
        if (!this.props.account) {
            this.props.actions.fetchAccount();
        }
    }

    componentWillReceiveProps(nextProps) {
        const { hash } = location;
        if (!hash && this.state.page && this.state.page > 1) {
            this.setState({page: 1});
        }
        if (hash) {
            let matchesPage = hash.match(regexPage);
            let matchesPost = hash.match(regexPost);
            if (matchesPage) {
                let page = parseInt(matchesPage[1], 10)
                if(page !== this.state.page) {
                    this.changePage(page);
                }
            }
            if (matchesPost) {
                let anchor = matchesPost[1] + '/' + matchesPost[2];
                this.setState({
                    scrollToWhenReady: '@' + anchor
                });
            }
        }
        if (nextProps.params.permlink !== this.state.permlink) {
            this.state = Object.assign({}, nextProps.params, { page: 1 });
            this.fetchPost(nextProps.params);
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
            perPage = this.props.preferences.threadPostsPerPage || 10,
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
    };

    goReply = (replyQuote) => {
        this.setState({
            replyQuote,
            scrollTo: 'reply'
        });
    };

    componentDidUpdate() {
        const anchor = (this.state) ? this.state.scrollTo : false;
        if (this.state && this.state.scrollTo) {
            this.setState({scrollTo: false});
            setTimeout(function() {
                goToAnchor(anchor)
            }, 50);
        }
        if (this.state && this.state.scrollToWhenReady) {
            if (this.scrollToPost(this.state.scrollToWhenReady)) {
                this.setState({
                    scrollToWhenReady: false
                });
            } // and if not scrolled - not reset flag, try again until responses be fetched
        }
    }

    componentDidMount() {
        const { hash } = location;
        let matchesPage = hash.match(regexPage);
        let matchesPost = hash.match(regexPost);
        if (matchesPage) {
            this.setState({
                page: parseInt(matchesPage[1], 10)
            });
        }
        if (matchesPost) {
            let anchor = matchesPost[1] + '/' + matchesPost[2];
            this.setState({
                scrollToWhenReady: '@' + anchor
            });
        }
    }

    handleCancel = () => {
    };

    handleResponse = (submitted) => {
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
        let anchor = '@' + submitted.post.author + '/' + submitted.post.permlink;
        this.setState({
            submitted: new Date(),
            scrollToWhenReady: anchor
        });
    };

    render() {
        let page = (this.state) ? this.state.page : 1,
            perPage = this.props.preferences.threadPostsPerPage || 10,
            responses = (this.props.post) ? this.props.post.responses : 0,
            content = (this.props.post) ? this.props.post.content : false,
            pages = Math.ceil(responses.length / perPage),
            postForm = false;
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
        let nav = (
            <Segment basic>
                <Grid id={(page ? `comments-page-${page}` : '')}>
                    <Grid.Row verticalAlign='middle'>
                        <Grid.Column className='mobile hidden' width={8}>
                            <Header>
                                <a name='reply' style={{ color: 'black' }}>{tt('forum_controls.write_your_reply')}</a>
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
        if (this.props.post && this.props.post.content && this.props.account && this.props.account.isUser) {
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
                        replyQuote={this.state.replyQuote}
                        onCancel={this.handleCancel}
                        onComplete={this.handleResponse}
                        { ... this.props } />
                  </Segment>
            );
        }
        let image = 'https://steemit-production-imageproxy-upload.s3.amazonaws.com/DQmckc76UaBZSicePvDG9dKwrgyS5GoZRxAnBZ8AzxtVwH8';
        if (content && content.json_metadata && content.json_metadata.image && content.json_metadata.image.length > 0) {
            image = content.json_metadata.image[0];
        }
        const title = getPageTitle(content.title);
        return (
            <div>
                <Helmet>
                    <title>{title}</title>
                    <meta name='description' content={`Posted by ${content.author} on ${content.created} UTC.`} />
                    <meta itemprop='name' content={title} />
                    <meta itemprop='description' content={`Posted by ${content.author} on ${content.created} UTC.`} />
                    <meta itemprop='image' content={image} />
                    <meta name='twitter:title' content={title} />
                    <meta name='twitter:description' content={`Posted by ${content.author} on ${content.created} UTC.`} />
                    <meta name='twitter:image:src' content={image} />
                    <meta property='og:title' content={title} />
                    <meta property='og:url' content={`http://chainbb.com/${(content.post && content.post.forum) ? content.post.forum._id : content.category}/@${content.author}/${content.permlink}`} />
                    <meta property='og:description' content={`Posted by ${content.author} on ${content.created} UTC.`} />
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
        post: state.post,
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
