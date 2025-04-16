import React, { useState } from "react";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { motion } from "framer-motion";
import { Upload, Sparkles, ShoppingBag, ChevronRight } from "lucide-react";
import ImageCreator from "./ImageCreator";
import PrintfulDesignMakerSection from "./PrintfulDesignMakerSection";

const Home = () => {
  const [activeTab, setActiveTab] = useState("create");
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [selectedStyle, setSelectedStyle] = useState<string | null>(null);

  return (
    <div className="min-h-screen animate-none via-black to-95% via-[74%] bg-gradient-to-b from-[#380446]">
      {/* Header */}
      <header className="border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="container flex h-16 items-center justify-between">
          <div className="flex items-center gap-2">
            <Sparkles className="h-6 w-6 text-primary" />
            <span className="text-xl font-bold">DesignCraft</span>
          </div>
          <nav className="hidden md:flex items-center gap-6">
            <a href="#" className="text-sm font-medium hover:text-primary">
              Home
            </a>
            <a href="#" className="text-sm font-medium hover:text-primary">
              Gallery
            </a>
            <a href="#" className="text-sm font-medium hover:text-primary">
              Pricing
            </a>
            <a href="#" className="text-sm font-medium hover:text-primary">
              Help
            </a>
          </nav>
          <div className="flex items-center gap-4">
            <Button variant="outline" size="sm">
              Sign In
            </Button>
            <Button size="sm">Sign Up</Button>
          </div>
        </div>
      </header>
      {/* Hero Section */}
      <section className="container py-12 md:py-24 lg:py-32">
        <div className="grid gap-10 lg:grid-cols-2 lg:gap-16 items-center">
          <div>
            <motion.h1
              className="text-4xl font-bold tracking-tight lg:text-5xl"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
            >
              Create Custom Merchandise with AI
            </motion.h1>
            <motion.p
              className="mt-4 text-muted-foreground"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.1 }}
            >
              Upload your images or generate new ones with AI. Apply stunning
              visual styles and create print-ready products in minutes.
            </motion.p>
            <motion.div
              className="mt-8 flex flex-wrap gap-4"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.2 }}
            >
              <Button size="lg" onClick={() => setActiveTab("create")}>
                Start Creating <ChevronRight className="ml-2 h-4 w-4" />
              </Button>
              <Button variant="outline" size="lg">
                View Gallery
              </Button>
            </motion.div>
          </div>
          <motion.div
            className="relative rounded-xl overflow-hidden shadow-xl"
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.5, delay: 0.3 }}
          >
            <img
              src="https://images.unsplash.com/photo-1523381210434-271e8be1f52b?w=800&q=80"
              alt="Custom t-shirt design"
              className="w-full h-auto object-cover"
            />
          </motion.div>
        </div>
      </section>
      {/* Main Content */}
      <section className="container py-12 md:py-16 animate-none">
        <Card className="overflow-hidden">
          <CardContent className="p-0">
            <Tabs
              defaultValue="create"
              value={activeTab}
              onValueChange={setActiveTab}
              className="w-full"
            >
              <div className="border-b px-6 py-4">
                <TabsList className="grid w-full md:w-auto grid-cols-2 md:inline-flex">
                  <TabsTrigger
                    value="create"
                    className="flex items-center gap-2"
                  >
                    <Upload className="h-4 w-4" />
                    <span>Create Design</span>
                  </TabsTrigger>
                  <TabsTrigger value="shop" className="flex items-center gap-2">
                    <ShoppingBag className="h-4 w-4" />
                    <span>Shop Products</span>
                  </TabsTrigger>
                </TabsList>
              </div>
              <TabsContent
                value="create"
                className="p-0 focus-visible:outline-none focus-visible:ring-0 bg-white"
              >
                <ImageCreator
                  onImageSelect={setSelectedImage}
                  onStyleSelect={setSelectedStyle}
                />
              </TabsContent>
              <TabsContent
                value="shop"
                className="p-6 focus-visible:outline-none focus-visible:ring-0"
              >
                <div className="text-center py-12">
                  <h3 className="text-2xl font-semibold mb-4">
                    Browse Ready-to-Order Products
                  </h3>
                  <p className="text-muted-foreground mb-8">
                    Explore our collection of pre-designed merchandise or create
                    your own.
                  </p>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    {[1, 2, 3].map((item) => (
                      <Card key={item} className="overflow-hidden">
                        <div className="aspect-square relative">
                          <img
                            src={`https://images.unsplash.com/photo-1576566588028-4147f3842f27?w=500&q=80`}
                            alt="Product"
                            className="object-cover w-full h-full"
                          />
                        </div>
                        <CardContent className="p-4">
                          <h4 className="font-medium">
                            Custom T-Shirt Design {item}
                          </h4>
                          <p className="text-sm text-muted-foreground mt-1">
                            From $24.99
                          </p>
                          <Button className="w-full mt-4" size="sm">
                            View Details
                          </Button>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                </div>
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>
      </section>
      {/* Features Section */}
      <section className="container py-12 md:py-24">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold tracking-tight">How It Works</h2>
          <p className="mt-4 text-muted-foreground max-w-2xl mx-auto">
            Create custom merchandise in just a few simple steps. No design
            skills required.
          </p>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {[
            {
              title: "Upload or Generate",
              description:
                "Upload your own image or use our AI to generate a unique design based on your text prompt.",
              icon: <Upload className="h-10 w-10 text-primary" />,
            },
            {
              title: "Apply Visual Styles",
              description:
                "Choose from a variety of artistic styles to transform your image into something extraordinary.",
              icon: <Sparkles className="h-10 w-10 text-primary" />,
            },
            {
              title: "Order Your Creation",
              description:
                "Preview your design on various products and order with just a few clicks.",
              icon: <ShoppingBag className="h-10 w-10 text-primary" />,
            },
          ].map((feature, index) => (
            <Card key={index} className="p-6">
              <div className="mb-4">{feature.icon}</div>
              <h3 className="text-xl font-semibold mb-2">{feature.title}</h3>
              <p className="text-muted-foreground">{feature.description}</p>
            </Card>
          ))}
        </div>
      </section>

      {/* Printful Design Maker Section */}
      <PrintfulDesignMakerSection />
      {/* Footer */}
      <footer className="border-t bg-muted/40">
        <div className="container py-8 md:py-12">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            <div>
              <h4 className="text-sm font-semibold mb-4">Company</h4>
              <ul className="space-y-2 text-sm">
                <li>
                  <a
                    href="#"
                    className="text-muted-foreground hover:text-foreground"
                  >
                    About
                  </a>
                </li>
                <li>
                  <a
                    href="#"
                    className="text-muted-foreground hover:text-foreground"
                  >
                    Careers
                  </a>
                </li>
                <li>
                  <a
                    href="#"
                    className="text-muted-foreground hover:text-foreground"
                  >
                    Press
                  </a>
                </li>
              </ul>
            </div>
            <div>
              <h4 className="text-sm font-semibold mb-4">Products</h4>
              <ul className="space-y-2 text-sm">
                <li>
                  <a
                    href="#"
                    className="text-muted-foreground hover:text-foreground"
                  >
                    T-Shirts
                  </a>
                </li>
                <li>
                  <a
                    href="#"
                    className="text-muted-foreground hover:text-foreground"
                  >
                    Mugs
                  </a>
                </li>
                <li>
                  <a
                    href="#"
                    className="text-muted-foreground hover:text-foreground"
                  >
                    Posters
                  </a>
                </li>
              </ul>
            </div>
            <div>
              <h4 className="text-sm font-semibold mb-4">Resources</h4>
              <ul className="space-y-2 text-sm">
                <li>
                  <a
                    href="#"
                    className="text-muted-foreground hover:text-foreground"
                  >
                    Blog
                  </a>
                </li>
                <li>
                  <a
                    href="#"
                    className="text-muted-foreground hover:text-foreground"
                  >
                    Documentation
                  </a>
                </li>
                <li>
                  <a
                    href="#"
                    className="text-muted-foreground hover:text-foreground"
                  >
                    Tutorials
                  </a>
                </li>
              </ul>
            </div>
            <div>
              <h4 className="text-sm font-semibold mb-4">Legal</h4>
              <ul className="space-y-2 text-sm">
                <li>
                  <a
                    href="#"
                    className="text-muted-foreground hover:text-foreground"
                  >
                    Privacy Policy
                  </a>
                </li>
                <li>
                  <a
                    href="#"
                    className="text-muted-foreground hover:text-foreground"
                  >
                    Terms of Service
                  </a>
                </li>
                <li>
                  <a
                    href="#"
                    className="text-muted-foreground hover:text-foreground"
                  >
                    Cookie Policy
                  </a>
                </li>
              </ul>
            </div>
          </div>
          <div className="mt-8 pt-8 border-t flex flex-col md:flex-row justify-between items-center gap-4">
            <div className="flex items-center gap-2">
              <Sparkles className="h-5 w-5 text-primary" />
              <span className="font-semibold">DesignCraft</span>
            </div>
            <p className="text-sm text-muted-foreground">
              © {new Date().getFullYear()} DesignCraft. All rights reserved.
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Home;
