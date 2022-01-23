import React from 'react';
import { withRouter } from 'react-router-dom';

import Forums from '../../containers/forums';
//import Sidebar from '../../containers/sidebar';

class IndexLayout extends React.Component {
    render() {
        const params = this.props.match.params;
        return (
            /*<Grid stackable>
                <Grid.Row>
                    <Grid.Column width={4} className='mobile hidden'>
                        <Sidebar
                            section='index'
                            forums={params}
                        />
                    </Grid.Column>
                    <Grid.Column mobile={16} tablet={12} computer={12}>
                        <Forums forums={params} section={params.section} />
                    </Grid.Column>
                </Grid.Row>
            </Grid>*/
            <Forums forums={params} section={params.section} 
                forums0={this.props.forums}
                moders={this.props.moders}
                supers={this.props.supers}
                admins={this.props.admins}
                users={this.props.users}
                />
        );
    }
}

export default withRouter(IndexLayout);
