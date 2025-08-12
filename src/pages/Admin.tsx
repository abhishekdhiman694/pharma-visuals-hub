import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { categories } from "@/data/products";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import AdminAccessGate from "@/components/auth/AdminAccessGate";

const Admin = () => {
  const [name, setName] = useState("");
  const [categoryId, setCategoryId] = useState<string>(categories[0]?.id ?? "");
  const [files, setFiles] = useState<File[]>([]);

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!name.trim()) {
      toast("Please enter a product name");
      return;
    }
    if (!categoryId) {
      toast("Please select a category");
      return;
    }
    if (!files.length) {
      toast("Please select at least one image");
      return;
    }

    try {
      // 1) Get Cloudinary signature
      const { data: signData, error: signError } = await supabase.functions.invoke(
        "cloudinary-signature",
        { body: { folder: `products/${categoryId}` } }
      );
      if (signError) throw signError;
      const { signature, timestamp, apiKey, cloudName, folder } = signData as {
        signature: string; timestamp: number; apiKey: string; cloudName: string; folder: string;
      };

      // 2) Upload images
      const uploaded: { url: string; alt: string; order: number }[] = [];
      for (let i = 0; i < files.length; i++) {
        const file = files[i];
        const form = new FormData();
        form.append("file", file);
        form.append("api_key", apiKey);
        form.append("timestamp", String(timestamp));
        form.append("signature", signature);
        form.append("folder", folder);

        const res = await fetch(`https://api.cloudinary.com/v1_1/${cloudName}/auto/upload`, {
          method: "POST",
          body: form,
        });
        const json = await res.json();
        if (!res.ok) throw new Error(json?.error?.message || "Upload failed");
        uploaded.push({ url: json.secure_url, alt: `${name} image ${i + 1}`, order: i });
      }

      // 3) Save product and images to DB (requires admin role)
      const { data: product, error: prodErr } = await supabase
        .from("products")
        .insert({ name, category_id: categoryId, description: null, active: true })
        .select('id')
        .single();
      if (prodErr) throw prodErr;

      const rows = uploaded.map((u) => ({ product_id: product.id, url: u.url, alt: u.alt, sort_order: u.order }));
      const { error: imgErr } = await supabase.from("product_images").insert(rows);
      if (imgErr) throw imgErr;

      toast("Product saved", { description: `${name} with ${uploaded.length} images uploaded.` });
      // Reset
      setName("");
      setFiles([]);
      const inputEl = document.getElementById("images") as HTMLInputElement | null;
      if (inputEl) inputEl.value = "";
    } catch (err: any) {
      const msg = err?.message || "Something went wrong";
      if (/(permission|rls|unauthor|forbidden)/i.test(msg)) {
        toast("Not authorized", { description: "Please sign in as an admin to save to the database." });
      } else {
        toast("Upload failed", { description: msg });
      }
    }
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
        <AdminAccessGate>
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
                <Input id="images" type="file" multiple accept="image/*" onChange={(e) => setFiles(Array.from(e.target.files || []))} />
                <p className="text-xs text-muted-foreground">Images are securely uploaded via Cloudinary.</p>
              </div>
              <div className="flex gap-3">
                <Button type="submit" variant="hero">Save product</Button>
                <Button type="button" variant="outline" asChild>
                  <a href="/">Back to app</a>
                </Button>
              </div>
            </form>
          </Card>
        </AdminAccessGate>
      </main>
    </div>
  );
};

export default Admin;
