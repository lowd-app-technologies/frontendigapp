import { doc, getDoc } from "firebase/firestore"
import FirebaseDB from "@/services/firebase/FirebaseDB"
import { useEffect, useState } from "react"

const FirestoreExample = () => {
    const [data, setData] = useState<{firstName?: string, lastName?: string}>({})
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState<string | null>(null)

    useEffect(() => {
        const getData = async () => {
            setLoading(true)
            try {
                const docRef = doc(FirebaseDB, "users", "1")
                const docSnap = await getDoc(docRef)
                if (docSnap.exists()) {
                    setData(docSnap.data() as {firstName?: string, lastName?: string})
                } else {
                    setError("No such document!")
                }
            } catch (error) {
                console.error('Error fetching document:', error)
                setError("Error fetching data")
            } finally {
                setLoading(false)
            }
        }
        getData()
    }, [])

    if (loading) return <div>Loading...</div>
    if (error) return <div>Error: {error}</div>

    return (
        <div className="p-4 bg-white rounded shadow">
            <h2 className="text-lg font-semibold mb-2">Firestore Data Example</h2>
            {data?.firstName && data?.lastName ? (
                <div className="text-gray-700">
                    {data.firstName} {data.lastName}
                </div>
            ) : (
                <div className="text-gray-500">No user data available</div>
            )}
        </div>
    )
}

export default FirestoreExample
