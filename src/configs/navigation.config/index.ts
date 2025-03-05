import {
    NAV_ITEM_TYPE_ITEM,
    NAV_ITEM_TYPE_COLLAPSE,
} from '@/constants/navigation.constant'

import type { NavigationTree } from '@/@types/navigation'

const navigationConfig: NavigationTree[] = [
    {
        key: 'home',
        path: '/home',
        title: 'Inicio',
        translateKey: 'nav.home',
        icon: 'home',
        type: NAV_ITEM_TYPE_ITEM,
        authority: [],
        subMenu: [],
    },
    {
        key: 'admin',
        path: '',
        title: 'Administração',
        translateKey: 'nav.admin',
        icon: 'shield',
        type: NAV_ITEM_TYPE_COLLAPSE,
        authority: ['admin'],
        subMenu: [
            {
                key: 'admin.authorizedEmails',
                path: '/admin/authorized-emails',
                title: 'Emails Autorizados',
                translateKey: 'nav.admin.authorizedEmails',
                icon: 'email',
                type: NAV_ITEM_TYPE_ITEM,
                authority: ['admin'],
                subMenu: [],
            },
            {
                key: 'admin.users',
                path: '/admin/users',
                title: 'Administradores (Legado)',
                translateKey: 'nav.admin.users',
                icon: 'shield-user',
                type: NAV_ITEM_TYPE_ITEM,
                authority: ['admin'],
                subMenu: [],
            },
            {
                key: 'admin.manage-administrators',
                path: '/admin/manage-administrators',
                title: 'Firebase Admins',
                translateKey: 'nav.admin.manageAdministrators',
                icon: 'shield-user',
                type: NAV_ITEM_TYPE_ITEM,
                authority: ['admin'],
                subMenu: [],
            },
        ],
    },
]

export default navigationConfig
