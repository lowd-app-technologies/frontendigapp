import { lazy } from 'react'
import authRoute from './authRoute'
import othersRoute from './othersRoute'
import type { Routes } from '@/@types/routes'

export const publicRoutes: Routes = [...authRoute]

export const protectedRoutes: Routes = [
    {
        key: 'home',
        path: '/home',
        component: lazy(() => import('@/views/instagram/CloseFriends')),
        authority: [],
    },
    {
        key: 'debug.firestore',
        path: '/debug/firestore',
        component: lazy(() => import('@/views/debug/FirestoreDebug')),
        authority: ['admin'],
    },
    {
        key: 'admin.authorizedEmails',
        path: '/admin/authorized-emails',
        component: lazy(() => import('@/views/admin/AuthorizedEmails')),
        authority: ['admin'],
    },
    {
        key: 'admin.users',
        path: '/admin/users',
        component: lazy(() => import('@/views/admin/AdminUsers')),
        authority: ['admin'],
    },
    {
        key: 'admin.manage-administrators',
        path: '/admin/manage-administrators',
        component: lazy(() => import('@/views/admin/ManageAdministrators')),
        authority: ['admin'],
    },
    
    ...othersRoute,
]
