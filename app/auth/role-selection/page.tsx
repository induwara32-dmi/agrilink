import Link from 'next/link';
import { ArrowRight, ShoppingBag, Sprout, Truck } from 'lucide-react';
import { AuthShell } from '@/components/features/auth/auth-shell';
import { RoleOption } from '@/components/features/auth/role-option';
import { Button } from '@/components/ui/button';

const roles = [
  { title: 'Buyer', description: 'Browse listings, request orders, and manage purchasing workflows.', icon: <ShoppingBag className="h-5 w-5" /> },
  { title: 'Farmer', description: 'List produce, manage availability, and build reliable buyer relationships.', icon: <Sprout className="h-5 w-5" /> },
  { title: 'Transporter', description: 'Accept delivery jobs, coordinate routes, and update shipment progress.', icon: <Truck className="h-5 w-5" /> },
];

export default function RoleSelectionPage() {
  return (
    <AuthShell
      title="Choose your role"
      description="Select the role that best represents how you will participate in AgriLink."
      footer={
        <p>
          Need a different role?{' '}
          <Link href="/auth/create-account" className="font-semibold text-primary">
            Go back
          </Link>
        </p>
      }
    >
      <div className="space-y-3">
        {roles.map((role, index) => (
          <div key={role.title} className="cursor-pointer">
            <RoleOption title={role.title} description={role.description} icon={role.icon} selected={index === 1} />
          </div>
        ))}
        <Button size="lg" className="w-full" asChild>
          <Link href="/auth/email-verification-success">
            Continue <ArrowRight className="h-4 w-4" />
          </Link>
        </Button>
      </div>
    </AuthShell>
  );
}
