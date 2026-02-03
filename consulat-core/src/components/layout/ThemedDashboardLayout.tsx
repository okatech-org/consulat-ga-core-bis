import React from 'react';
import { Outlet } from 'react-router-dom';
import { useThemeStyle } from '@/context/ThemeStyleContext';
import DashboardLayout from '@/layouts/DashboardLayout';
import UserSpaceLayout from '@/components/layout/UserSpaceLayout';

interface ThemedDashboardLayoutProps {
    children?: React.ReactNode;
    userType?: 'citizen' | 'foreigner' | 'admin';
}

/**
 * A wrapper component that switches between different dashboard layouts
 * based on the selected user space theme.
 */
export default function ThemedDashboardLayout({
    children,
    userType = 'citizen'
}: ThemedDashboardLayoutProps) {
    const { userSpaceTheme } = useThemeStyle();

    // IDN theme uses the glassmorphism UserSpaceLayout
    if (userSpaceTheme === 'idn') {
        return (
            <UserSpaceLayout userType={userType}>
                {children || <Outlet />}
            </UserSpaceLayout>
        );
    }

    // Classic and Minimal themes use the standard DashboardLayout
    // (Minimal theme applies different styling via CSS classes on body)
    return (
        <DashboardLayout>
            {children || <Outlet />}
        </DashboardLayout>
    );
}
