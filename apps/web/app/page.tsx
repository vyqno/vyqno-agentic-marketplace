import Hero from "@/components/home/Hero";
import AgentGrid from "@/components/home/AgentGrid";

export default function Home() {
  return (
    <div className="flex flex-col">
      <Hero />
      <AgentGrid />
    </div>
  );
}

