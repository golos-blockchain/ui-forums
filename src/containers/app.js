import React from 'react';
import { Helmet } from 'react-helmet';
import { BrowserRouter, StaticRouter, Route, Switch, Redirect } from 'react-router-dom';
import golos from 'golos-lib-js';
import createBrowserHistory from 'history/createBrowserHistory'
import createMemoryHistory from 'history/createMemoryHistory'
import ttGetByKey from '../utils/ttGetByKey';

import { Container } from 'semantic-ui-react';

import * as CONFIG from '../../config';
import * as CONFIG_SEC from '../../configSecure.min';

import Account from '../containers/account';
import Leave from '../containers/leave';
import BreadcrumbMenu from '../components/global/breadcrumb';
import BannerMenu from '../components/global/banner';
import FooterMenu from '../components/global/footer';
import HeaderMenu from '../components/global/menu';
import GlobalNotice from '../components/global/notice';
import NotifiAuthorizer from '../components/global/NotifiAuthorizer';

import './app.css';
import '../../node_modules/noty/lib/noty.css';
import loadable from 'loadable-components';
const IndexLayout = loadable(() => import('../components/layouts/index'));
const FeedLayout = loadable(() => import('../components/layouts/feed'));
const MessagesLayout = loadable(() => import('../components/layouts/messages'));
const ForumLayout = loadable(() => import('../components/layouts/forum'));
const ForumCreateLayout = loadable(() => import('../components/layouts/forum/create'));
const ForumsLayout = loadable(() => import('../components/layouts/forums'));
const RepliesLayout = loadable(() => import('../components/layouts/replies'));
const ThreadLayout = loadable(() => import('../components/layouts/thread'));
const TopicLayout = loadable(() => import('../components/layouts/topic'));
const SearchResults = loadable(() => import('../containers/search/results'));

var _errorOrig = console.error;
function _logError(...parameters) {
    if ([...parameters].toString().includes('Warning: Unknown prop')) return;
    _errorOrig(...parameters);
}
console.error = _logError;

golos.config.set('websocket', CONFIG.GOLOS_NODE);
golos.config.set('chain_id', CONFIG.GOLOS_CHAIN_ID);

if (typeof window !== 'undefined') {
    if (window.location.pathname === '/msgs'
        || window.location.pathname.startsWith('/msgs/')) {
        golos.config.set('websocket', CONFIG.GOLOS_MSGS_NODE);
    }
}

let history

if (typeof document !== 'undefined') {
    history = createBrowserHistory();
} else {
    history = createMemoryHistory();
}


class App extends React.Component {
    componentDidMount() {
        window.addEventListener('click', this.checkLeave);
    }

    shouldComponentUpdate(nextProps, nextState) {
        return true;
    }

    checkLeave = (e) => {
        if (!CONFIG_SEC.anti_phishing.enabled) return;

        const pathname = window.location.pathname;
        if (pathname === '/leave_page') return;

        const a = e.target.closest('a');

        if (
            a &&
            a.hostname &&
            a.hostname !== window.location.hostname &&
            !CONFIG_SEC.anti_phishing.white_list.some(domain =>
                new RegExp(`${domain}$`).test(a.hostname)
            )
        ) {
            e.stopPropagation();
            e.preventDefault();

            const win = window.open(`/leave_page?${a.href}`, '_blank');
            win.focus();
        }
    };

    render() {
        const pathname = window.location.pathname;
        const isBlank = pathname === '/msgs' || pathname.startsWith('/msgs/');
        let container = (<div className='AppContainer'>
            <Helmet>
                <title>{ttGetByKey(CONFIG.FORUM, 'page_title')}</title>
                <meta name='description' content={ttGetByKey(CONFIG.FORUM, 'meta_description')} />
                <meta name='viewport' content='width=device-width, initial-scale=1' />
                <meta name='twitter:card' content='summary' />
                <meta name='twitter:title' content={ttGetByKey(CONFIG.FORUM, 'meta_title')} />
                <meta name='twitter:description' content={ttGetByKey(CONFIG.FORUM, 'meta_description')} />
                <meta name='twitter:image:src' content={CONFIG.FORUM.meta_image} />
                <meta property='og:type' content='article' />  
                <meta property='og:title' content={ttGetByKey(CONFIG.FORUM, 'meta_title')} />
                <meta property='og:description' content={ttGetByKey(CONFIG.FORUM, 'meta_description')} />
                <meta property='og:image' content={CONFIG.FORUM.meta_image} />
            </Helmet>
            {!isBlank ? (<HeaderMenu />) : null}
            {!isBlank ? (<BreadcrumbMenu {...this.props.ssrState} withSearch={true} />) : null}
            {!isBlank ? (<GlobalNotice />) : null}
            <Container fluid={isBlank} className={isBlank ? 'noPadding' : ''}>
                <Switch>
                    {/*<Route exact path='/' render={(props) => <Redirect to='/forums'/>}/>*/}
                    <Route path='/@:username/:section?' component={Account} />
                    {/*<Route path='/accounts' component={AccountsLayout} />*/}
                    <Route path='/create/forum' component={ForumCreateLayout} />
                    <Route path='/feed' component={FeedLayout} />
                    <Route path='/msgs/:to?' component={MessagesLayout} />
                    <Route path='/forums' component={ForumsLayout} />
                    <Route path='/forums/:group' component={IndexLayout} />
                    <Route path='/f/:id/:section?' component={(props) => <ForumLayout {...props} {...this.props.ssrState} />} />
                    <Route path='/forum/:id' render={(props) => <Redirect to={`/f/${props.match.params.id}`}/>}/>
                    <Route path='/replies' component={RepliesLayout} />
                    <Route path='/topic/:category' component={TopicLayout} />
                    <Route path='/:category/@:author/:permlink/:action?' component={(props) => <ThreadLayout {...props} {...this.props.ssrState} />} />
                    <Route path='/leave_page' component={Leave} />
                    <Route path='/search/:query?' component={SearchResults} />
                    <Route exact path='/:section?' component={(props) => <IndexLayout {...props} {...this.props.ssrState} />} />
                </Switch>
            </Container>
            {!isBlank ? (<BreadcrumbMenu {...this.props.ssrState} withSearch={true} />) : null}
            {!isBlank ? (<BannerMenu />) : null}
            {!isBlank ? (<FooterMenu />) : null}
            <NotifiAuthorizer />
        </div>);
        if (this.props.ssrRoute) {
            const context = {};
            return (
                <StaticRouter location={this.props.ssrRoute || '/'} context={context}>
                    {container}
                </StaticRouter>
            );
        } else {
            return (<BrowserRouter>
                {container}
            </BrowserRouter>);
        }
    }
}

export default App;
