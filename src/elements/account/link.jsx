import React from 'react'
import Link from '@/elements/link'
import tt from 'counterpart'

import { Popup, Icon } from 'semantic-ui-react'

import { msgsHost, msgsLink, } from '@/utils/ExtLinkUtils'

export default class AccountLink extends React.Component {
    render() {
        const { color, username, reputation, withMsgsButton, noPopup, isBanned } = this.props
        const content = this.props.content || `@${username}`
        let link = (
            <Link href={`/@${username}`}>
                <a style={{color, textDecoration: isBanned ? 'line-through' : undefined}}>
                    {content}
                </a>
            </Link>
        )
        if (noPopup) {
            if (withMsgsButton && msgsHost())
                link = (
                    <span>
                        {link}
                        &nbsp;
                        <a href={msgsLink(username)} target='_blank' rel='noopener noreferrer'>
                            <Icon name='envelope' color='blue' title={tt('g.write_message')} />
                        </a>
                    </span>
                )
            return link
        }
        return (<span>
                {link}
                {reputation ? <Popup
                    content={tt('account.reputation')}
                    trigger={<span>&nbsp;({reputation})</span>}
                    mouseEnterDelay={500}
                    inverted
                /> : null}
                {(withMsgsButton && msgsHost()) ? (
                    <span>
                        &nbsp;
                        <a href={msgsLink(username)} target='_blank' rel='noopener noreferrer'>
                            <Icon name='envelope' color='blue' title={tt('g.write_message')} />
                        </a>
                    </span>
                ) : null}
            </span>
        )
    }
}
