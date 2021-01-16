import React from 'react';
import { Helmet } from 'react-helmet';
import { BrowserRouter, Route, Switch, Redirect } from 'react-router-dom';
import golos from 'golos-classic-js';

import tt from 'counterpart';
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

import './app.css';
import '../../node_modules/noty/lib/noty.css';
import loadable from 'loadable-components'
const AccountsLayout = loadable(() => import('../components/layouts/accounts'));
const IndexLayout = loadable(() => import('../components/layouts/index'));
const FeedLayout = loadable(() => import('../components/layouts/feed'));
const ForumLayout = loadable(() => import('../components/layouts/forum'));
const ForumCreateLayout = loadable(() => import('../components/layouts/forum/create'));
const ForumsLayout = loadable(() => import('../components/layouts/forums'));
const RepliesLayout = loadable(() => import('../components/layouts/replies'));
const ThreadLayout = loadable(() => import('../components/layouts/thread'));
const TopicLayout = loadable(() => import('../components/layouts/topic'));

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
        return (
            <BrowserRouter>
                <div className='AppContainer'>
                    <Helmet>
                        <title>{ttGetByKey(CONFIG.FORUM, 'page_title')}</title>
                        <meta name='description' content={ttGetByKey(CONFIG.FORUM, 'meta_description')} />
                        <meta name='viewport' content='width=device-width, initial-scale=1' />
                        <meta name='twitter:card' content='summary' />
                        <meta name='twitter:title' content={ttGetByKey(CONFIG.FORUM, 'meta_title')} />
                        <meta name='twitter:description' content={ttGetByKey(CONFIG.FORUM, 'meta_description')} />
                        <meta name='twitter:image:src' content='https://i.imgur.com/0AeZtdV.png' />
                        <meta property='og:type' content='article' />  
                        <meta property='og:title' content={ttGetByKey(CONFIG.FORUM, 'meta_title')} />
                        <meta property='og:description' content={ttGetByKey(CONFIG.FORUM, 'meta_description')} />
                        <meta property='og:image' content='https://i.imgur.com/0AeZtdV.png' />
                    </Helmet>
                    <HeaderMenu />
                    <BreadcrumbMenu />
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
                            <Route path='/f/:id/:section?' component={ForumLayout} />
                            <Route path='/forum/:id' render={(props) => <Redirect to={`/f/${props.match.params.id}`}/>}/>
                            <Route path='/replies' component={RepliesLayout} />
                            <Route path='/topic/:category' component={TopicLayout} />
                            <Route path='/:category/@:author/:permlink/:action?' component={ThreadLayout} />
                            <Route path='/leave_page' component={Leave} />
                            <Route exact path='/:section?' component={IndexLayout} />
                        </Switch>
                    </Container>
                    <BreadcrumbMenu />
                    <BannerMenu />
                    <FooterMenu />
                </div>
            </BrowserRouter>
        );
    }
}

export default App;
