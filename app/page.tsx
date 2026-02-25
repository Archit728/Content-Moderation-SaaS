import { Navbar } from '@/components/Navbar'
import { Button } from '@/components/ui/button'
import Link from 'next/link'
import { ArrowRight, Shield, Zap, BarChart3, Lock, AlertCircle, Check } from 'lucide-react'

export default function Home() {
  const features = [
    {
      icon: Shield,
      title: 'AI-Powered Detection',
      description: 'Advanced BERT-based model for multi-label toxicity detection with high accuracy'
    },
    {
      icon: Zap,
      title: 'Real-Time Analysis',
      description: 'Instant content moderation results with millisecond response times'
    },
    {
      icon: BarChart3,
      title: 'Advanced Analytics',
      description: 'Comprehensive dashboards with trends, patterns, and detailed insights'
    },
    {
      icon: Lock,
      title: 'Secure & Private',
      description: 'Enterprise-grade security with end-to-end encryption and data privacy'
    },
    {
      icon: AlertCircle,
      title: 'Custom Thresholds',
      description: 'Fine-tune detection sensitivity for each content category'
    },
    {
      icon: BarChart3,
      title: 'Batch Processing',
      description: 'Process up to 1,000 items at once for efficient bulk moderation'
    }
  ]

  const plans = [
    {
      name: 'Starter',
      price: 'Free',
      description: 'Perfect for getting started',
      features: [
        'Up to 1,000 moderation requests/month',
        '6 toxicity labels',
        'Basic analytics',
        'Custom thresholds',
        'Email support'
      ]
    },
    {
      name: 'Professional',
      price: '$99',
      period: '/month',
      description: 'For growing teams',
      features: [
        'Unlimited moderation requests',
        '6 toxicity labels',
        'Advanced analytics',
        'Custom thresholds',
        'Batch processing (10,000/month)',
        'API access',
        'Priority support'
      ],
      highlighted: true
    },
    {
      name: 'Enterprise',
      price: 'Custom',
      description: 'For large organizations',
      features: [
        'Unlimited everything',
        'Custom model training',
        'Dedicated support',
        'SLA guarantee',
        'On-premise deployment',
        'Custom integrations'
      ]
    }
  ]

  return (
    <>
      <Navbar />
      <main className="flex flex-col min-h-screen bg-gradient-to-br from-background via-background to-accent/5">
        {/* Hero Section */}
        <section className="container mx-auto px-4 py-24 md:py-32 flex flex-col items-center justify-center text-center">
          <div className="max-w-3xl mx-auto space-y-8">
            <div className="space-y-4">
              <div className="inline-block px-4 py-2 rounded-full border border-accent/30 bg-accent/5">
                <span className="text-sm font-medium text-accent">
                  Powered by Advanced AI
                </span>
              </div>
              <h1 className="text-5xl md:text-6xl font-bold text-balance">
                Enterprise Content{' '}
                <span className="bg-gradient-to-r from-accent to-accent/60 bg-clip-text text-transparent">
                  Moderation
                </span>
              </h1>
              <p className="text-lg md:text-xl text-muted-foreground text-balance">
                Keep your platform safe with AI-powered toxicity detection. Real-time analysis, comprehensive analytics, and custom thresholds for your content.
              </p>
            </div>

            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button size="lg" asChild className="gap-2">
                <Link href="/auth/signup">
                  Get Started Free
                  <ArrowRight className="w-4 h-4" />
                </Link>
              </Button>
              <Button size="lg" variant="outline" asChild>
                <Link href="/auth/signin">Sign In</Link>
              </Button>
            </div>

            <div className="flex flex-col sm:flex-row items-center justify-center gap-8 pt-8 text-sm text-muted-foreground">
              <div className="flex items-center gap-2">
                <Check className="w-4 h-4 text-green-500" />
                <span>No credit card required</span>
              </div>
              <div className="flex items-center gap-2">
                <Check className="w-4 h-4 text-green-500" />
                <span>Instant setup</span>
              </div>
              <div className="flex items-center gap-2">
                <Check className="w-4 h-4 text-green-500" />
                <span>Free tier available</span>
              </div>
            </div>
          </div>
        </section>

        {/* Features Section */}
        <section className="container mx-auto px-4 py-24 md:py-32">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-bold mb-4">Powerful Features</h2>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              Everything you need to moderate content at scale with confidence
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {features.map((feature) => {
              const Icon = feature.icon
              return (
                <div
                  key={feature.title}
                  className="p-6 rounded-lg border border-border/40 bg-card hover:border-border/80 hover:shadow-lg transition-all duration-300"
                >
                  <Icon className="w-8 h-8 text-accent mb-4" />
                  <h3 className="text-lg font-semibold mb-2">{feature.title}</h3>
                  <p className="text-sm text-muted-foreground">
                    {feature.description}
                  </p>
                </div>
              )
            })}
          </div>
        </section>

        {/* Pricing Section */}
        <section className="container mx-auto px-4 py-24 md:py-32">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-bold mb-4">Simple Pricing</h2>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              Start free, scale as you grow
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-6 max-w-6xl mx-auto">
            {plans.map((plan) => (
              <div
                key={plan.name}
                className={`p-8 rounded-lg border transition-all duration-300 flex flex-col ${
                  plan.highlighted
                    ? 'border-accent bg-card shadow-xl scale-105'
                    : 'border-border/40 bg-card hover:border-border/80'
                }`}
              >
                <div className="mb-6">
                  <h3 className="text-2xl font-bold mb-2">{plan.name}</h3>
                  <p className="text-sm text-muted-foreground mb-4">
                    {plan.description}
                  </p>
                  <div className="flex items-baseline gap-1">
                    <span className="text-4xl font-bold">{plan.price}</span>
                    {plan.period && (
                      <span className="text-muted-foreground">{plan.period}</span>
                    )}
                  </div>
                </div>

                <ul className="space-y-3 mb-8 flex-1">
                  {plan.features.map((feature) => (
                    <li key={feature} className="flex items-start gap-3 text-sm">
                      <Check className="w-4 h-4 text-green-500 flex-shrink-0 mt-0.5" />
                      <span className="text-foreground">{feature}</span>
                    </li>
                  ))}
                </ul>

                <Button
                  asChild
                  fullWidth
                  variant={plan.highlighted ? 'default' : 'outline'}
                >
                  <Link href="/auth/signup">Get Started</Link>
                </Button>
              </div>
            ))}
          </div>
        </section>

        {/* CTA Section */}
        <section className="container mx-auto px-4 py-24 md:py-32">
          <div className="max-w-3xl mx-auto p-12 rounded-lg border border-accent/30 bg-accent/5 text-center">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">Ready to get started?</h2>
            <p className="text-lg text-muted-foreground mb-8">
              Join thousands of organizations using ContentGuard to moderate content at scale.
            </p>
            <Button size="lg" asChild>
              <Link href="/auth/signup">Create Free Account</Link>
            </Button>
          </div>
        </section>

        {/* Footer */}
        <footer className="border-t border-border/40 bg-card/50 backdrop-blur mt-auto">
          <div className="container mx-auto px-4 py-12">
            <div className="flex flex-col md:flex-row items-center justify-between">
              <div className="flex items-center gap-2 mb-6 md:mb-0">
                <div className="w-8 h-8 bg-accent rounded-lg flex items-center justify-center text-accent-foreground font-bold">
                  CG
                </div>
                <span className="font-bold">ContentGuard</span>
              </div>
              <p className="text-sm text-muted-foreground">
                © 2024 ContentGuard. All rights reserved.
              </p>
            </div>
          </div>
        </footer>
      </main>
    </>
  )
}
