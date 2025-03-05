import React, { useState, useEffect } from 'react';
import { 
    Button, 
    Input, 
    Card, 
    Alert, 
    Table, 
    Dialog, 
    Select, 
    Notification, 
    toast,
    Spinner
} from '@/components/ui';
import useFirebaseAuth from '@/hooks/useFirebaseAuth';
import { ADMIN_EMAILS, AUTHORIZED_EMAILS } from '@/configs/authorized-emails';
import { initializeAdminConfig, syncAdminUsersCollection } from '@/services/firebase/FirebaseAdminService';
// Definir a interface para as opções do select
interface SelectOption {
    value: string;
    label: string;
}
import { 
    getAllAdministrators, 
    addAdministrator, 
    updateAdministrator, 
    removeAdministrator,
    deactivateAdministrator,
    activateAdministrator,
    Administrator
} from '@/services/firebase/AdminService';
import { HiPlusCircle, HiTrash, HiPencil, HiX, HiCheck } from 'react-icons/hi';
import type { Meta } from '@/@types/routes';

// Roles disponíveis no sistema
const ADMIN_ROLES: SelectOption[] = [
    { value: 'admin', label: 'Administrador' },
    { value: 'manager', label: 'Gerente' },
    { value: 'user', label: 'Usuário Avançado' }
];

interface EditDialogProps {
    open: boolean;
    admin: Partial<Administrator> | null;
    onClose: () => void;
    onSubmit: (admin: Partial<Administrator>) => void;
    isAdd: boolean;
}

