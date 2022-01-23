import React from 'react'

import { wrapSSR, } from '@/server/ssr'
import Forum, { getData } from '@/containers/forum'

export const getServerSideProps = wrapSSR(async (context) => {
    const data = await getData(context)
    return {
        props: data.props,
    }
})

export default class ForumLayout extends React.Component {
    render() {
        return (
            <Forum
                childForums={this.props.childForums}
                topics={this.props.topics}
                forum={this.props.forum}
                filter={this.props.filter}
                page={this.props.page}
            />
        )
    }
}
