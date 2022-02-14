import React from 'react'
import {ReactReduxContext} from 'react-redux';
import {PersistGate} from 'redux-persist/integration/react';
import Head from 'next/head';
import golos from 'golos-lib-js';
import ttGetByKey from '@/utils/ttGetByKey';

import { Container } from 'semantic-ui-react';

import {wrapper} from '@/store';
import BannerMenu from '@/elements/global/banner';
import BreadcrumbMenu from '@/elements/global/breadcrumb';
import FooterMenu from '@/elements/global/footer';
import HeaderMenu from '@/elements/global/menu';

import '@/semantic/dist/semantic.css'
import '@/pages/index.css'
import '@/elements/post/form/MarkdownEditor/MarkdownEditor.css';
import '@/elements/post/form/MarkdownEditorToolbar/index.css';
import '@/elements/post/button/voting.css';
import 'noty/lib/noty.css'

class MyApp extends React.Component {
    state = {
    }

    constructor(props) {
        super(props)
        if (props.pageProps._golos_config) {
            (typeof(window) === 'undefined' ? global : window).$GLS_Config = props.pageProps._golos_config
            if (process.browser) {
                golos.config.set('websocket', $GLS_Config.golos_node);
                golos.config.set('chain_id', $GLS_Config.golos_chain_id);
            }
        }
    }

    checkLeave = (e) => {
        if (!$GLS_Config.anti_phishing.enabled) return

        const pathname = window.location.pathname
        if (pathname === '/leave_page') return

        const a = e.target.closest('a')

        if (
            a &&
            a.hostname &&
            a.hostname !== window.location.hostname &&
            !$GLS_Config.anti_phishing.white_list.some(domain =>
                new RegExp(`${domain}$`).test(a.hostname)
            )
        ) {
            e.stopPropagation()
            e.preventDefault()

            const win = window.open(`/leave_page?${a.href}`, '_blank')
            win.focus()
        }
    }

    componentDidMount() {
        window.addEventListener('click', this.checkLeave);
    }

    render() {
        //const pathname = window.location.pathname;
        const isBlank = false//pathname === '/msgs' || pathname.startsWith('/msgs/');
        const { Component, pageProps, } = this.props
        const container = typeof($GLS_Config) !== 'undefined' ? (
            <div className='AppContainer'>
                <Head>
                    <title>{ttGetByKey($GLS_Config.forum, 'page_title')}</title>
                    <meta name='description' content={ttGetByKey($GLS_Config.forum, 'meta_description')} />
                    <meta name='viewport' content='width=device-width, initial-scale=1' />
                    <meta name='twitter:card' content='summary' />
                    <meta name='twitter:title' content={ttGetByKey($GLS_Config.forum, 'meta_title')} />
                    <meta name='twitter:description' content={ttGetByKey($GLS_Config.forum, 'meta_description')} />
                    <meta name='twitter:image:src' content={$GLS_Config.forum.meta_image} />
                    <meta property='og:type' content='article' />  
                    <meta property='og:title' content={ttGetByKey($GLS_Config.forum, 'meta_title')} />
                    <meta property='og:description' content={ttGetByKey($GLS_Config.forum, 'meta_description')} />
                    <meta property='og:image' content={$GLS_Config.forum.meta_image} />
                    <link rel='icon' href={$GLS_Config.forum.favicon_png_image} type='image/png' />
                </Head>
                {!isBlank ? (<HeaderMenu />) : null}
                {!isBlank ? (<BreadcrumbMenu withSearch={true} />) : null}
                <Container fluid={isBlank} className={isBlank ? 'noPadding' : ''}>
                    <Component {...pageProps} />
                </Container>
                {!isBlank ? (<BreadcrumbMenu withSearch={true} />) : null}
                {!isBlank ? (<BannerMenu />) : null}
                {!isBlank ? (<FooterMenu />) : null}
            </div>
        ) : <Component {...pageProps} />
          if (process.browser) return (
            <ReactReduxContext.Consumer>
              {({store}) => {
                return (<PersistGate persistor={store.__persistor} loading={<div>Loading</div>}>
                 {container}
                </PersistGate>)
              }}
            </ReactReduxContext.Consumer>
          ); else return (
            container
          );
    }
}

export default wrapper.withRedux(MyApp);
