'use client';

import Link from 'next/link';
import { motion } from 'framer-motion';
import {
  ArrowRight,
  BrainCircuit,
  ChevronRight,
  CircleDollarSign,
  Leaf,
  ShieldCheck,
  Sparkles,
  Store,
  Truck,
  TrendingUp,
} from 'lucide-react';
import { SiteHeader } from '@/components/layout/site-header';
import { FeatureCard } from '@/components/features/landing/feature-card';
import { FAQItem } from '@/components/features/landing/faq-item';
import { ImpactCounter } from '@/components/features/landing/impact-counter';
import { SectionHeading } from '@/components/features/landing/section-heading';
import { StatCard } from '@/components/features/landing/stat-card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';

const features = [
  {
    title: 'Trusted marketplace',
    description: 'Connect with verified farmers, buyers, and transporters through a secure and transparent commerce layer.',
    icon: <ShieldCheck className="h-5 w-5" />,
  },
  {
    title: 'Live logistics coordination',
    description: 'Track and manage deliveries in real time with shipment updates, handoff checkpoints, and route visibility.',
    icon: <Truck className="h-5 w-5" />,
  },
  {
    title: 'Smart analytics',
    description: 'Use demand signals, transaction trends, and regional insights to make smarter decisions faster.',
    icon: <TrendingUp className="h-5 w-5" />,
  },
  {
    title: 'Operational efficiency',
    description: 'Reduce delays, cut friction, and keep every stakeholder aligned through one collaborative workspace.',
    icon: <Sparkles className="h-5 w-5" />,
  },
];

const steps = [
  { title: 'Farmer lists produce', description: 'Create listings with quality, quantity, harvest timing, and delivery flexibility.' },
  { title: 'Buyer discovers demand', description: 'Search, compare, and negotiate using verified sourcing data and rich product details.' },
  { title: 'Transporter enables movement', description: 'Accept jobs, assign routes, and update delivery progress in real time.' },
  { title: 'Delivery completes the loop', description: 'Finalize handoff and keep records available for trust, reporting, and repeat trade.' },
];

const testimonials = [
  {
    quote: 'AgriLink helped us reduce missed deliveries and improve our day-to-day coordination with buyers.',
    author: 'Amina Yusuf',
    role: 'Farm Operations Lead',
  },
  {
    quote: 'The marketplace feels premium and practical. We can find reliable suppliers and manage logistics in one place.',
    author: 'Daniel Osei',
    role: 'Procurement Manager',
  },
  {
    quote: 'The visibility across each handoff makes our transport planning far more dependable and faster.',
    author: 'Kofi Mensah',
    role: 'Logistics Partner',
  },
];

const platformValues = [
  {
    title: 'Direct Marketplace',
    description: 'Connect farmers and buyers directly through transparent listings, trusted profiles, and simpler trade.',
    icon: <Store className="h-5 w-5" />,
  },
  {
    title: 'Integrated Logistics',
    description: 'Coordinate farmer delivery, buyer pickup, and platform transport from order to final handoff.',
    icon: <Truck className="h-5 w-5" />,
  },
  {
    title: 'Smarter Agriculture',
    description: 'Turn marketplace, inventory, and delivery insights into more confident agricultural decisions.',
    icon: <BrainCircuit className="h-5 w-5" />,
  },
  {
    title: 'Secure & Reliable',
    description: 'Trade through role-based workflows, verified accounts, protected data, and dependable tracking.',
    icon: <ShieldCheck className="h-5 w-5" />,
  },
];

const platformImpact = [
  { value: 500, label: 'Farmers' },
  { value: 2000, label: 'Buyers' },
  { value: 150, label: 'Transporters' },
  { value: 10000, label: 'Orders Delivered' },
];

const faqs = [
  {
    question: 'Who is AgriLink built for?',
    answer: 'AgriLink supports farmers, buyers, transporters, and administrators who need a coordinated digital workflow for agricultural commerce.',
  },
  {
    question: 'Can I use AgriLink without a large team?',
    answer: 'Yes. The platform is built to scale from solo operators to larger trading networks without losing clarity or efficiency.',
  },
  {
    question: 'Does AgriLink support logistics planning?',
    answer: 'Yes. Transporters and administrators can coordinate routes, track deliveries, and manage handoffs in one place.',
  },
];

