import React from 'react'
import { withRouter as withBaseRouter } from 'next/router'

export class RouterFluent {
    constructor(router) {
        this.router = router
        const baseUrl = 'http://localhost'
        this.url = new URL(router.asPath, baseUrl)
        this.urlView = new URL(router.asPath, baseUrl)
    }

    toUrl(str, options = true) {
        this.url.pathname = str
        const isVisible = options === true || options.visible
        if (isVisible) {
            this.urlView.pathname = str
        }
        return this
    }

    withQuery(key, value, options = true) {
        const isRemove = value === false || value === undefined || value === null
        const isVisible = options === true || options.visible
        if (isRemove) {
            this.url.searchParams.delete(key)
            this.urlView.searchParams.delete(key)
        } else {
            this.url.searchParams.set(key, value)
            if (isVisible) {
                this.urlView.searchParams.set(key, value)
            }
        }
        return this
    }

    noQuery(key) {
        return this.query(key, undefined)
    }

    _stringify() {
        const url = this.url.pathname + this.url.search
        const urlView = this.urlView.pathname + this.urlView.search
        return [ url, urlView ]
    }

    push(options) {
        const [ url, urlView ] = this._stringify()
        return this.router.push(url, urlView, options)
    }

    replace(options) {
        const [ url, urlView ] = this._stringify()
        return this.router.replace(url, urlView, options)
    }
}

export class RouterX {
    constructor(baseRouter) {
        this._baseRouter = baseRouter
    }

    get baseRouter() {
        return this._baseRouter
    }

    get asPath() {
        return this.baseRouter.asPath
    }

    get query() {
        return this.baseRouter.query
    }

    get events() {
        return this.baseRouter.events
    }

    push(url, asUrl, options) {
        return this.baseRouter.push(url, asUrl, options)
    }

    replace(url, asUrl, options) {
        return this.baseRouter.replace(url, asUrl, options)
    }

    // Works as window.location.reload()
    reload() {
        this.baseRouter.reload()
    }

    refresh(options) {
        return this.replace(this.asPath, undefined, options)
    }

    _chain(func) {
        let chaining = new RouterFluent(this)
        chaining = func(chaining)
        return chaining
    }

    withQuery(key, val, options = true) {
        return this._chain((chaining) => {
            return chaining.withQuery(key, val, options)
        })
    }

    noQuery(key, val, options = true) {
        return this._chain((chaining) => {
            return chaining.noQuery(key, val, options)
        })
    }

    toUrl(str, options = true) {
        return this._chain((chaining) => {
            return chaining.toUrl(key, val, options)
        })
    }
}

export function withRouter(WrappedComponent) {
    const cl = class extends React.Component {
        render() {
            const router = new RouterX(this.props.router)
            return (
                <WrappedComponent
                    {...this.props}
                    router={router}
                />
            )
        }
    }
    return withBaseRouter(cl)
}
