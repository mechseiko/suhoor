import { Download, AlertTriangle, Check, Shield } from 'lucide-react'
import SectionHeader from '../components/SectionHeader'
import PageLayout from '../layouts/PageLayout'

export default function Docs() {
    return (
        <PageLayout>
            <div className="pt-24 pb-12 px-4 sm:px-6 lg:px-8 max-w-4xl mx-auto">
                <div className="text-center mb-12">
                    <SectionHeader
                        title="Mobile App Guide"
                        subtitle="Everything you need to know about installing and using the Suhoor Android App."
                    />
                </div>

                <div className="space-y-12">
                    {/* Installation Guide */}
                    <section className="bg-white rounded-2xl shadow-sm border border-gray-100 p-8">
                        <div className="flex items-center gap-4 mb-6">
                            <div className="p-3 bg-primary/10 rounded-xl">
                                <Download className="h-6 w-6 text-primary" />
                            </div>
                            <h2 className="text-2xl font-bold text-gray-900">How to Install (APK)</h2>
                        </div>

                        <div className="space-y-6">
                            <div className="flex gap-4">
                                <div className="flex-shrink-0 w-8 h-8 bg-gray-100 rounded-full flex items-center justify-center font-bold text-gray-600">1</div>
                                <div>
                                    <h3 className="font-semibold text-gray-900 mb-1">Download the APK file</h3>
                                    <p className="text-gray-600">Click the "Download APK" button on the home page or use the link shared in your WhatsApp group.</p>
                                </div>
                            </div>
                            <div className="flex gap-4">
                                <div className="flex-shrink-0 w-8 h-8 bg-gray-100 rounded-full flex items-center justify-center font-bold text-gray-600">2</div>
                                <div>
                                    <h3 className="font-semibold text-gray-900 mb-1">Open the file</h3>
                                    <p className="text-gray-600">Tap on the downloaded file (`Suhoor-v1.apk`) in your notification shade or file manager.</p>
                                </div>
                            </div>
                            <div className="flex gap-4">
                                <div className="flex-shrink-0 w-8 h-8 bg-gray-100 rounded-full flex items-center justify-center font-bold text-gray-600">3</div>
                                <div>
                                    <h3 className="font-semibold text-gray-900 mb-1">Allow Unknown Sources</h3>
                                    <p className="text-gray-600 mb-3">Since this app isn't on the Play Store yet, your phone might ask for permission.</p>
                                    <div className="bg-yellow-50 text-yellow-800 p-4 rounded-xl text-sm flex items-start gap-3">
                                        <AlertTriangle className="h-5 w-5 shrink-0" />
                                        <span>Go to <strong>Settings</strong> {'>'} <strong>Security</strong> {'>'} <strong>Install unknown apps</strong> and allow permission for your browser or file manager.</span>
                                    </div>
                                </div>
                            </div>
                            <div className="flex gap-4">
                                <div className="flex-shrink-0 w-8 h-8 bg-gray-100 rounded-full flex items-center justify-center font-bold text-gray-600">4</div>
                                <div>
                                    <h3 className="font-semibold text-gray-900 mb-1">Install & Open</h3>
                                    <p className="text-gray-600">Click "Install". Once done, open the app and log in with your account!</p>
                                </div>
                            </div>
                        </div>
                    </section>

                    {/* Features & Permissions */}
                    <section className="bg-white rounded-2xl shadow-sm border border-gray-100 p-8">
                        <div className="flex items-center gap-4 mb-6">
                            <div className="p-3 bg-blue-50 rounded-xl">
                                <Shield className="h-6 w-6 text-blue-600" />
                            </div>
                            <h2 className="text-2xl font-bold text-gray-900">App Permissions</h2>
                        </div>

                        <div className="grid md:grid-cols-2 gap-6">
                            <div className="p-4 border border-gray-200 rounded-xl">
                                <div className="font-semibold text-gray-900 mb-2 flex items-center gap-2">
                                    <span className="p-1 bg-green-100 rounded text-green-700"><Check size={14} /></span>
                                    Location
                                </div>
                                <p className="text-sm text-gray-600">Required to calculate accurate Suhoor and Iftar times for your specific city.</p>
                            </div>
                            <div className="p-4 border border-gray-200 rounded-xl">
                                <div className="font-semibold text-gray-900 mb-2 flex items-center gap-2">
                                    <span className="p-1 bg-green-100 rounded text-green-700"><Check size={14} /></span>
                                    Notifications
                                </div>
                                <p className="text-sm text-gray-600">Required for the auto-alarm (15 mins before Suhoor) and when friends "Buzz" you.</p>
                            </div>
                        </div>

                        <div className="mt-6 text-sm text-gray-500 italic">
                            * We only use these permissions to wake you up. Your data stays private.
                        </div>
                    </section>
                </div>
            </div>
        </PageLayout>
    )
}
