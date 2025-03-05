import Button from '@/components/ui/Button'
import { useAuth } from '@/auth'
import { apiGoogleOauthSignIn } from '@/services/OAuthServices'

const OauthSignIn = () => {
    const { oAuthSignIn } = useAuth()

    const handleGoogleSignIn = async () => {
        oAuthSignIn(async ({redirect, onSignIn}) => {
            try {
                const resp = await apiGoogleOauthSignIn()
                if (resp) {
                    const { token, user } = resp
                    onSignIn({accessToken: token}, user)
                    redirect()
                }
            } catch (error) {
                console.error(error)
            }
        })
    }

    return (
        <Button className="flex-1" onClick={handleGoogleSignIn} type="button">
            <div className="flex items-center justify-center gap-2">
                <span>Sign in with Google</span>
            </div>
        </Button>
    )
}

export default OauthSignIn
