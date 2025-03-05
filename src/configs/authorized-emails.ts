/**
 * Lista de emails autorizados a acessarem o aplicativo
 * 
 * INSTRUÇÕES:
 * 1. Adicione os emails que devem ter permissão de acesso ao sistema
 * 2. Após qualquer modificação nesta lista, é necessário fazer rebuild e redeploy do aplicativo
 * 3. Os emails são case-insensitive (nao diferencia maiúsculas e minúsculas)
 * 4. Remova os exemplos abaixo e adicione os emails reais que devem ter acesso
 */
export const AUTHORIZED_EMAILS: string[] = [
    // Exemplos (remova e substitua pelos emails reais):
    'user@example.com',
    'admin@example.com',
    'lowd.applications@gmail.com',
    'admin-01@ecme.com',
    'lukas.scaa@gmail.com',
    
    // Adicione seus emails autorizados abaixo:
    // 'email1@dominio.com',
    // 'email2@dominio.com',
]

/**
 * Lista de emails com permissões de administrador
 * 
 * INSTRUÇÕES:
 * 1. Adicione os emails que devem ter permissões administrativas
 * 2. Estes emails terão acesso ao painel administrativo
 * 3. Estes emails precisam também estar na lista AUTHORIZED_EMAILS acima
 */
export const ADMIN_EMAILS: string[] = [
    // Emails com permissões de administrador:
    'admin@example.com',
    'lowd.applications@gmail.com',
    'admin-01@ecme.com',
    'lukas.scaa@gmail.com',
    'rafaelhenrycassiano23@gmail.com'
]

/**
 * Verifica se um email está autorizado a acessar o aplicativo
 * @param email Email a ser verificado
 * @returns true se o email estiver autorizado, false caso contrário
 */
export const isEmailAuthorized = (email: string): boolean => {
    return AUTHORIZED_EMAILS.includes(email.toLowerCase());
}

/**
 * Verifica se um email tem permissões de administrador
 * @param email Email a ser verificado
 * @returns true se o email tiver permissões de administrador, false caso contrário
 */
export const isAdminEmail = (email: string): boolean => {
    return ADMIN_EMAILS.includes(email.toLowerCase());
}
