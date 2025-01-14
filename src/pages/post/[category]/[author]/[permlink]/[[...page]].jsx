import React from 'react';
import Head from 'next/head';
import { bindActionCreators } from 'redux';
import { connect } from 'react-redux';
import { goToTop, goToAnchor } from 'react-scrollable-anchor';
import ReactDOMServer from 'react-dom/server';
import truncate from 'lodash/truncate';
import tt from 'counterpart';

import { Divider, Grid, Header, Segment } from 'semantic-ui-react';

import * as accountActions from '@/actions/accountActions';
import * as breadcrumbActions from '@/actions/breadcrumbActions';
import * as forumActions from '@/actions/forumActions';
import * as postActions from '@/actions/postActions';

import Post from '@/elements/post';
import PostForm from '@/modules/post/form';
import Post404 from '@/elements/post/404';
import Response from '@/elements/response';
import Paginator from '@/elements/global/paginator';
import { getPost, getPostResponses } from '@/server/getPost'
import { wrapSSR, } from '@/server/ssr'
import { getForumName, getPageTitle } from '@/utils/text';
import { withRouter, } from '@/utils/withRouter'

import importNoty from '@/utils/importNoty';

const regexPost = /#@?([A-Za-z0-9\-_]+)\/([A-Za-z0-9\-_]+)$/;

export const getServerSideProps = wrapSSR(async ({ req, res, params, query, _store, }) => {
    let { category, author, permlink, } = params
    const data = await getPost(category, author, permlink)
    _store.dispatch(postActions.resetPostState())

    let trail = data.forum.trail.map(item => {
        return {
            name: getForumName(item),
            link: `/f/${item._id}`
        }
    })
    trail.push({
        name: data.data.title,
        link: data.data.url
    })
    _store.dispatch(breadcrumbActions.setBreadcrumb(trail))

    _store.dispatch(forumActions.setForum(data.forum))
    _store.dispatch(postActions.fetchPostResolved({
        forum: data.forum,
        content: data.data
    }))

    const responses = await getPostResponses(category, author, permlink, data.vals)
    _store.dispatch(postActions.fetchPostResponsesResolved(responses.data))

    const page = params.page ? parseInt(params.page[0]) : 1

    return {
        props: {
            page,
            basePath: `/${category}/@${author}/${permlink}`
        }
    }
})

class ThreadLayout extends React.Component {
    constructor(props) {
        super(props);
        this.state = Object.assign({}, props.params, {
            replyAuthor: '',
        });
    }

    scrollToPostIfNeed = () => {
        const { hash } = window.location
        let matchesPost = hash.match(regexPost)
        if (matchesPost) {
            const id = '@' + matchesPost[1] + '/' + matchesPost[2]
            this.scrollToPost(id)
        }
    }

    componentDidMount() {
        this.scrollToPostIfNeed()
    }

    componentDidUpdate() {
        this.scrollToPostIfNeed()
    }

    scrollToPost = (id) => {
        if (this.state.scrolledTo === id) {
            return true
        }
        let page = this.getPageForPost(id)
        if (page === false) return false
        if (this.props.page !== page) {
            console.log('page wrong')
            let newPath = this.props.basePath + (page >= 2 ? ('/' + page) : '')
            newPath += '#' + id
            this.props.router.push(newPath)
        } else {
            console.log('page is ok, scrolling to post')
            setTimeout(() => {
                goToAnchor(id)
            }, 50);
            this.setState({
                scrolledTo: id,
            })
        }
        return true
    };

    getPageForPost = (id) => {
        let collection = this.props.post.responses,
            perPage = $GLS_Config.forum.replies_per_page || 10,
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

    handleResponse = async (submitted) => {
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
        await new Promise(resolve => setTimeout(resolve, 4000))
        await this.props.router.refresh({
            scroll: false
        })
        let anchor = '@' + submitted.post.author + '/' + submitted.post.permlink;
        this.setState({
            submitted: new Date(),
            scrollTo2: anchor
        });
        window.location.hash = anchor;
    };

    render() {
        let page = this.props.page,
            perPage = $GLS_Config.forum.replies_per_page || 10,
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
                <Grid>
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
                                baseHref={this.props.basePath}
                                />
                        </Grid.Column>
                    </Grid.Row>
                </Grid>
            </Segment>
        );
        const isBanned = this.props.post.forum && !!this.props.post.forum.banned[this.props.account.name];
        let nav = (
            <Segment basic>
                <Grid>
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
                                baseHref={this.props.basePath}
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
        let image = $GLS_Config.forum.meta_image;
        if (content && content.json_metadata && content.json_metadata.image && content.json_metadata.image.length > 0) {
            image = content.json_metadata.image[0];
        }
        const title = getPageTitle(content.title);
        const metaDesc = truncate(content.body, {length: 150});
        return (
            <div>
                <Head>
                    <title>{title}</title>
                    <meta name='description' content={metaDesc} />
                    <meta name='twitter:title' content={title} />
                    <meta name='twitter:description' content={metaDesc} />
                    <meta name='twitter:image:src' content={image} />
                    <meta property='og:title' content={title} />
                    <meta property='og:description' content={metaDesc} />
                    <meta property='og:image' content={image} />
                </Head>
                <Post
                    action={this.state.action}
                    page={page}
                    goReply={this.goReply}
                    { ...this.props } />
                { comments_nav }
                <Response
                    page={page}
                    perPage={perPage}
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
    };
}

function mapDispatchToProps(dispatch) {
    return {actions: bindActionCreators({
        ...accountActions,
        ...postActions,
    }, dispatch)}
}

export default withRouter(connect(mapStateToProps, mapDispatchToProps)(ThreadLayout))
