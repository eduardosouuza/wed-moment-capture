import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { EmailCaptureModal } from '@/components/EmailCaptureModal';
import { FAQ } from '@/components/FAQ';
import { createGuestCheckout } from '@/lib/checkout';
import { useSmoothScroll } from '@/hooks/useSmoothScroll';
import { useScrollTriggerConfig } from '@/hooks/useGSAP';
import { useAutoAnimations } from '@/hooks/usePageAnimations';

// Landing page sections
import { Navbar } from '@/components/landing/Navbar';
import { HeroSection } from '@/components/landing/HeroSection';
import { VisualDemoSection } from '@/components/landing/VisualDemoSection';
import { BenefitsSection } from '@/components/landing/BenefitsSection';
import { PricingSection } from '@/components/landing/PricingSection';
import { CTASection } from '@/components/landing/CTASection';
import { Footer } from '@/components/landing/Footer';

export default function Index() {
  const navigate = useNavigate();
  const [showEmailModal, setShowEmailModal] = useState(false);
  const [selectedPlan, setSelectedPlan] = useState<{ planType: string, planName: string, price: number } | null>(null);

  const handleSelectPlan = (planType: string, planName: string, price: number) => {
    setSelectedPlan({ planType, planName, price });
    setShowEmailModal(true);
  };

  const handleEmailSubmit = async (email: string) => {
    try {
      const { checkoutUrl } = await createGuestCheckout(selectedPlan!.planType, email);
      window.location.href = checkoutUrl;
    } catch (error) {
      console.error('Error creating checkout:', error);
      alert('Erro ao processar pagamento. Tente novamente.');
    }
  };

  // Inicializar smooth scroll e ScrollTrigger
  useSmoothScroll();
  useScrollTriggerConfig();
  useAutoAnimations();

  return (
    <div className="min-h-screen bg-white overflow-x-hidden">
      <Navbar />

      <HeroSection />
      <VisualDemoSection />
      <BenefitsSection />
      <PricingSection handleSelectPlan={handleSelectPlan} />

      {/* Email Capture Modal */}
      {selectedPlan && (
        <EmailCaptureModal
          open={showEmailModal}
          onClose={() => setShowEmailModal(false)}
          onSubmit={handleEmailSubmit}
          planName={selectedPlan.planName}
          price={selectedPlan.price}
        />
      )}

      <FAQ />
      <CTASection />
      <Footer navigate={navigate} />
    </div>
  );
}
