import React from 'react'
import Head from 'next/head'
import { bindActionCreators } from 'redux'
import { connect } from 'react-redux'
import { withRouter } from 'next/router'
import ReactDOMServer from 'react-dom/server'
import tt from 'counterpart'
import fetch from 'cross-fetch'

import { Accordion, Dimmer, Grid, Header, Icon, Loader, Message, Segment } from 'semantic-ui-react'

import * as breadcrumbActions from '@/actions/breadcrumbActions';
import * as forumActions from '@/actions/forumActions';
import * as moderationActions from '@/actions/moderationActions';
import * as subscriptionActions from '@/actions/subscriptionActions';
import * as postActions from '@/actions/postActions';
import * as statusActions from '@/actions/statusActions';

import ForumControls from '@/elements/forum/controls';
import ForumIndex from '@/elements/forum/index';
import ForumTitle from '@/elements/forum/title';
import Forum404 from '@/elements/forum/404';
import ForumEmpty from '@/elements/forum/empty';
import ForumPosts from '@/elements/forum/posts';
import PostForm from '@/modules/post/form';
import { getForumName, getPageTitle } from '@/utils/text';
import { getForum } from '@/server/getForums'
import { wrapSSR, } from '@/server/ssr'

import importNoty from '@/utils/importNoty';

export const getServerSideProps = wrapSSR(async ({ req, res, params, query, _store, }) => {
    const page = query.page ? parseInt(query.page) : 1
    const data = await getForum(params.forumid, page, query.filter)
    if (data.forum) { // forum url correct
        let trail = data.forum.trail.map(item => {
            return {
                name: getForumName(item),
                link: `/f/${item._id}`
            };
        });
        _store.dispatch(breadcrumbActions.setBreadcrumb(trail));
    } else {
        res.statusCode = 404
    }

    let forumNew = null
    const { forum, moders, supers, hidden, banned } = data
    if (forum)
        forumNew = Object.assign({moders, supers, hidden, banned}, forum)
    return {
        props: {
            childForums: data.childForums,
            topics: data.data,
            forum: forumNew,
            filter: query.filter || '',
            page,
        }
    }
})

class ForumLayout extends React.Component {
    constructor(props, state) {
        super(props, state);
        this.state = {
            loadingPosts: !!props.forum && !props.topics,
            topics: props.topics,
            newForum: false,
            showNewPost: false,
            showModerated: false,
            showSubforums: true,
        };
    }

    getSection = (props) => {
        let { section, } = (props || this.props).router.query
        return section ? section[0] : ''
    }

    changePage = (page) => {
        const path = this.props.router.asPath
        let newPath = new URL(path, $GLS_Config.rest_api)
        newPath.searchParams.set('page', page)
        this.props.router.push(newPath.pathname + newPath.search,
            undefined,
            {
                scroll: true
            })
    }

