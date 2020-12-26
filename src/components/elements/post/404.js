import React from 'react';
import tt from 'counterpart';

import { Header, Segment } from 'semantic-ui-react';

export default class Post404 extends React.Component {

    render() {
        return (
            <Segment textAlign='center' padded='very'>
                <Header size='huge'>
                    {tt('forum_controls.post_404')}
                    <Header.Subheader>
                        <p>{tt('forum_controls.post_404_desc')}</p>
                    </Header.Subheader>
                </Header>
            </Segment>
        );
    }
}