// Componente do diálogo de edição/adição
const EditDialog = ({ open, admin, onClose, onSubmit, isAdd }: EditDialogProps) => {
    const [formData, setFormData] = useState<Partial<Administrator>>({
        email: '',
        name: '',
        role: 'user',
        isActive: true
    });

    // Atualiza o formulário quando o admin mudar
    useEffect(() => {
        if (admin) {
            setFormData(admin);
        } else {
            setFormData({
                email: '',
                name: '',
                role: 'user',
                isActive: true
            });
        }
    }, [admin]);

    const handleChange = (name: string, value: any) => {
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleSubmit = () => {
        onSubmit(formData);
    };

    return (
        <Dialog isOpen={open} onClose={onClose} width={500}>
            <h5 className="mb-4">{isAdd ? 'Adicionar' : 'Editar'} Administrador</h5>
            
            <div className="space-y-4">
                <div>
                    <label className="form-label">Email</label>
                    <Input
                        type="email"
                        value={formData.email || ''}
                        onChange={e => handleChange('email', e.target.value)}
                        placeholder="email@exemplo.com"
                        disabled={!isAdd} // Não permite editar email de um admin existente
                    />
                </div>
                
                <div>
                    <label className="form-label">Nome</label>
                    <Input
                        value={formData.name || ''}
                        onChange={e => handleChange('name', e.target.value)}
                        placeholder="Nome completo"
                    />
                </div>
                
                <div>
                    <label className="form-label">Função</label>
                    <Select
                        options={ADMIN_ROLES}
                        value={formData.role || 'user'}
                        onChange={(value) => handleChange('role', value)}
                    />
                </div>
                
                <div className="flex justify-between mt-6">
                    <Button variant="plain" onClick={onClose}>
                        Cancelar
                    </Button>
                    <Button variant="solid" onClick={handleSubmit}>
                        {isAdd ? 'Adicionar' : 'Salvar'}
                    </Button>
                </div>
            </div>
        </Dialog>
    );
};

// Componente principal
const ManageAdministrators = <T extends Meta>(_props: T) => {
    const [administrators, setAdministrators] = useState<Administrator[]>([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');
    
    // Estado para diálogo
    const [dialogOpen, setDialogOpen] = useState(false);
    const [currentAdmin, setCurrentAdmin] = useState<Partial<Administrator> | null>(null);
    const [isAddMode, setIsAddMode] = useState(true);
    
    // Hook personalizado para autentiçação do Firebase
    const { currentUser, loading: authLoading, isAdmin, error: authError } = useFirebaseAuth();

    // Carrega a lista de administradores
    const loadAdministrators = async () => {
        // Se ainda está carregando a autenticação, esperar
        if (authLoading) return;
        
        setLoading(true);
        try {
            // Verificar se o usuário está autenticado e é administrador
            if (!currentUser) {
                setError('Você precisa estar autenticado para acessar esta página');
                setAdministrators([]);
                return;
            }
            
            if (!isAdmin) {
                setError('Você não tem permissões de administrador para acessar esta funcionalidade.');
                setAdministrators([]);
                return;
            }
            
            try {
                // Tentamos inicializar, mas não tratamos eventuais erros aqui
                await initializeAdminConfig();
                await syncAdminUsersCollection();
            } catch (initError) {
                console.warn('Problemas ao inicializar configurações de admin, mas continuando...', initError);
            }
            
            // Obtemos os administradores independentemente de erros anteriores
            const admins = await getAllAdministrators();
            setAdministrators(admins);
            setError('');
        } catch (err: any) {
            console.error('Erro ao carregar administradores:', err);
            
            if (err.message?.includes('permission')) {
                // Se for erro de permissão, tentamos exibir os administradores locais
                try {
                    console.log('Tentando obter administradores localmente após erro de permissão');
                    const admins = await getAllAdministrators();
                    setAdministrators(admins);
                    setError('');
                    return;
                } catch (localError) {
                    console.error('Falha ao obter administradores localmente:', localError);
                }
                
                setError('Permissão insuficiente. Você não tem acesso a esta funcionalidade.');
            } else {
                setError('Erro ao carregar lista de administradores: ' + (err.message || 'Erro desconhecido'));
            }
        } finally {
            setLoading(false);
        }
    };

    // Carrega administradores ao montar o componente
    useEffect(() => {
        if (!authLoading) {
            loadAdministrators();
        }
    }, [authLoading, currentUser, isAdmin]);

    // Função para abrir o diálogo em modo de adição
    const handleAddClick = () => {
        setCurrentAdmin(null);
        setIsAddMode(true);
        setDialogOpen(true);
    };

    // Função para abrir o diálogo em modo de edição
    const handleEditClick = (admin: Administrator) => {
        setCurrentAdmin(admin);
        setIsAddMode(false);
        setDialogOpen(true);
    };

    // Adiciona ou atualiza um administrador
    const handleSubmitAdmin = async (adminData: Partial<Administrator>) => {
        setLoading(true);
        try {
            if (isAddMode) {
                // Validações
                if (!adminData.email) throw new Error('Email é obrigatório');
                if (!adminData.name) throw new Error('Nome é obrigatório');
                if (!adminData.role) throw new Error('Função é obrigatória');
                
                // Verificar se o email está autorizado
                if (!AUTHORIZED_EMAILS.includes(adminData.email.toLowerCase())) {
                    throw new Error(`O email ${adminData.email} não está na lista de emails autorizados.`);
                }
                
                // Adicionar
                await addAdministrator(adminData as Omit<Administrator, 'createdAt'>);
                toast.push(
                    <Notification title="Sucesso" type="success">
                        Administrador adicionado com sucesso
                    </Notification>
                );
            } else {
                // Editar
                if (!currentAdmin?.email) return;
                await updateAdministrator(currentAdmin.email, adminData);
                toast.push(
                    <Notification title="Sucesso" type="success">
                        Administrador atualizado com sucesso
                    </Notification>
                );
            }
            
            // Recarregar lista e fechar diálogo
            await loadAdministrators();
            setDialogOpen(false);
        } catch (err: any) {
            const errorMessage = err.message || 'Ocorreu um erro ao processar a solicitação';
            setError(errorMessage);
            toast.push(
                <Notification title="Erro" type="danger">
                    {errorMessage}
                </Notification>
            );
        } finally {
            setLoading(false);
        }
    };

    // Remove um administrador
    const handleRemoveAdmin = async (admin: Administrator) => {
        if (!window.confirm(`Tem certeza que deseja remover ${admin.name || admin.email}?`)) {
            return;
        }
        
        setLoading(true);
        try {
            await removeAdministrator(admin.email);
            toast.push(
                <Notification title="Sucesso" type="success">
                    Administrador removido com sucesso
                </Notification>
            );
            await loadAdministrators();
        } catch (err) {
            setError('Erro ao remover administrador');
            toast.push(
                <Notification title="Erro" type="danger">
                    Erro ao remover administrador
                </Notification>
            );
        } finally {
            setLoading(false);
        }
    };

    // Altera o status de ativação do administrador
    const handleToggleActive = async (admin: Administrator) => {
        setLoading(true);
        try {
            if (admin.isActive) {
                await deactivateAdministrator(admin.email);
                toast.push(
                    <Notification title="Sucesso" type="success">
                        Administrador desativado
                    </Notification>
                );
            } else {
                await activateAdministrator(admin.email);
                toast.push(
                    <Notification title="Sucesso" type="success">
                        Administrador ativado
                    </Notification>
                );
            }
            await loadAdministrators();
        } catch (err) {
            setError(`Erro ao ${admin.isActive ? 'desativar' : 'ativar'} administrador`);
        } finally {
            setLoading(false);
        }
    };

    // Colunas da tabela
    const columns = [
        {
            key: 'name',
            title: 'Nome',
            render: (admin: Administrator) => (
                <div>
                    <div>{admin.name || 'N/A'}</div>
                    <div className="text-xs text-gray-500">{admin.email}</div>
                </div>
            )
        },
        {
            key: 'role',
            title: 'Função',
            render: (admin: Administrator) => {
                const role = ADMIN_ROLES.find(r => r.value === admin.role);
                return (
                    <span className="capitalize">
                        {role?.label || admin.role}
                    </span>
                );
            }
        },
        {
            key: 'status',
            title: 'Status',
            render: (admin: Administrator) => (
                <span
                    className={`${
                        admin.isActive ? 'text-emerald-500' : 'text-red-500'
                    } font-semibold`}
                >
                    {admin.isActive ? 'Ativo' : 'Inativo'}
                </span>
            )
        },
        {
            key: 'actions',
            title: 'Ações',
            render: (admin: Administrator) => (
                <div className="flex items-center space-x-3">
                    <Button 
                        size="xs" 
                        variant="plain" 
                        icon={<HiPencil />} 
                        onClick={() => handleEditClick(admin)}
                    />
                    <Button 
                        size="xs" 
                        variant="plain" 
                        icon={admin.isActive ? <HiX /> : <HiCheck />} 
                        onClick={() => handleToggleActive(admin)}
                    />
                    <Button 
                        size="xs" 
                        variant="plain" 
                        icon={<HiTrash />} 
                        onClick={() => handleRemoveAdmin(admin)}
                    />
                </div>
            )
        }
    ];

    return (
        <div className="container mx-auto p-4">
            {authLoading && (
                <div className="flex justify-center items-center h-40">
                    <Spinner size="40px" />
                    <span className="ml-2">Verificando autenticação...</span>
                </div>
            )}
            
            {!authLoading && !currentUser && (
                <Alert type="warning" showIcon className="mb-4">
                    <h5 className="mb-2">Autenticação Necessária</h5>
                    <p>Você precisa estar autenticado para acessar esta página.</p>
                </Alert>
            )}
            
            {!authLoading && currentUser && (
                <Alert type={isAdmin ? "success" : "danger"} showIcon className="mb-4">
                    <h5 className="mb-2">{isAdmin ? "Usuário Autenticado (Admin)" : "Acesso Restrito"}</h5>
                    <p><strong>Email:</strong> {currentUser.email}</p>
                    <p><strong>UID:</strong> {currentUser.uid}</p>
                    <p><strong>Admin:</strong> {isAdmin ? "Sim" : "Não"}</p>
                    <p><strong>Email verificado:</strong> {currentUser.emailVerified ? "Sim" : "Não"}</p>
                    <p className="mt-2"><strong>Lista de administradores:</strong></p>
                    <ul className="list-disc ml-5 mt-1">
                        {ADMIN_EMAILS.map((email, index) => (
                            <li key={index} className={email === currentUser.email ? "font-bold" : ""}>
                                {email} {email === currentUser.email && "(você)"}
                            </li>
                        ))}
                    </ul>
                    
                    {!isAdmin && (
                        <p className="mt-2 text-red-500">Seu email não está na lista de administradores autorizados.</p>
                    )}
                </Alert>
            )}
            
            {isAdmin && (
                <Alert type="info" showIcon className="mb-4">
                    <h5 className="mb-2">Modo de Operação Temporário</h5>
                    <p>
                        Devido a um problema com as regras de segurança do Firestore, esta página está operando em um modo alternativo.
                        As alterações que você fizer aqui são temporárias e não serão salvas no Firebase.
                    </p>
                    <p className="mt-2">
                        <strong>Para adicionar um administrador permanentemente:</strong>
                    </p>
                    <ol className="list-decimal ml-5">
                        <li>Abra o arquivo <code>src/configs/authorized-emails.ts</code></li>
                        <li>Adicione o email à lista <code>ADMIN_EMAILS</code></li>
                        <li>Adicione o mesmo email à lista <code>AUTHORIZED_EMAILS</code> se ainda não estiver presente</li>
                        <li>Salve o arquivo e reinicie o servidor</li>
                    </ol>
                </Alert>
            )}
            
            {error && error.includes('Permissão insuficiente') && (
                <Alert type="danger" showIcon className="mb-4">
                    <h5 className="mb-2">Erro de Permissão</h5>
                    <p>Você não tem permissão para acessar esta página.</p>
                    <p className="mt-2">Este problema pode ser causado por:</p>
                    <ul className="list-disc ml-5 mt-1">
                        <li>Você não está logado com um usuário administrador</li>
                        <li>Seu email não está na lista de administradores autorizados</li>
                        <li>As regras de segurança do Firebase não permitem esta operação</li>
                    </ul>
                    <p className="mt-2">Por favor, utilize o endpoint legado (Administradores) para gerenciar administradores.</p>
                </Alert>
            )}
            <Card className="mb-4">
                <div className="flex justify-between items-center mb-6">
                    <div>
                        <h4 className="mb-2">Gerenciar Administradores</h4>
                        <p className="text-gray-500">
                            Adicione, edite ou remova administradores do sistema
                        </p>
                    </div>
                    <Button 
                        variant="solid" 
                        icon={<HiPlusCircle />} 
                        onClick={handleAddClick}
                    >
                        Adicionar Administrador
                    </Button>
                </div>

                {error && (
                    <Alert type="danger" showIcon className="mb-4">
                        {error}
                    </Alert>
                )}

                {success && (
                    <Alert type="success" showIcon className="mb-4">
                        {success}
                    </Alert>
                )}

                <Table
                    columns={columns}
                    data={administrators}
                    loading={loading}
                />
                
                <div className="mt-6 pt-4 border-t border-gray-200">
                    <h5 className="mb-2">Observações:</h5>
                    <ul className="list-disc pl-5 text-sm text-gray-600">
                        <li className="mb-1">
                            Administradores inativos não possuem acesso às funcionalidades administrativas.
                        </li>
                        <li className="mb-1">
                            Diferentes funções têm diferentes níveis de permissão no sistema.
                        </li>
                    </ul>
                </div>
            </Card>

            {/* Diálogo para adicionar/editar administrador */}
            <EditDialog 
                open={dialogOpen}
                admin={currentAdmin}
                onClose={() => setDialogOpen(false)}
                onSubmit={handleSubmitAdmin}
                isAdd={isAddMode}
            />
        </div>
    );
};

export default ManageAdministrators;
