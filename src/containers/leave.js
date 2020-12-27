import React from 'react';
import { Helmet } from 'react-helmet';
import { Link } from 'react-router-dom';
import tt from 'counterpart';
import ttGetByKey from '../utils/ttGetByKey';
import { getPageTitle } from '../utils/text';

import { Header, Segment, Button } from 'semantic-ui-react';

import * as CONFIG from '../../config';

export default class Leave extends React.Component {

    render() {
        const targetPage = this.props.location.search.slice(1) + this.props.location.hash;
        const ourForum = (<Link to='/'>{ttGetByKey(CONFIG.FORUM, 'link_title')}</Link>);
        const golosBlockchain = (<a href='https://golos.id'>Golos Blockchain</a>);
        return (
            <Segment textAlign='left' padded='very'>
                <Helmet>
                    <title>{getPageTitle(tt('leave_page.title'))}</title>
                </Helmet>
                <Header size='huge' style={{fontWeight: 'normal'}}>
                    {tt('leave_page.title')}<Link to='/'>{ttGetByKey(CONFIG.FORUM, 'link_title')}</Link>
                    <Header.Subheader>
                        <br/>
                        <p>
                            {tt('leave_page.desc1')}
                        </p>
                        <b><pre>
                            {targetPage}
                        </pre></b>
                        <p>
                            {ourForum} {tt('g.and')} {golosBlockchain} {tt('leave_page.desc2')}
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
