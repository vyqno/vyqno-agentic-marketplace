"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/Button";
import { Card, CardContent } from "@/components/ui/Card";
import { Brain, Cpu, Database, Fingerprint, Rocket, ArrowRight, ArrowLeft, Loader2, Globe } from "lucide-react";
import { Badge } from "@/components/ui/Badge";

const STEPS = [
  { id: "identity", title: "Identity", description: "Define your agent's persona", icon: Fingerprint },
  { id: "logic", title: "Logic", description: "Configure neural parameters", icon: Brain },
  { id: "knowledge", title: "Knowledge", description: "Upload RAG datasets", icon: Database },
  { id: "launch", title: "Launch", description: "Deploy to AgentNet", icon: Rocket },
];

export default function CreateAgentWizard() {
  const router = useRouter();
  const [currentStep, setCurrentStep] = useState(0);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  const [formData, setFormData] = useState({
    name: "",
    description: "",
    ensName: "",
    skillTags: [] as string[],
    priceUsdc: 0,
    isInitiallyFree: true,
    initialMemory: "",
  });

  const nextStep = () => currentStep < STEPS.length - 1 && setCurrentStep(currentStep + 1);
  const prevStep = () => currentStep > 0 && setCurrentStep(currentStep - 1);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleToggleFree = () => {
    setFormData(prev => ({ ...prev, isInitiallyFree: !prev.isInitiallyFree }));
  };

  const handleSubmit = async () => {
    setIsSubmitting(true);
    setError(null);

    try {
      const response = await fetch("/api/agents", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || "Failed to create agent");
      }

      router.push(`/agent/${result.agent.id}`);
    } catch (err: any) {
      setError(err.message);
      setIsSubmitting(false);
    }
  };

  return (
    <div className="pt-32 pb-20 px-6 max-w-3xl mx-auto">
      {/* Wizard Header */}
      <div className="mb-12 text-center md:text-left">
        <div className="flex items-center justify-center md:justify-start gap-2 mb-4">
          <Badge variant="accent" className="px-4 py-1">New Agent</Badge>
        </div>
        <h1 className="font-outfit font-black text-5xl tracking-tight text-foreground mb-4">
          Birth of a <span className="text-primary italic">Soul.</span>
        </h1>
        <p className="text-foreground/60 font-medium">
          Follow the steps to configure and deploy your autonomous intelligence.
        </p>
      </div>

      {/* Progress Bar */}
      <div className="flex items-center gap-4 mb-12">
        {STEPS.map((step, index) => (
          <div key={step.id} className="flex-1 flex flex-col gap-2">
            <div className={`h-1 rounded-full transition-all duration-500 ${index <= currentStep ? "bg-primary" : "bg-black/5"}`} />
            <span className={`text-[10px] font-bold uppercase tracking-widest hidden md:block ${index === currentStep ? "text-primary" : "text-foreground/30"}`}>
              {step.title}
            </span>
          </div>
        ))}
      </div>

      {/* Step Content */}
      <Card className="glass shadow-premium border-black/5 overflow-hidden">
        <CardContent className="p-10">
          <AnimatePresence mode="wait">
            <motion.div
              key={currentStep}
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={{ duration: 0.5, ease: "easeOut" }}
              className="min-h-[350px]"
            >
              {currentStep === 0 && (
                <div className="flex flex-col gap-8">
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center text-primary">
                      <Fingerprint size={24} />
                    </div>
                    <div>
                      <h3 className="font-bold text-xl">Identity Definition</h3>
                      <p className="text-sm text-foreground/60">Choose a name and description for your agent handles.</p>
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-1 gap-6">
                    <div className="flex flex-col gap-2">
                      <label className="text-[10px] uppercase font-bold tracking-widest text-foreground/40">Agent Handle (Unique)</label>
                      <input 
                        name="name"
                        type="text" 
                        value={formData.name}
                        onChange={handleChange}
                        placeholder="e.g. strategy-core"
                        className="bg-white/50 border border-black/5 px-4 py-3 rounded-xl text-sm focus:outline-none focus:border-primary/30 transition-all font-medium"
                      />
                      <p className="text-[10px] text-foreground/40">Lowercase, alphanumeric and hyphens only.</p>
                    </div>
                    <div className="flex flex-col gap-2">
                      <label className="text-[10px] uppercase font-bold tracking-widest text-foreground/40">ENS / Basename (Optional)</label>
                      <div className="relative">
                        <span className="absolute left-4 top-1/2 -translate-y-1/2 text-foreground/30 font-bold">
                          <Globe size={14} />
                        </span>
                        <input 
                          name="ensName"
                          type="text" 
                          value={formData.ensName}
                          onChange={handleChange}
                          placeholder="vitalik.eth"
                          className="w-full bg-white/50 border border-black/5 pl-10 pr-4 py-3 rounded-xl text-sm focus:outline-none focus:border-primary/30 transition-all font-medium"
                        />
                      </div>
                    </div>
                    <div className="flex flex-col gap-2">
                      <label className="text-[10px] uppercase font-bold tracking-widest text-foreground/40">Bio / Description</label>
                      <textarea 
                        name="description"
                        value={formData.description}
                        onChange={handleChange}
                        placeholder="An agent specialized in DeFi strategy and risk assessment..."
                        rows={3}
                        className="bg-white/50 border border-black/5 px-4 py-3 rounded-xl text-sm focus:outline-none focus:border-primary/30 transition-all font-medium resize-none"
                      />
                    </div>
                  </div>
                </div>
              )}

              {currentStep === 1 && (
                <div className="flex flex-col gap-8">
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center text-primary">
                      <Brain size={24} />
                    </div>
                    <div>
                      <h3 className="font-bold text-xl">Logic & Pricing</h3>
                      <p className="text-sm text-foreground/60">Configure access levels and revenue model.</p>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 gap-6">
                    <div className="flex items-start gap-4 p-4 rounded-2xl bg-black/[0.02] border border-black/5">
                      <div className="w-10 h-10 rounded-lg bg-white shadow-sm flex items-center justify-center">
                        <Cpu size={20} />
                      </div>
                      <div className="flex-1">
                        <h4 className="font-bold text-sm mb-1">Model: Llama 3.3 70B</h4>
                        <p className="text-[11px] text-foreground/50">High performance, fine-tuned for AgentNet.</p>
                      </div>
                      <Badge variant="glass">DEFAULT</Badge>
                    </div>

                    <div 
                      className={`p-6 rounded-2xl border transition-all cursor-pointer ${formData.isInitiallyFree ? "bg-primary/5 border-primary/20" : "bg-white/50 border-black/5"}`}
                      onClick={handleToggleFree}
                    >
                      <div className="flex justify-between items-center mb-2">
                        <h4 className="font-bold text-sm">Free to Query</h4>
                        <div className={`w-10 h-5 rounded-full relative transition-colors ${formData.isInitiallyFree ? "bg-primary" : "bg-foreground/10"}`}>
                           <div className={`w-3 h-3 rounded-full bg-white absolute top-1 transition-all ${formData.isInitiallyFree ? "right-1" : "left-1"}`} />
                        </div>
                      </div>
                      <p className="text-[11px] text-foreground/50">Public access. No payment required for interactions.</p>
                    </div>

                    {!formData.isInitiallyFree && (
                      <motion.div 
                        initial={{ opacity: 0, y: -10 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="flex flex-col gap-2"
                      >
                         <label className="text-[10px] uppercase font-bold tracking-widest text-foreground/40">Price per Query (USDC)</label>
                         <input 
                           name="priceUsdc"
                           type="number" 
                           step="0.01"
                           value={formData.priceUsdc}
                           onChange={(e) => setFormData(prev => ({ ...prev, priceUsdc: parseFloat(e.target.value) }))}
                           placeholder="0.05"
                           className="bg-white/50 border border-black/5 px-4 py-3 rounded-xl text-sm focus:outline-none focus:border-primary/30 transition-all font-medium"
                         />
                      </motion.div>
                    )}
                  </div>
                </div>
              )}
              
              {currentStep === 2 && (
                <div className="flex flex-col gap-8">
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center text-primary">
                      <Database size={24} />
                    </div>
                    <div>
                      <h3 className="font-bold text-xl">Knowledge Base</h3>
                      <p className="text-sm text-foreground/60">Seed your agent with initial RAG context.</p>
                    </div>
                  </div>

                  <div className="flex flex-col gap-4">
                    <label className="text-[10px] uppercase font-bold tracking-widest text-foreground/40">Initial Context / Memory</label>
                    <textarea 
                      name="initialMemory"
                      value={formData.initialMemory}
                      onChange={handleChange}
                      placeholder="Paste text or data your agent should know... This will be chunked and indexed in Supabase pgvector."
                      rows={8}
                      className="bg-white/50 border border-black/5 px-4 py-3 rounded-xl text-sm focus:outline-none focus:border-primary/30 transition-all font-medium resize-none shadow-inner"
                    />
                    <p className="text-[11px] text-foreground/40">
                      RAG (Retrieval Augmented Generation) allows your agent to perform search over private data in real-time.
                    </p>
                  </div>
                </div>
              )}

              {currentStep === 3 && (
                <div className="flex flex-col items-center justify-center text-center py-6">
                   <div className="w-20 h-20 rounded-3xl bg-primary/10 flex items-center justify-center text-primary mb-6">
                     <Rocket size={40} className={isSubmitting ? "animate-bounce" : ""} />
                   </div>
                   <h3 className="font-bold text-2xl mb-2">Final Activation</h3>
                   <p className="text-foreground/60 max-w-xs mb-8">
                     Ready to launch <span className="text-primary font-bold">@{formData.name || "agent"}</span> to the network? 
                     This will create a dedicated Base Sepolia wallet for your agent.
                   </p>

                   <div className="w-full max-w-sm space-y-3">
                      <div className="flex justify-between text-xs p-3 rounded-xl bg-black/[0.02]">
                        <span className="text-foreground/40">Identity:</span>
                        <span className="font-bold text-foreground/70">@{formData.name}</span>
                      </div>
                      <div className="flex justify-between text-xs p-3 rounded-xl bg-black/[0.02]">
                        <span className="text-foreground/40">Pricing:</span>
                        <span className="font-bold text-foreground/70">{formData.isInitiallyFree ? "Free" : `$${formData.priceUsdc} USDC`}</span>
                      </div>
                      <div className="flex justify-between text-xs p-3 rounded-xl bg-black/[0.02]">
                        <span className="text-foreground/40">ENS:</span>
                        <span className="font-bold text-foreground/70">{formData.ensName || "Not set"}</span>
                      </div>
                   </div>

                   {error && <p className="mt-4 text-rose-500 text-xs font-bold">{error}</p>}
                </div>
              )}
            </motion.div>
          </AnimatePresence>

          {/* Footer Controls */}
          <div className="mt-12 flex items-center justify-between border-t border-black/5 pt-8">
            <Button 
              variant="outline" 
              onClick={prevStep}
              disabled={isSubmitting}
              className={currentStep === 0 ? "invisible" : ""}
            >
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back
            </Button>
            
            {currentStep === STEPS.length - 1 ? (
              <Button 
                onClick={handleSubmit}
                disabled={isSubmitting || !formData.name}
                className="px-10 bg-primary hover:bg-primary/90 text-white"
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Deploying...
                  </>
                ) : (
                  <>
                    Activate Soul
                    <Rocket className="w-4 h-4 ml-2" />
                  </>
                )}
              </Button>
            ) : (
              <Button 
                onClick={nextStep}
                className="px-10"
                disabled={currentStep === 0 && (!formData.name || formData.name.length < 3)}
              >
                Continue
                <ArrowRight className="w-4 h-4 ml-2" />
              </Button>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
