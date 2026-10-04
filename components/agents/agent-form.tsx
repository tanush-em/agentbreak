"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Plus, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";

type Tool = { name: string; description: string };

type Props = {
  initial?: {
    name: string;
    description: string;
    model: string;
    systemPrompt: string;
    memoryEnabled: boolean;
    tools: Tool[];
    knowledgeSources: string[];
  };
  agentId?: string;
};

export function AgentForm({ initial, agentId }: Props) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [name, setName] = useState(initial?.name ?? "");
  const [description, setDescription] = useState(initial?.description ?? "");
  const [model, setModel] = useState(initial?.model ?? "gpt-4o");
  const [systemPrompt, setSystemPrompt] = useState(initial?.systemPrompt ?? "");
  const [memoryEnabled, setMemoryEnabled] = useState(
    initial?.memoryEnabled ?? false
  );
  const [tools, setTools] = useState<Tool[]>(
    initial?.tools ?? [{ name: "", description: "" }]
  );
  const [knowledge, setKnowledge] = useState(
    (initial?.knowledgeSources ?? []).join(", ")
  );

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError(null);

    const payload = {
      name,
      description,
      model,
      systemPrompt,
      memoryEnabled,
      tools: tools.filter((t) => t.name.trim()),
      knowledgeSources: knowledge
        .split(",")
        .map((s) => s.trim())
        .filter(Boolean),
    };

    try {
      const res = await fetch(
        agentId ? `/api/agents/${agentId}` : "/api/agents",
        {
          method: agentId ? "PUT" : "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        }
      );
      const data = await res.json();
      if (!res.ok) {
        setError(data.error || "Failed to save agent");
        setLoading(false);
        return;
      }
      router.push(`/agents/${data.id}`);
      router.refresh();
    } catch {
      setError("Failed to save agent");
      setLoading(false);
    }
  }

  return (
    <form onSubmit={onSubmit} className="mx-auto max-w-2xl space-y-5">
      <div className="space-y-2">
        <Label htmlFor="name">Agent Name</Label>
        <Input
          id="name"
          value={name}
          onChange={(e) => setName(e.target.value)}
          required
          placeholder="Customer Support Agent"
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="description">Description</Label>
        <Textarea
          id="description"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          required
          rows={2}
          placeholder="Handles customer support requests..."
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="model">Model</Label>
        <Input
          id="model"
          value={model}
          onChange={(e) => setModel(e.target.value)}
          required
          placeholder="gpt-4o"
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="systemPrompt">System Prompt</Label>
        <Textarea
          id="systemPrompt"
          value={systemPrompt}
          onChange={(e) => setSystemPrompt(e.target.value)}
          required
          rows={8}
          className="font-mono-tech text-xs"
          placeholder="You are a helpful assistant..."
        />
      </div>

      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <Label>Tools</Label>
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={() =>
              setTools([...tools, { name: "", description: "" }])
            }
          >
            <Plus className="h-3.5 w-3.5" />
            Add Tool
          </Button>
        </div>
        {tools.map((tool, i) => (
          <div key={i} className="flex gap-2">
            <Input
              placeholder="Tool name"
              value={tool.name}
              onChange={(e) => {
                const next = [...tools];
                next[i] = { ...next[i], name: e.target.value };
                setTools(next);
              }}
            />
            <Input
              placeholder="Description"
              value={tool.description}
              onChange={(e) => {
                const next = [...tools];
                next[i] = { ...next[i], description: e.target.value };
                setTools(next);
              }}
            />
            <Button
              type="button"
              variant="ghost"
              size="icon"
              onClick={() => setTools(tools.filter((_, j) => j !== i))}
            >
              <Trash2 className="h-3.5 w-3.5" />
            </Button>
          </div>
        ))}
      </div>

      <div className="space-y-2">
        <Label htmlFor="knowledge">Knowledge Sources</Label>
        <Input
          id="knowledge"
          value={knowledge}
          onChange={(e) => setKnowledge(e.target.value)}
          placeholder="company-policies, customer-faq"
        />
        <p className="text-[11px] text-muted-foreground">
          Comma-separated source names
        </p>
      </div>

      <label className="flex items-center gap-2 text-sm">
        <input
          type="checkbox"
          checked={memoryEnabled}
          onChange={(e) => setMemoryEnabled(e.target.checked)}
          className="rounded border-border"
        />
        Memory Enabled
      </label>

      {error && (
        <div className="rounded border border-critical/40 bg-critical/10 px-3 py-2 text-sm text-critical">
          {error}
        </div>
      )}

      <div className="flex gap-2">
        <Button type="submit" disabled={loading}>
          {loading ? "Saving..." : agentId ? "Update Agent" : "Create Agent"}
        </Button>
        <Button
          type="button"
          variant="outline"
          onClick={() => router.back()}
        >
          Cancel
        </Button>
      </div>
    </form>
  );
}
