import React from 'react'
import golos from 'golos-lib-js'

export function withNative(WrappedComponent) {
    return class extends React.Component {
        state = {
            nativeLoaded: false,
        }

        async componentDidMount() {
            try {
                await golos.importNativeLib()
                this.setState({
                    nativeLoaded: true,
                    nativeFailed: false,
                });
            } catch (error) {
                console.error('ERROR - Cannot load golos native lib', error);
                this.setState({
                    nativeFailed: true,
                })
            }
        }

        render() {
            // isNativeLibLoaded is for SSR case
            const ownLib = golos.isNativeLibLoaded()
            const nativeLoaded = this.state.nativeLoaded || ownLib
            const nativeFailed = this.state.nativeFailed && !ownLib
            return (
                <WrappedComponent
                    {...this.props}
                    nativeLoaded={nativeLoaded}
                    nativeFailed={nativeFailed}
                />
            )
        }
    }
}