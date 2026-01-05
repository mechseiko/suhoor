import { useEffect } from 'react'
import { useRegisterSW } from 'virtual:pwa-register/react'

export default function PWAManager() {
    const {
        offlineReady: [offlineReady, setOfflineReady],
        needRefresh: [needRefresh, setNeedRefresh],
        updateServiceWorker,
    } = useRegisterSW({
        onRegistered(r) {
            console.log('SW Registered: ' + r)
        },
        onRegisterError(error) {
            console.log('SW registration error', error)
        },
    })

    useEffect(() => {
        if (offlineReady) {
            console.log('App ready to work offline')
        }
        if (needRefresh) {
            console.log('New content available, click to update')
            // You could show a toast here
            if (confirm('New content available for Suhoor app. Reload?')) {
                updateServiceWorker(true)
            }
        }
    }, [offlineReady, needRefresh, updateServiceWorker])

    return null
}
