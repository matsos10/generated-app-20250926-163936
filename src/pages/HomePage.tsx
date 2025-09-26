import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useTranslation, Trans } from 'react-i18next';
import { Button } from '@/components/ui/button';
import { Header } from '@/components/layout/Header';
import { Footer } from '@/components/layout/Footer';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import { Bot, BarChart, ShieldCheck, Zap, MessageSquare, Users, Loader2 } from 'lucide-react';
import { motion } from 'framer-motion';
import { ThemeToggle } from '@/components/ThemeToggle';
import { toast } from 'sonner';
import { Toaster } from '@/components/ui/sonner';
const fadeIn = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.6 } },
};
export function HomePage() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const [loadingPriceId, setLoadingPriceId] = useState<string | null>(null);
  const handleCheckout = async (priceId: string) => {
    if (priceId === 'price_enterprise') {
      navigate('/signup'); // Or a contact form page
      return;
    }
    setLoadingPriceId(priceId);
    try {
      const response = await fetch('/api/stripe/create-checkout-session', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ priceId }),
      });
      const session = await response.json();
      if (session.success && session.data.url) {
        navigate(session.data.url);
      } else {
        throw new Error('Failed to create checkout session');
      }
    } catch (error) {
      toast.error('Could not initiate checkout. Please try again.');
      console.error(error);
    } finally {
      setLoadingPriceId(null);
    }
  };
  const features = [
    { icon: Bot, title: t('features.cards.chatbot.title'), description: t('features.cards.chatbot.description') },
    { icon: MessageSquare, title: t('features.cards.analysis.title'), description: t('features.cards.analysis.description') },
    { icon: Users, title: t('features.cards.insights.title'), description: t('features.cards.insights.description') },
    { icon: BarChart, title: t('features.cards.reporting.title'), description: t('features.cards.reporting.description') },
  ];
  const testimonials = t('testimonials.cards', { returnObjects: true }) as { quote: string; name: string; title: string; }[];
  const pricingTiers = [
    { name: t('pricing.tiers.basic.name'), priceId: 'price_basic', price: t('pricing.tiers.basic.price'), features: t('pricing.tiers.basic.features', { returnObjects: true }), cta: t('pricing.tiers.basic.cta') },
    { name: t('pricing.tiers.pro.name'), priceId: 'price_pro', price: t('pricing.tiers.pro.price'), features: t('pricing.tiers.pro.features', { returnObjects: true }), cta: t('pricing.tiers.pro.cta'), popular: true },
    { name: t('pricing.tiers.enterprise.name'), priceId: 'price_enterprise', price: t('pricing.tiers.enterprise.price'), features: t('pricing.tiers.enterprise.features', { returnObjects: true }), cta: t('pricing.tiers.enterprise.cta') },
  ];
  const faqItems = t('faq.items', { returnObjects: true }) as { question: string; answer: string; }[];
  return (
    <div className="bg-background text-foreground">
      <Toaster richColors />
      <ThemeToggle />
      <Header />
      <main>
        {/* Hero Section */}
        <section className="relative pt-32 pb-24 lg:pt-48 lg:pb-32">
          <div className="absolute inset-0 bg-gradient-to-br from-indigo-50 via-white to-purple-50 dark:from-gray-900 dark:via-gray-900 dark:to-indigo-900/20 opacity-70"></div>
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative text-center">
            <motion.div variants={fadeIn} initial="hidden" animate="visible">
              <h1 className="text-4xl font-extrabold font-display tracking-tight text-gray-900 dark:text-gray-100 sm:text-5xl md:text-6xl">
                <Trans i18nKey="hero.title">
                  Revolutionize Your Customer Support with <span className="text-primary">AI</span>
                </Trans>
              </h1>
              <p className="mt-6 max-w-2xl mx-auto text-lg text-gray-600 dark:text-gray-300">
                {t('hero.subtitle')}
              </p>
              <div className="mt-10 flex justify-center gap-4">
                <Button size="lg" asChild className="shadow-lg hover:shadow-primary/50 transition-shadow">
                  <Link to="/signup">{t('hero.cta_trial')}</Link>
                </Button>
                <Button size="lg" variant="outline" asChild>
                  <Link to="#">{t('hero.cta_demo')}</Link>
                </Button>
              </div>
            </motion.div>
          </div>
        </section>
        {/* Features Section */}
        <section id="features" className="py-24 lg:py-32 bg-white dark:bg-gray-900/50">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center">
              <h2 className="text-3xl font-extrabold font-display text-gray-900 dark:text-gray-100">{t('features.title')}</h2>
              <p className="mt-4 text-lg text-gray-600 dark:text-gray-300">{t('features.subtitle')}</p>
            </div>
            <div className="mt-16 grid gap-8 md:grid-cols-2 lg:grid-cols-4">
              {features.map((feature, index) => (
                <motion.div key={index} variants={fadeIn} initial="hidden" whileInView="visible" viewport={{ once: true, amount: 0.3 }}>
                  <Card className="text-center h-full hover:shadow-lg hover:-translate-y-1 transition-all">
                    <CardHeader>
                      <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-primary/10">
                        <feature.icon className="h-6 w-6 text-primary" />
                      </div>
                      <CardTitle className="mt-4">{feature.title}</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <p className="text-gray-600 dark:text-gray-300">{feature.description}</p>
                    </CardContent>
                  </Card>
                </motion.div>
              ))}
            </div>
          </div>
        </section>
        {/* Security Section */}
        <section className="py-24 lg:py-32">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="lg:grid lg:grid-cols-2 lg:gap-16 lg:items-center">
              <div>
                <h2 className="text-3xl font-extrabold font-display text-gray-900 dark:text-gray-100">{t('security.title')}</h2>
                <p className="mt-4 text-lg text-gray-600 dark:text-gray-300">{t('security.subtitle')}</p>
                <ul className="mt-8 space-y-4 text-gray-600 dark:text-gray-300">
                  {(t('security.points', { returnObjects: true }) as string[]).map((point, index) => (
                    <li key={index} className="flex items-start"><ShieldCheck className="h-6 w-6 text-green-500 mr-3 flex-shrink-0" /><span>{point}</span></li>
                  ))}
                </ul>
              </div>
              <div className="mt-10 lg:mt-0 flex justify-center">
                <ShieldCheck className="h-64 w-64 text-primary/20" />
              </div>
            </div>
          </div>
        </section>
        {/* Testimonials Section */}
        <section id="testimonials" className="py-24 lg:py-32 bg-gray-50 dark:bg-gray-900">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center">
              <h2 className="text-3xl font-extrabold font-display text-gray-900 dark:text-gray-100">{t('testimonials.title')}</h2>
              <p className="mt-4 text-lg text-gray-600 dark:text-gray-300">{t('testimonials.subtitle')}</p>
            </div>
            <div className="mt-16 grid gap-8 lg:grid-cols-3">
              {testimonials.map((testimonial, index) => (
                <motion.div key={index} variants={fadeIn} initial="hidden" whileInView="visible" viewport={{ once: true, amount: 0.3 }}>
                  <Card className="h-full flex flex-col">
                    <CardContent className="pt-6 flex-1">
                      <p className="text-gray-600 dark:text-gray-300">"{testimonial.quote}"</p>
                    </CardContent>
                    <CardHeader className="flex-row items-center">
                      <img className="h-12 w-12 rounded-full" src={`https://i.pravatar.cc/150?img=${index + 1}`} alt={testimonial.name} />
                      <div className="ml-4">
                        <CardTitle className="text-base">{testimonial.name}</CardTitle>
                        <p className="text-sm text-gray-500">{testimonial.title}</p>
                      </div>
                    </CardHeader>
                  </Card>
                </motion.div>
              ))}
            </div>
          </div>
        </section>
        {/* Pricing Section */}
        <section id="pricing" className="py-24 lg:py-32">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center">
              <h2 className="text-3xl font-extrabold font-display text-gray-900 dark:text-gray-100">{t('pricing.title')}</h2>
              <p className="mt-4 text-lg text-gray-600 dark:text-gray-300">{t('pricing.subtitle')}</p>
            </div>
            <div className="mt-16 grid gap-8 lg:grid-cols-3 lg:items-start">
              {pricingTiers.map((tier) => (
                <Card key={tier.name} className={tier.popular ? 'border-2 border-primary shadow-xl' : ''}>
                  <CardHeader className="text-center">
                    <h3 className="text-lg font-semibold text-primary">{tier.name}</h3>
                    <p className="mt-2">
                      <span className="text-4xl font-bold">{tier.price}</span>
                      {tier.price !== 'Custom' && tier.price !== 'Personnalisé' && <span className="text-base text-gray-500">/mo</span>}
                    </p>
                  </CardHeader>
                  <CardContent>
                    <ul className="space-y-4">
                      {(tier.features as string[]).map((feature) => (
                        <li key={feature} className="flex items-center">
                          <Zap className="h-5 w-5 text-green-500 mr-3" />
                          <span>{feature}</span>
                        </li>
                      ))}
                    </ul>
                    <Button
                      onClick={() => handleCheckout(tier.priceId)}
                      disabled={loadingPriceId === tier.priceId}
                      className={`w-full mt-8 ${tier.popular ? '' : ''}`}
                      variant={tier.popular ? 'default' : 'outline'}
                    >
                      {loadingPriceId === tier.priceId && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                      {tier.cta}
                    </Button>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </section>
        {/* FAQ Section */}
        <section id="faq" className="py-24 lg:py-32 bg-gray-50 dark:bg-gray-900">
          <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center">
              <h2 className="text-3xl font-extrabold font-display text-gray-900 dark:text-gray-100">{t('faq.title')}</h2>
            </div>
            <Accordion type="single" collapsible className="w-full mt-12">
              {faqItems.map((item, index) => (
                <AccordionItem key={index} value={`item-${index}`}>
                  <AccordionTrigger className="text-lg text-left">{item.question}</AccordionTrigger>
                  <AccordionContent className="text-base text-gray-600 dark:text-gray-300">
                    {item.answer}
                  </AccordionContent>
                </AccordionItem>
              ))}
            </Accordion>
          </div>
        </section>
      </main>
      <Footer />
    </div>
  );
}