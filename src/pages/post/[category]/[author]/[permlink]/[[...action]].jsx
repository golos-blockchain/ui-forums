import React from 'react'

import { wrapSSR, } from '@/server/ssr'
import Thread, { getData } from '@/containers/thread'

export const getServerSideProps = wrapSSR(async (context) => {
    const data = await getData(context)
    return {
        props: data.props,
    }
})

class ThreadLayout extends React.Component {
    render() {
        return (
            <Thread post={this.props.post} />
        )
    }
}

export default ThreadLayout
