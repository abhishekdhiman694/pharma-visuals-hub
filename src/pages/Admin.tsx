import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { categories } from "@/data/products";
import { toast } from "sonner";

const Admin = () => {
  const [name, setName] = useState("");
  const [categoryId, setCategoryId] = useState<string>(categories[0]?.id ?? "");

  const onSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    toast("Backend not connected yet", {
      description: "Please connect Supabase to enable database and image uploads.",
    });
  };

  return (
    <div className="min-h-screen">
      <header className="border-b bg-background/80 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="container mx-auto px-6 py-4">
          <h1 className="text-2xl font-semibold">Admin Panel</h1>
          <p className="text-sm text-muted-foreground">Add and manage products for your visualizer.</p>
        </div>
      </header>
      <main className="container mx-auto px-6 py-10">
        <Card className="max-w-2xl p-6">
          <form onSubmit={onSubmit} className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="name">Product name</Label>
              <Input id="name" value={name} onChange={(e) => setName(e.target.value)} placeholder="e.g., CalciFlex Tabs" />
            </div>
            <div className="space-y-2">
              <Label>Category</Label>
              <Select value={categoryId} onValueChange={setCategoryId}>
                <SelectTrigger>
                  <SelectValue placeholder="Select category" />
                </SelectTrigger>
                <SelectContent>
                  {categories.map((c) => (
                    <SelectItem key={c.id} value={c.id}>{c.name}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="images">Images</Label>
              <Input id="images" type="file" multiple accept="image/*" />
              <p className="text-xs text-muted-foreground">We will use secure uploads once Supabase is connected (Cloudinary keys stored as secrets).</p>
            </div>
            <div className="flex gap-3">
              <Button type="submit" variant="hero">Save product</Button>
              <Button type="button" variant="outline" asChild>
                <a href="/">Back to app</a>
              </Button>
            </div>
          </form>
        </Card>
      </main>
    </div>
  );
};

export default Admin;
