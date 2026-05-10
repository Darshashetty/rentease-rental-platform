import { Link } from 'react-router-dom';
import {
  ArrowRight,
  Home as HomeIcon,
  Search,
  Shield,
  Clock,
  Heart,
  Mail,
} from 'lucide-react';
import { Button } from '../components/ui/Button';
import { Card } from '../components/ui/Card';
import { useAuth } from '../hooks/useAuth';

const Home = () => {
  const { isAuthenticated } = useAuth();

  const features = [
    {
      icon: HomeIcon,
      title: 'Property listings',
      description: 'Create and manage rental listings with pricing, photos, and availability details.',
    },
    {
      icon: Search,
      title: 'Search and filters',
      description: 'Filter listings by location, price range, property type, and availability.',
    },
    {
      icon: Clock,
      title: 'Booking workflow',
      description: 'Handle booking requests with pending, approved, rejected, and completed states.',
    },
    {
      icon: Shield,
      title: 'Authentication',
      description: 'JWT-based login with protected routes and role-based access control.',
    },
    {
      icon: Heart,
      title: 'Saved properties',
      description: 'Allow users to save properties they want to revisit later.',
    },
    { icon: Mail, title: 'Email notifications', description: 'Send booking and password reset emails from the backend.' },
  ];

  return (
    <div className="min-h-screen bg-slate-50">
      <section className="px-4 py-16 sm:px-6 lg:px-8">
        <div className="mx-auto grid max-w-6xl gap-10 lg:grid-cols-[1.3fr_0.9fr] lg:items-center">
          <div className="space-y-6">
            <p className="text-sm font-medium uppercase tracking-[0.2em] text-slate-500">RentEase</p>
            <h1 className="max-w-2xl text-4xl font-semibold tracking-tight text-slate-900 sm:text-5xl">
              Rental listings, booking requests, and account management in one app.
            </h1>
            <p className="max-w-2xl text-base leading-7 text-slate-600">
              RentEase is a student-built MERN project for managing property listings, booking requests, saved properties, and admin review flows.
            </p>

            <div className="flex flex-col gap-3 sm:flex-row">
              <Link to="/products">
                <Button variant="primary" size="lg" className="inline-flex items-center gap-2">
                  Browse listings
                  <ArrowRight size={18} />
                </Button>
              </Link>
              {!isAuthenticated ? (
                <Link to="/register">
                  <Button variant="outline" size="lg">Create account</Button>
                </Link>
              ) : (
                <Link to="/dashboard">
                  <Button variant="outline" size="lg">Open dashboard</Button>
                </Link>
              )}
            </div>
          </div>

          <Card className="overflow-hidden border-slate-200 bg-white shadow-sm">
            <div className="border-b border-slate-200 px-6 py-4">
              <p className="text-sm font-medium text-slate-900">What the app covers</p>
            </div>
            <div className="grid gap-4 p-6 sm:grid-cols-2">
              {features.map((feature) => {
                const Icon = feature.icon;
                return (
                  <div key={feature.title} className="rounded-xl border border-slate-200 bg-slate-50 p-4">
                    <div className="mb-3 flex h-10 w-10 items-center justify-center rounded-lg bg-white text-blue-600 shadow-sm">
                      <Icon size={20} />
                    </div>
                    <h2 className="text-sm font-semibold text-slate-900">{feature.title}</h2>
                    <p className="mt-1 text-sm leading-6 text-slate-600">{feature.description}</p>
                  </div>
                );
              })}
            </div>
          </Card>
        </div>
      </section>

      <section className="px-4 pb-16 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-6xl">
          <div className="grid gap-4 md:grid-cols-3">
            {[
              'Tenant login, saved properties, and booking history',
              'Owner property management and booking review',
              'Admin dashboard for overview and moderation',
            ].map((item) => (
              <Card key={item} className="p-5">
                <p className="text-sm leading-6 text-slate-700">{item}</p>
              </Card>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
};

export default Home;
