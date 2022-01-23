import React from 'react'

import { wrapSSR, } from '@/server/ssr'
import Forums, { getData } from '@/containers/forums'

export const getServerSideProps = wrapSSR(async (context) => {
    const data = await getData(context)
    return {
        props: data.props,
    }
})

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
        )
    }
}

export default IndexLayout
