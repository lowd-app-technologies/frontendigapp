import React, { useEffect, useState } from 'react'
import fetchProductApplication from '@/services/fetchProductApplication'

const CollapseMenuItemView1 = () => {
    const [aplicacao, setAplicacao] = useState<string | null>(null)

    useEffect(() => {
        fetchProductApplication().then((APLICACAO) => {
            if (APLICACAO.length > 0) {
                setAplicacao(APLICACAO[0])
            }
        })
    }, [])

    return (
        <div>
            {aplicacao && <p>{aplicacao}</p>}
        </div>
    )
}

export default CollapseMenuItemView1