'use client';

import { forwardRef, ButtonHTMLAttributes, ReactNode, useState } from 'react';

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
    variant?: 'primary' | 'secondary' | 'danger' | 'ghost';
    size?: 'sm' | 'md' | 'lg';
    loading?: boolean;
    icon?: ReactNode;
    children: ReactNode;
}

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
    ({ variant = 'primary', size = 'md', loading, icon, children, disabled, className = '', ...props }, ref) => {
        const baseStyles = 'inline-flex items-center justify-center font-medium rounded-lg transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed';

        const variants = {
            primary: 'bg-gradient-to-r from-primary-600 to-primary-500 hover:from-primary-500 hover:to-primary-400 text-white shadow-lg shadow-primary-500/25 hover:shadow-primary-500/40',
            secondary: 'bg-slate-700 hover:bg-slate-600 text-white',
            danger: 'bg-gradient-to-r from-red-600 to-red-500 hover:from-red-500 hover:to-red-400 text-white shadow-lg shadow-red-500/25',
            ghost: 'bg-transparent hover:bg-slate-700 text-slate-300 hover:text-white',
        };

        const sizes = {
            sm: 'py-1.5 px-3 text-sm gap-1.5',
            md: 'py-2.5 px-5 gap-2',
            lg: 'py-3 px-6 text-lg gap-2.5',
        };

        return (
            <button
                ref={ref}
                disabled={disabled || loading}
                className={`${baseStyles} ${variants[variant]} ${sizes[size]} ${className}`}
                {...props}
            >
                {loading ? (
                    <>
                        <LoadingSpinner size={size} />
                        <span>Đang xử lý...</span>
                    </>
                ) : (
                    <>
                        {icon}
                        {children}
                    </>
                )}
            </button>
        );
    }
);

Button.displayName = 'Button';

// Loading Spinner for buttons
function LoadingSpinner({ size }: { size: 'sm' | 'md' | 'lg' }) {
    const sizeClasses = {
        sm: 'w-3 h-3 border',
        md: 'w-4 h-4 border-2',
        lg: 'w-5 h-5 border-2',
    };

    return (
        <div className={`${sizeClasses[size]} border-white/30 border-t-white rounded-full animate-spin`} />
    );
}

// Icon Button (for edit, delete, etc.)
interface IconButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
    variant?: 'default' | 'danger' | 'success';
    size?: 'sm' | 'md' | 'lg';
    loading?: boolean;
    icon: ReactNode;
    tooltip?: string;
}

export function IconButton({
    variant = 'default',
    size = 'md',
    loading,
    icon,
    tooltip,
    disabled,
    className = '',
    ...props
}: IconButtonProps) {
    const variants = {
        default: 'hover:bg-slate-700 text-slate-400 hover:text-white',
        danger: 'hover:bg-red-500/20 text-red-400 hover:text-red-300',
        success: 'hover:bg-green-500/20 text-green-400 hover:text-green-300',
    };

    const sizes = {
        sm: 'p-1.5',
        md: 'p-2',
        lg: 'p-3',
    };

    const iconSizes = {
        sm: 'w-3.5 h-3.5',
        md: 'w-4 h-4',
        lg: 'w-5 h-5',
    };

    return (
        <button
            disabled={disabled || loading}
            className={`rounded-lg transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed ${variants[variant]} ${sizes[size]} ${className}`}
            title={tooltip}
            {...props}
        >
            {loading ? (
                <div className={`${iconSizes[size]} border-2 border-current/30 border-t-current rounded-full animate-spin`} />
            ) : (
                <span className={iconSizes[size]}>{icon}</span>
            )}
        </button>
    );
}

// Submit Button with loading state
export function SubmitButton({
    loading,
    children,
    loadingText = 'Đang xử lý...',
    ...props
}: ButtonHTMLAttributes<HTMLButtonElement> & {
    loading?: boolean;
    loadingText?: string;
}) {
    return (
        <button
            type="submit"
            disabled={loading}
            className="btn-primary flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
            {...props}
        >
            {loading ? (
                <>
                    <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    <span>{loadingText}</span>
                </>
            ) : (
                children
            )}
        </button>
    );
}

// Delete Button with confirmation loading
export function DeleteButton({
    onDelete,
    confirmMessage = 'Bạn có chắc muốn xóa?',
    children,
    ...props
}: ButtonHTMLAttributes<HTMLButtonElement> & {
    onDelete: () => Promise<void>;
    confirmMessage?: string;
}) {
    const [loading, setLoading] = useState(false);

    const handleClick = async () => {
        if (!confirm(confirmMessage)) return;
        setLoading(true);
        try {
            await onDelete();
        } finally {
            setLoading(false);
        }
    };

    return (
        <button
            onClick={handleClick}
            disabled={loading}
            className="p-2 hover:bg-red-500/20 rounded-lg transition-colors disabled:opacity-50"
            {...props}
        >
            {loading ? (
                <div className="w-4 h-4 border-2 border-red-400/30 border-t-red-400 rounded-full animate-spin" />
            ) : (
                children
            )}
        </button>
    );
}



// Action Button with loading (for table actions)
export function ActionButton({
    onClick,
    loading: externalLoading,
    icon,
    variant = 'default',
    tooltip,
}: {
    onClick: () => Promise<void> | void;
    loading?: boolean;
    icon: ReactNode;
    variant?: 'default' | 'danger' | 'success';
    tooltip?: string;
}) {
    const [internalLoading, setInternalLoading] = useState(false);
    const isLoading = externalLoading ?? internalLoading;

    const handleClick = async () => {
        setInternalLoading(true);
        try {
            await onClick();
        } finally {
            setInternalLoading(false);
        }
    };

    const variants = {
        default: 'hover:bg-slate-700 text-slate-400 hover:text-white',
        danger: 'hover:bg-red-500/20 text-red-400',
        success: 'hover:bg-green-500/20 text-green-400',
    };

    return (
        <button
            onClick={handleClick}
            disabled={isLoading}
            className={`p-2 rounded-lg transition-all duration-200 disabled:opacity-50 ${variants[variant]}`}
            title={tooltip}
        >
            {isLoading ? (
                <div className="w-4 h-4 border-2 border-current/30 border-t-current rounded-full animate-spin" />
            ) : (
                icon
            )}
        </button>
    );
}
