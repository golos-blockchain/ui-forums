import React from 'react'
import Link from 'next/link'
import tt from 'counterpart'

import { Popup, Icon } from 'semantic-ui-react'

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
            if (withMsgsButton)
                link = (
                    <span>
                        {link}
                        &nbsp;
                        <Link href={`/msgs/@${username}`}>
                            <a target='_blank'>
                                <Icon name='envelope' color='blue' title={tt('g.write_message')} />
                            </a>
                        </Link>
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
                {withMsgsButton ? (
                    <span>
                        &nbsp;
                        <Link href={`/msgs/@${username}`}>
                            <a target='_blank'>
                                <Icon name='envelope' color='blue' title={tt('g.write_message')} />
                            </a>
                        </Link>
                    </span>
                ) : null}
            </span>
        )
    }
}
