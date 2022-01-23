import { wrapper, } from '@/store'
import { setSecureHeaders, } from '@/server/security'
import { initNative, } from '@/server/initGolos'

export const wrapSSR = (ssrHandler) => {
    return wrapper.getServerSideProps(store => async (context) => {
        setSecureHeaders(context.res)
        await initNative()
        const newContext = { ...context, _store: store }
        return await ssrHandler(newContext)
    });
}
