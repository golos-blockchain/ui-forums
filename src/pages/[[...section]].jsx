import React from 'react';
//import { withRouter } from 'react-router-dom';

import {wrapper} from '@/store';
import Forums, { getData } from '@/containers/forums';

export const getServerSideProps = wrapper.getServerSideProps(store => async (context) => {
    const data = await getData(store, context)
    return {
        props: data.props,
    }
});

class IndexLayout extends React.Component {
    render() {
        return (
            <Forums 
                forums={this.props.forums}
                moders={this.props.moders}
                supers={this.props.supers}
                admins={this.props.admins}
                section={this.props.section}
                />
        );
    }
}

export default IndexLayout;
