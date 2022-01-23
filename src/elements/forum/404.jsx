import React from 'react'
import tt from 'counterpart'

import { Header, Icon, Segment } from 'semantic-ui-react'

export default class Forum404 extends React.Component {
    render() {
        return (<Segment basic>
            <Segment padded textAlign='center'>
                <Icon name='warning' size='huge' />
                <Header>
                    {tt('forum_controls.forum_404')}
                    <Header.Subheader>
                        {tt('forum_controls.forum_404_desc')}
                    </Header.Subheader>
                </Header>
            </Segment>
        </Segment>)
    }
}
