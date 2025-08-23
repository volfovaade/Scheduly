import { useNavigate } from "react-router-dom";

export default function ErrorNotification(error: any){
    const navigate = useNavigate();
    return (
        <div className="p-6">
            <div className="flex flex-col items-center justify-center min-h-[400px]">
                <div className="bg-red-50 border border-red-200 rounded-lg p-6 max-w-md text-center">
                    {error.type === 'not-found' && (
                        <div className="text-red-600 mb-4">
                            <svg className="mx-auto h-12 w-12 mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.732-.833-2.5 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
                            </svg>
                            <h3 className="text-lg font-semibold">Event not found</h3>
                        </div>
                    )}
                    
                    {error.type === 'unauthorized' && (
                        <div className="text-red-600 mb-4">
                            <svg className="mx-auto h-12 w-12 mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                            </svg>
                            <h3 className="text-lg font-semibold">Without authorization</h3>
                        </div>
                    )}
                    
                    {(error.type === 'network' || error.type === 'unknown') && (
                        <div className="text-red-600 mb-4">
                            <svg className="mx-auto h-12 w-12 mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                            </svg>
                            <h3 className="text-lg font-semibold">Error loading</h3>
                        </div>
                    )}
                    
                    <p className="text-red-800 mb-4">{error.message}</p>
                    
                    <div className="flex gap-3 justify-center">
                        <button
                            onClick={() => window.location.reload()}
                            className="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700 transition-colors"
                        >
                            Try again
                        </button>
                        <button
                            onClick={() => navigate('/dashboard')}
                            className="px-4 py-2 bg-gray-600 text-white rounded hover:bg-gray-700 transition-colors"
                        >
                            Back to my dashboard
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}