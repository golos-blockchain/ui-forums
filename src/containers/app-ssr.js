import React from 'react';
import { Helmet } from 'react-helmet';
import { BrowserRouter, StaticRouter, Route, Switch, Redirect } from 'react-router-dom';
import golos from 'golos-classic-js';
import createBrowserHistory from 'history/createBrowserHistory'
import createMemoryHistory from 'history/createMemoryHistory'
import ttGetByKey from '../utils/ttGetByKey';

import { Container } from 'semantic-ui-react';

import * as CONFIG from '../../config';
import * as CONFIG_SEC from '../../configSecure';

import Account from '../containers/account';
import CreateAccount from '../containers/account/create';
import Leave from '../containers/leave';
import BreadcrumbMenu from '../components/global/breadcrumb';
import BannerMenu from '../components/global/banner';
import FooterMenu from '../components/global/footer';
import HeaderMenu from '../components/global/menu';
import GlobalNotice from '../components/global/notice';

import ThreadLayout from '../components/layouts/thread';
import IndexLayout from '../components/layouts/index';
import FeedLayout from '../components/layouts/feed';
import ForumLayout from '../components/layouts/forum';
import ForumCreateLayout from '../components/layouts/forum/create';
import ForumsLayout from '../components/layouts/forums';
import RepliesLayout from '../components/layouts/replies';
import TopicLayout from '../components/layouts/topic';

import './app.css';
import '../../node_modules/noty/lib/noty.css';
import loadable from 'loadable-components'

var _errorOrig = console.error;
function _logError(...parameters) {
    if ([...parameters].toString().includes('Warning: Unknown prop')) return;
    _errorOrig(...parameters);
}
console.error = _logError;

golos.config.set('websocket', CONFIG.GOLOS_NODE);
if (CONFIG.GOLOS_CHAIN_ID) {
    golos.config.set('chain_id', CONFIG.GOLOS_CHAIN_ID);
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
        const container = (<div className='AppContainer'>
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
            <HeaderMenu />
            <BreadcrumbMenu {...this.props.ssrState} />
            <GlobalNotice />
            <Container>
                <Switch>
                    {/*<Route exact path='/' render={(props) => <Redirect to='/forums'/>}/>*/}
                    <Route path='/@:username/:section?' component={Account} />
                    {/*<Route path='/accounts' component={AccountsLayout} />*/}
                    <Route path='/create_account' component={CreateAccount} />
                    <Route path='/create/forum' component={ForumCreateLayout} />
                    <Route path='/feed' component={FeedLayout} />
                    <Route path='/forums' component={ForumsLayout} />
                    <Route path='/forums/:group' component={IndexLayout} />
                    <Route path='/f/:id/:section?' component={(props) => <ForumLayout {...props} {...this.props.ssrState} />} />
                    <Route path='/forum/:id' render={(props) => <Redirect to={`/f/${props.match.params.id}`}/>}/>
                    <Route path='/replies' component={RepliesLayout} />
                    <Route path='/topic/:category' component={TopicLayout} />
                    <Route path='/:category/@:author/:permlink/:action?' component={(props) => <ThreadLayout {...props} {...this.props.ssrState} />} />
                    <Route path='/leave_page' component={Leave} />
                    <Route exact path='/:section?' component={(props) => <IndexLayout {...props} {...this.props.ssrState} />} />
                </Switch>
            </Container>
            <BreadcrumbMenu {...this.props.ssrState} />
            <BannerMenu />
            <FooterMenu />
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
