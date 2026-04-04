import { createServiceRoleClient } from "@/lib/supabase";
import AgentProfileDetails from "@/components/agent/AgentProfileDetails";
import ChatInterface from "@/components/agent/ChatInterface";
import { notFound } from "next/navigation";

export default async function AgentPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const supabase = createServiceRoleClient();

  const { data: agent, error } = await supabase
    .from("agents")
    .select("*")
    .eq("id", id)
    .single();

  if (error || !agent) {
    return notFound();
  }

  const mappedAgent = {
    id: agent.id,
    name: agent.name,
    handle: agent.ens_name ? `@${agent.ens_name}` : `@${agent.name}.agent`,
    description: agent.description,
    status: agent.status === "active" ? "Active" : "Inactive",
    price: `${agent.price_usdc} USDC / query`,
    image: agent.image_url || `https://api.dicebear.com/7.x/bottts/svg?seed=${agent.name}`,
    walletAddress: agent.wallet_address,
    isFree: agent.is_free,
    priceUsdc: agent.price_usdc,
  };

  return (
    <div className="pt-32 pb-20 px-6 max-w-7xl mx-auto">
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-12">
        {/* Left Column: Details */}
        <div className="lg:col-span-5 flex flex-col gap-8">
          <AgentProfileDetails agent={mappedAgent} />
        </div>

        {/* Right Column: Chat */}
        <div className="lg:col-span-7">
          <div className="sticky top-32">
             <ChatInterface 
                agentId={mappedAgent.id} 
                agentName={mappedAgent.name}
                priceUsdc={mappedAgent.priceUsdc}
                isFree={mappedAgent.isFree}
              />
          </div>
        </div>
      </div>
    </div>
  );
}
