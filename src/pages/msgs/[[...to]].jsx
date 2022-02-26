import React from 'react'

import { wrapSSR, } from '@/server/ssr'
import { msgsLink, } from '@/utils/ExtLinkUtils'

export const getServerSideProps = wrapSSR(async ({ req, res, params, query, _store, }) => {
    const to = params.to ? params.to[0] : ''
    const redirectLink = msgsLink(to)
    if (redirectLink) return {
    	redirect: {
    		destination: redirectLink,
    		permanent: true,
    	}
    }
})

class MsgsRedirect extends React.Component {
	render() {
		return <div></div>
	}
}

export default MsgsRedirect
