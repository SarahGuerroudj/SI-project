import React from 'react';

export interface NavItem {
    id: string;
    name: string;
    path?: string;
    icon: React.ReactNode;
    type?: 'resources';
}
