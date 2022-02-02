import React from 'react'
import Head from 'next/head'
import Link from '@/elements/link'
import tt from 'counterpart'
import ttGetByKey from '@/utils/ttGetByKey'
import { getPageTitle } from '@/utils/text'

import { Header, Segment, Button } from 'semantic-ui-react'

import { wrapSSR, } from '@/server/ssr'

export const getServerSideProps = wrapSSR(async ({req, res}) => {
    const parts = req.url.split('?')
    if (!parts[1]) {
        return {
            notFound: true,
        }
    }
    parts.shift()
    return {
        props: {
            ssrUrl: parts.join('?') // correct, but not includes #hash if presents in orig. URL
        }
    }
})

export default class Leave extends React.Component {

    render() {
        let targetPage = this.props.ssrUrl
        if (process.browser) {
            targetPage = window.location.search.slice(1) + window.location.hash
        }
        const ourForum = (<Link href='/'>{ttGetByKey($GLS_Config.forum, 'link_title')}</Link>);
        return (
            <Segment textAlign='left' padded='very'>
                <Head>
                    <title>{getPageTitle(tt('leave_page.title'))}</title>
                </Head>
                <Header size='huge' style={{fontWeight: 'normal'}}>
                    {tt('leave_page.title')}<Link href='/'>{ttGetByKey($GLS_Config.forum, 'link_title')}</Link>
                    <Header.Subheader>
                        <br/>
                        <p>
                            {tt('leave_page.desc1')}
                        </p>
                        <b><pre>
                            {targetPage}
                        </pre></b>
                        <p>
                            {ourForum} {tt('leave_page.desc2')}
                        </p>
                        <p>
                            {tt('leave_page.desc3')}
                        </p>
                        <p>
                            {tt('leave_page.desc4')} {ourForum} {tt('leave_page.desc5')}
                        </p>
                        <p>
                            <Button primary as='a' href={targetPage}>
                                {tt('g.go_link')}
                            </Button>
                        </p>
                    </Header.Subheader>
                </Header>
            </Segment>
        );
    }
}