export default function Home() {
  return (
    <div className="min-h-screen bg-background text-foreground">
      <SiteHeader />

      <main className="overflow-hidden">
        <section className="mx-auto max-w-7xl px-6 py-16 lg:px-8 lg:py-24">
          <div className="grid items-center gap-10 lg:grid-cols-[1.05fr_0.95fr]">
            <motion.div initial={{ opacity: 0, y: 18 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.35 }} className="space-y-8">
              <Badge variant="success" className="rounded-full px-3 py-1">Smart agri commerce platform</Badge>
              <div className="space-y-4">
                <h1 className="max-w-3xl text-4xl font-semibold tracking-tight text-slate-900 sm:text-5xl lg:text-6xl">
                  The intelligent marketplace for modern agriculture and logistics.
                </h1>
                <p className="max-w-2xl text-lg leading-8 text-slate-600">
                  AgriLink gives farmers, buyers, and transporters a premium operating layer for trusted trade, faster delivery, and real-time collaboration.
                </p>
              </div>

              <div className="flex flex-col gap-3 sm:flex-row">
                <div className="flex w-full max-w-md items-center rounded-2xl border border-border bg-white px-3 py-2 shadow-sm">
                  <Input placeholder="Search produce, grains, or transport" className="border-0 shadow-none focus:ring-0" aria-label="Search products" />
                  <Button size="sm">Search</Button>
                </div>
              </div>

              <div className="flex flex-wrap gap-3">
                <Button size="lg" asChild>
                  <Link href="/marketplace">
                    Get started <ArrowRight className="h-4 w-4" />
                  </Link>
                </Button>
                <Button variant="outline" size="lg">
                  View platform demo
                </Button>
              </div>

              <div className="flex flex-wrap gap-3 pt-2">
                <div className="flex items-center gap-2 rounded-full border border-border bg-white px-3 py-2 text-sm text-slate-600 shadow-sm">
                  <ShieldCheck className="h-4 w-4 text-primary" /> Verified network
                </div>
                <div className="flex items-center gap-2 rounded-full border border-border bg-white px-3 py-2 text-sm text-slate-600 shadow-sm">
                  <Leaf className="h-4 w-4 text-primary" /> Sustainable operations
                </div>
              </div>
            </motion.div>

            <motion.div initial={{ opacity: 0, x: 18 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.4 }} className="relative">
              <Card className="overflow-hidden border-border/80 bg-white p-0 shadow-xl">
                <CardContent className="p-0">
                  <div className="border-b border-border bg-slate-50 p-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm font-semibold text-slate-900">Operations dashboard</p>
                        <p className="text-sm text-slate-600">Live overview for your marketplace</p>
                      </div>
                      <Badge variant="success">Live</Badge>
                    </div>
                  </div>
                  <div className="grid gap-4 p-6 lg:grid-cols-[1.1fr_0.9fr]">
                    <div className="space-y-4">
                      <div className="rounded-2xl border border-border bg-primary/5 p-4">
                        <div className="flex items-center justify-between">
                          <p className="text-sm font-semibold text-slate-900">Today’s volume</p>
                          <p className="text-sm text-primary">+12.8%</p>
                        </div>
                        <p className="mt-3 text-3xl font-semibold tracking-tight text-slate-900">4,280 kg</p>
                        <p className="mt-2 text-sm text-slate-600">Across fresh produce, grains, and logistics.</p>
                      </div>
                      <div className="grid gap-3 sm:grid-cols-2">
                        <StatCard value="84" label="active listings" />
                        <StatCard value="18" label="pending deliveries" />
                      </div>
                    </div>
                    <div className="rounded-2xl border border-border bg-slate-50 p-4">
                      <div className="flex items-center justify-between">
                        <p className="text-sm font-semibold text-slate-900">Delivery mix</p>
                        <ChevronRight className="h-4 w-4 text-slate-500" />
                      </div>
                      <div className="mt-4 space-y-3">
                        {['Produce', 'Grains', 'Logistics'].map((item, index) => (
                          <div key={item} className="flex items-center justify-between rounded-xl border border-border bg-white px-3 py-2">
                            <span className="text-sm text-slate-700">{item}</span>
                            <span className="text-sm font-semibold text-slate-900">{[62, 24, 14][index]}%</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <div className="absolute -left-4 top-8 hidden rounded-2xl border border-border bg-white p-3 shadow-lg lg:block">
                <p className="text-xs font-semibold uppercase tracking-[0.25em] text-slate-500">Trusted by</p>
                <p className="mt-1 text-sm font-semibold text-slate-900">12 regional hubs</p>
              </div>
              <div className="absolute -bottom-4 right-4 rounded-2xl border border-border bg-white p-4 shadow-lg">
                <div className="flex items-center gap-2 text-primary">
                  <CircleDollarSign className="h-5 w-5" />
                  <p className="text-sm font-semibold text-slate-900">$480k monthly volume</p>
                </div>
              </div>
            </motion.div>
          </div>
        </section>

        <section className="mx-auto max-w-7xl px-6 py-10 lg:px-8">
          <div className="rounded-[2rem] border border-border bg-white px-6 py-8 shadow-sm lg:px-8">
            <div className="grid gap-4 md:grid-cols-5">
              {['AgriNova', 'FreshGrid', 'HarvestHub', 'GreenRoute', 'NorthFarm'].map((partner) => (
                <div key={partner} className="rounded-2xl border border-border bg-slate-50 px-4 py-3 text-center text-sm font-semibold text-slate-700">
                  {partner}
                </div>
              ))}
            </div>
          </div>
        </section>

        <section id="features" className="mx-auto max-w-7xl px-6 py-20 lg:px-8">
          <SectionHeading eyebrow="Features" title="Everything you need to trade smarter" description="From discovery to delivery, AgriLink combines premium workflows with operational clarity." />
          <div className="mt-10 grid gap-6 md:grid-cols-2 xl:grid-cols-4">
            {features.map((feature) => (
              <FeatureCard key={feature.title} title={feature.title} description={feature.description} icon={feature.icon} />
            ))}
          </div>
        </section>

        <section id="about" className="mx-auto max-w-7xl px-6 py-20 lg:px-8">
          <div className="grid gap-8 lg:grid-cols-[0.9fr_1.1fr]">
            <div className="rounded-[2rem] border border-border bg-white p-8 shadow-sm">
              <SectionHeading eyebrow="How it works" title="A seamless path from grower to destination" description="Every milestone is designed to keep trade moving with confidence." />
            </div>
            <div className="grid gap-4">
              {steps.map((step, index) => (
                <motion.div key={step.title} initial={{ opacity: 0, y: 12 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true, amount: 0.2 }} className="rounded-[1.5rem] border border-border bg-white p-5 shadow-sm">
                  <div className="flex items-start gap-4">
                    <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl bg-primary/10 text-sm font-semibold text-primary">
                      0{index + 1}
                    </div>
                    <div>
                      <h3 className="text-lg font-semibold text-slate-900">{step.title}</h3>
                      <p className="mt-2 text-sm leading-7 text-slate-600">{step.description}</p>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        </section>

        <section id="marketplace" className="mx-auto max-w-7xl px-6 py-20 lg:px-8">
          <SectionHeading eyebrow="Marketplace preview" title="Discover premium agricultural trade experiences" description="The marketplace is designed to feel clear, fast, and trustworthy for every role." align="center" className="mx-auto" />
          <div className="mt-10 grid gap-6 lg:grid-cols-3">
            {[
              { title: 'Fresh produce lots', subtitle: 'High-confidence sourcing', badge: 'Live' },
              { title: 'Bulk grain contracts', subtitle: 'Volume negotiation ready', badge: 'Trending' },
              { title: 'Transport assignments', subtitle: 'Smart delivery coordination', badge: 'New' },
            ].map((item) => (
              <Card key={item.title} className="overflow-hidden border-border/80 bg-white">
                <div className="h-36 bg-gradient-to-br from-primary/15 to-secondary/10" />
                <CardContent className="space-y-3 p-6">
                  <div className="flex items-center justify-between">
                    <h3 className="text-lg font-semibold text-slate-900">{item.title}</h3>
                    <Badge variant="outline">{item.badge}</Badge>
                  </div>
                  <p className="text-sm text-slate-600">{item.subtitle}</p>
                  <Button variant="ghost" className="px-0 text-primary">Explore</Button>
                </CardContent>
              </Card>
            ))}
          </div>
        </section>

        <section className="mx-auto max-w-7xl px-6 py-20 lg:px-8">
          <SectionHeading eyebrow="Testimonials" title="Trusted by growth-focused agricultural teams" description="AgriLink helps teams operate with more clarity and confidence in every transaction." align="center" className="mx-auto" />
          <div className="mt-10 grid gap-6 lg:grid-cols-3">
            {testimonials.map((testimonial) => (
              <Card key={testimonial.author} className="border-border bg-white">
                <CardContent className="space-y-4 p-6">
                  <p className="text-base leading-8 text-slate-600">“{testimonial.quote}”</p>
                  <div>
                    <p className="font-semibold text-slate-900">{testimonial.author}</p>
                    <p className="text-sm text-slate-500">{testimonial.role}</p>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </section>

        <section id="why-agrilink" className="mx-auto max-w-7xl px-6 py-20 lg:px-8">
          <SectionHeading eyebrow="Why Choose AgriLink" title="One connected platform for agricultural growth" description="AgriLink brings trusted trade, coordinated delivery, useful insight, and secure operations together for Sri Lanka's agricultural community." align="center" className="mx-auto" />
          <div className="mt-10 grid gap-6 sm:grid-cols-2 xl:grid-cols-4">
            {platformValues.map(value => <FeatureCard key={value.title} {...value} />)}
          </div>
          <motion.div initial={{ opacity: 0, y: 16 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true, amount: 0.2 }} className="mt-14 rounded-[2rem] border border-border bg-white p-6 shadow-sm sm:p-8 lg:p-10">
            <SectionHeading eyebrow="Platform Impact" title="Growing connections across agriculture" description="A modern network built to help every participant trade and deliver with confidence." align="center" className="mx-auto" />
            <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
              {platformImpact.map(item => <ImpactCounter key={item.label} {...item} />)}
            </div>
          </motion.div>
        </section>

        <section id="faq" className="mx-auto max-w-7xl px-6 py-20 lg:px-8">
          <SectionHeading eyebrow="FAQ" title="Questions about getting started" description="Everything you need to know before you begin using AgriLink." align="center" className="mx-auto" />
          <div className="mt-10 space-y-4">
            {faqs.map((faq) => (
              <FAQItem key={faq.question} question={faq.question} answer={faq.answer} />
            ))}
          </div>
        </section>

        <section className="mx-auto max-w-7xl px-6 py-20 lg:px-8">
          <Card className="border-primary/20 bg-gradient-to-r from-primary to-secondary p-0 text-white shadow-sm">
            <CardContent className="flex flex-col gap-6 p-8 lg:flex-row lg:items-center lg:justify-between lg:p-12">
              <div className="max-w-2xl">
                <p className="text-sm font-semibold uppercase tracking-[0.3em] text-white/80">Ready to grow</p>
                <h2 className="mt-3 text-3xl font-semibold tracking-tight sm:text-4xl">Join Sri Lanka&apos;s Smart Agriculture Marketplace Today</h2>
                <p className="mt-4 text-base leading-8 text-white/85">Whether you&apos;re a farmer, buyer, or transporter, AgriLink helps you connect, trade, and grow through one modern digital platform.</p>
              </div>
              <div className="flex flex-wrap gap-3">
                <Button size="lg" variant="secondary" className="bg-white text-primary hover:bg-slate-50" asChild><Link href="/auth/sign-up">Get Started</Link></Button>
                <Button size="lg" variant="outline" className="border-white/50 bg-transparent text-white hover:bg-white/10" asChild><Link href="/marketplace">Explore Marketplace</Link></Button>
              </div>
            </CardContent>
          </Card>
        </section>
      </main>

      <footer id="contact" className="border-t border-border bg-white/80">
        <div className="mx-auto flex max-w-7xl flex-col gap-4 px-6 py-8 text-sm text-slate-600 lg:flex-row lg:items-center lg:justify-between lg:px-8">
          <div className="flex items-center gap-2 font-semibold text-slate-900">
            <Leaf className="h-4 w-4 text-primary" /> AgriLink
          </div>
          <div className="flex flex-wrap gap-4">
            <a className="transition hover:text-primary" href="#features">Features</a>
            <a className="transition hover:text-primary" href="#why-agrilink">Why AgriLink</a>
            <a className="transition hover:text-primary" href="#faq">FAQ</a>
          </div>
        </div>
      </footer>
    </div>
  );
}
