import * as React from 'react';
import { LucideIcon, Package, Search, ShoppingCart, FileX, Users, AlertCircle } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Button } from './button';

type EmptyStateVariant = 'default' | 'products' | 'search' | 'cart' | 'orders' | 'users' | 'error';

interface EmptyStateProps {
  variant?: EmptyStateVariant;
  icon?: LucideIcon;
  title: string;
  description?: string;
  action?: {
    label: string;
    onClick?: () => void;
    href?: string;
  };
  secondaryAction?: {
    label: string;
    onClick?: () => void;
    href?: string;
  };
  className?: string;
}

const variantIcons: Record<EmptyStateVariant, LucideIcon> = {
  default: FileX,
  products: Package,
  search: Search,
  cart: ShoppingCart,
  orders: Package,
  users: Users,
  error: AlertCircle,
};

export function EmptyState({
  variant = 'default',
  icon,
  title,
  description,
  action,
  secondaryAction,
  className,
}: EmptyStateProps) {
  const Icon = icon || variantIcons[variant];

  return (
    <div
      className={cn(
        'flex flex-col items-center justify-center py-16 px-4 text-center animate-fade-in',
        className
      )}
    >
      <div className="relative mb-6">
        <div className="absolute inset-0 bg-primary/10 rounded-full blur-xl scale-150" />
        <div className="relative h-20 w-20 rounded-full bg-muted flex items-center justify-center">
          <Icon className="h-10 w-10 text-muted-foreground" />
        </div>
      </div>
      
      <h3 className="text-xl font-semibold mb-2">{title}</h3>
      
      {description && (
        <p className="text-muted-foreground max-w-sm mb-6">{description}</p>
      )}
      
      {(action || secondaryAction) && (
        <div className="flex flex-col sm:flex-row items-center gap-3">
          {action && (
            action.href ? (
              <Button asChild>
                <a href={action.href}>{action.label}</a>
              </Button>
            ) : (
              <Button onClick={action.onClick}>{action.label}</Button>
            )
          )}
          {secondaryAction && (
            secondaryAction.href ? (
              <Button variant="outline" asChild>
                <a href={secondaryAction.href}>{secondaryAction.label}</a>
              </Button>
            ) : (
              <Button variant="outline" onClick={secondaryAction.onClick}>
                {secondaryAction.label}
              </Button>
            )
          )}
        </div>
      )}
    </div>
  );
}
