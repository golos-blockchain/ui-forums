import React from 'react'
import {ReactReduxContext} from 'react-redux';
import {PersistGate} from 'redux-persist/integration/react';
import Head from 'next/head';
import golos from 'golos-lib-js';
import ttGetByKey from '@/utils/ttGetByKey';

import { Container } from 'semantic-ui-react';

import CONFIG from '@/config';
import {wrapper} from '@/store';
import BannerMenu from '@/global/banner';
import BreadcrumbMenu from '@/global/breadcrumb';
import FooterMenu from '@/global/footer';
import HeaderMenu from '@/global/menu';

import '@/semantic/dist/semantic.min.css'
import '@/pages/index.css'

if (process.browser) {
    golos.config.set('websocket', CONFIG.golos_node);
    golos.config.set('chain_id', CONFIG.golos_chain_id);
}

class MyApp extends React.Component {
    state = {
    }

    render() {
        //const pathname = window.location.pathname;
        const isBlank = false//pathname === '/msgs' || pathname.startsWith('/msgs/');
        const { Component, pageProps, } = this.props
        const container = (
            <div className='AppContainer'>
                <Head>
                    <title>{ttGetByKey(CONFIG.forum, 'page_title')}</title>
                    <meta name='description' content={ttGetByKey(CONFIG.forum, 'meta_description')} />
                    <meta name='viewport' content='width=device-width, initial-scale=1' />
                    <meta name='twitter:card' content='summary' />
                    <meta name='twitter:title' content={ttGetByKey(CONFIG.forum, 'meta_title')} />
                    <meta name='twitter:description' content={ttGetByKey(CONFIG.forum, 'meta_description')} />
                    <meta name='twitter:image:src' content={CONFIG.forum.meta_image} />
                    <meta property='og:type' content='article' />  
                    <meta property='og:title' content={ttGetByKey(CONFIG.forum, 'meta_title')} />
                    <meta property='og:description' content={ttGetByKey(CONFIG.forum, 'meta_description')} />
                    <meta property='og:image' content={CONFIG.forum.meta_image} />
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
        )
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