    showNewPost = () => this.setState({ showNewPost: true });
    hideNewPost = (e) => this.setState({ showNewPost: false });
    showSubforums = () => this.setState({showSubforums: true});
    hideSubforums = () => this.setState({showSubforums: false});
    toggleSubforums = () => (this.state.showSubforums) ? this.hideSubforums() : this.showSubforums();
    handleNewPost = async (data) => {
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
            topics: false,
            showNewPost: false,
            loadingPosts: true
        });
        setTimeout(() => {
            this.props.router.replace(this.props.router.asPath,
                undefined,
                {
                    scroll: false
                })
        }, 4000);
    };

    componentDidUpdate(prevProps, prevState) {
        const prevForumid = prevProps.router.query.forumid
        const { forumid } = this.props.router.query

        if (prevForumid !== forumid 
            || this.props.filter !== prevProps.filter
            || this.props.page !== prevProps.page
            || (this.props.topics && !prevProps.topics)) {
            this.setState({
                topics: this.props.topics,
                loadingPosts: false,
            })
        }
    }

    UNSAFE_componentWillMount() {
        this.props.actions.resetPostState();
    }

    changeVisibility = (e, data) => {
        this.setState({showModerated: data.checked}, () => {
            const path = this.props.router.asPath
            let oldPath = new URL(path, $GLS_Config.rest_api)
            oldPath.searchParams.delete('filter')
            let newPath = new URL(path, $GLS_Config.rest_api)
            if (data.checked)
                newPath.searchParams.set('filter', 'all')
            else
                newPath.searchParams.delete('filter')
            this.props.router.push(newPath.pathname + newPath.search,
                oldPath.pathname + oldPath.search,
                {
                    scroll: false
                })
            //this.getForum();
        });
    };

    removeTopic = (id) => {
        const topics = this.state.topics.filter((topic) => {
            return topic._id !== id;
        });
        this.setState({topics});
    };

    render() {
        let account = this.props.account,
            forum = this.props.forum,
            childForums = this.props.childForums || {},
            controls = false,
            display = false,
            subforums = false,
            page = this.props.page,
            isUser = this.props.account.isUser,
            perPage = $GLS_Config.forum.posts_per_page,
            posts = (forum && forum.stats) ? forum.stats.posts : 0,
            topics = this.state.topics;
        const { forumid } = this.props.router.query
        const childForums_cnt = Object.keys(childForums).length;
        if (childForums_cnt > 0) {
            let childs = [];
            for (let [_id, forum] of Object.entries(childForums)) {
                childs.push(<ForumIndex _id={_id} forum={forum} key={_id} />);
            }
            const panels = [
                {
                  key: 'subforums',
                  title: (
                      <Header
                          size='small'
                          key='subforums-title'
                          as={Accordion.Title}
                          content={tt('forum_controls.subcats') + `${childForums_cnt})`}
                          icon='fork'
                          onClick={this.toggleSubforums}
                          style={{marginBottom: 0}}
                      />
                  ),
                  content: {
                      active: this.state.showSubforums,
                      content: (
                          <Segment basic>
                              {childs}
                          </Segment>
                      ),
                      key: 'subforums'
                  },
                }
            ]
            subforums = (
                <Segment secondary attached='bottom'>
                    <Accordion panels={panels} />
                </Segment>
            );
        }
        if (forum) {
            controls = (
                <Segment basic vertical>
                    <ForumControls
                        changePage={this.changePage.bind(this)}
                        changeVisibility={this.changeVisibility.bind(this)}
                        isUser={isUser}
                        isBanned={!!forum.banned[account.name]}
                        page={page}
                        perPage={perPage}
                        posts={posts}
                        showModerated={this.state.showModerated}
                        showNewPost={this.showNewPost.bind(this)}
                    />
                </Segment>
            );
        }
        if (!this.state.loadingPosts) {
            if (forum) {
                if (this.state.showNewPost) {
                    controls = false;
                    display = (
                        <PostForm
                            formHeader={(
                                <br/>
                            )}
                            forum={forum}
                            filter={this.state.filter}
                            elements={['body', 'title']}
                            onCancel={this.hideNewPost}
                            onComplete={this.handleNewPost}
                            target={this.props.forum}
                            { ... this.props } />
                    );
                } else {
                    if (topics.length > 0) {
                        display = (
                            <div>
                                <ForumPosts
                                    account={account}
                                    actions={this.props.actions}
                                    forum={forum}
                                    moderation={this.props.moderation}
                                    topics={topics}
                                    removeTopic={this.removeTopic.bind(this)}
                                />
                            </div>
                        );
                    } else {
                        display = (<ForumEmpty forum={forum} isUser={isUser} showNewPost={this.showNewPost} />);
                    }
                }
            } else {
                display = (<Forum404 />)
            }
        } else {
            display = (
                <Segment>
                    <Grid.Column width={16} style={{minHeight: '200px'}}>
                        <Dimmer inverted active style={{minHeight: '100px', display: 'block'}}>
                            <Loader size='large'/>
                        </Dimmer>
                    </Grid.Column>
                </Segment>
            )
        }
        let meta = false;
        if (forum && forumid) {
            const title = getPageTitle(getForumName(forum));
            const image = $GLS_Config.forum.meta_image;
            meta = (
                <Head>
                    <title>{title}</title>
                    <meta name='description' content={forum.desc_ru} />
                    <meta name='twitter:title' content={title} />
                    <meta name='twitter:description' content={forum.desc_ru} />
                    <meta name='twitter:image:src' content={image} />
                    <meta property='og:title' content={title} />
                    <meta property='og:description' content={forum.desc_ru} />
                    <meta property='og:image' content={image} />
                </Head>
            );
        }
        return (
            <div>
                {meta}
                {forum ? <ForumTitle
                    active={this.state.filter}
                    _id={forumid}
                    forum={forum}
                    account={account}
                    attached={(subforums) ? 'top' : false}
                    subforums={subforums}
                    { ... this.props } /> : null}
                {controls}
                <Segment basic vertical style={{padding: 0}}>
                    {display}
                </Segment>
                {controls}
            </div>
        );
    }
}

function mapStateToProps(state, ownProps) {
    return {
        account: state.account,
        moderation: state.moderation,
        post: state.post,
        status: state.status,
        subscriptions: state.subscriptions
    };
}

function mapDispatchToProps(dispatch) {
    return {actions: bindActionCreators({
        ...breadcrumbActions,
        ...moderationActions,
        ...forumActions,
        ...postActions,
        ...statusActions,
        ...subscriptionActions,
    }, dispatch)};
}

export default withRouter(connect(mapStateToProps, mapDispatchToProps)(ForumLayout));
