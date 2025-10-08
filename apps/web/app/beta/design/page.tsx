"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Slider } from "@/components/ui/slider";
import { MetricTile } from "@/components/lovable/MetricTile";
import { Ring } from "@/components/lovable/Ring";
import { MetricsChart } from "@/components/lovable/MetricsChart";
import { StreakDisplay } from "@/components/lovable/StreakDisplay";
import { Skeleton } from "@/components/lovable/Skeleton";
import { 
  Heart, 
  Star, 
  Zap, 
  TrendingUp, 
  Users, 
  Calendar,
  MessageCircle,
  Award,
  CheckCircle2,
  AlertCircle,
  Info,
  XCircle,
} from "lucide-react";
import { cn } from "@/lib/utils";

export default function DesignSystemPage() {
  const [sliderValue, setSliderValue] = useState([50]);

  return (
    <div className="space-y-12">
      {/* Header */}
      <div className="space-y-4">
        <h1 className="text-5xl font-bold tracking-tight">Design System Gallery</h1>
        <p className="text-lg text-muted-foreground max-w-3xl">
          Visual parity check for TrainU Beta components. All components use the Lovable design system
          with consistent tokens for colors, typography, spacing, and shadows.
        </p>
      </div>

      {/* Color Palette */}
      <section className="space-y-6">
        <div>
          <h2 className="text-3xl font-bold mb-2">Color Palette</h2>
          <p className="text-muted-foreground">Full HSL-based color system with semantic naming</p>
        </div>
        
        <div className="space-y-4">
          <div className="space-y-2">
            <h3 className="text-lg font-semibold">Brand Colors</h3>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <ColorSwatch name="Primary" className="bg-primary text-primary-foreground" />
              <ColorSwatch name="Primary Hover" className="bg-primary-hover text-primary-foreground" />
              <ColorSwatch name="Accent" className="bg-accent text-accent-foreground" />
              <ColorSwatch name="Secondary" className="bg-secondary text-secondary-foreground" />
            </div>
          </div>

          <div className="space-y-2">
            <h3 className="text-lg font-semibold">Status Colors</h3>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <ColorSwatch name="Success" className="bg-success text-success-foreground" />
              <ColorSwatch name="Warning" className="bg-warning text-warning-foreground" />
              <ColorSwatch name="Danger" className="bg-danger text-danger-foreground" />
              <ColorSwatch name="Info" className="bg-info text-info-foreground" />
            </div>
          </div>

          <div className="space-y-2">
            <h3 className="text-lg font-semibold">Surfaces</h3>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <ColorSwatch name="Background" className="bg-background text-foreground border border-border" />
              <ColorSwatch name="Card" className="bg-card text-card-foreground border border-border" />
              <ColorSwatch name="Muted" className="bg-muted text-muted-foreground" />
              <ColorSwatch name="Popover" className="bg-popover text-popover-foreground border border-border" />
            </div>
          </div>
        </div>
      </section>

      {/* Typography */}
      <section className="space-y-6">
        <div>
          <h2 className="text-3xl font-bold mb-2">Typography</h2>
          <p className="text-muted-foreground">Inter font family with modular scale</p>
        </div>
        
        <Card className="p-6 space-y-4">
          <div>
            <h1>Heading 1 - The quick brown fox</h1>
            <code className="text-xs text-muted-foreground">text-4xl md:text-5xl font-bold</code>
          </div>
          <div>
            <h2>Heading 2 - The quick brown fox</h2>
            <code className="text-xs text-muted-foreground">text-3xl md:text-4xl font-bold</code>
          </div>
          <div>
            <h3>Heading 3 - The quick brown fox</h3>
            <code className="text-xs text-muted-foreground">text-2xl md:text-3xl font-semibold</code>
          </div>
          <div>
            <h4>Heading 4 - The quick brown fox</h4>
            <code className="text-xs text-muted-foreground">text-xl md:text-2xl font-semibold</code>
          </div>
          <div>
            <h5>Heading 5 - The quick brown fox</h5>
            <code className="text-xs text-muted-foreground">text-lg md:text-xl font-semibold</code>
          </div>
          <div>
            <h6>Heading 6 - The quick brown fox</h6>
            <code className="text-xs text-muted-foreground">text-base md:text-lg font-semibold</code>
          </div>
          <div>
            <p>Body text - The quick brown fox jumps over the lazy dog. Lorem ipsum dolor sit amet, consectetur adipiscing elit.</p>
            <code className="text-xs text-muted-foreground">text-base</code>
          </div>
          <div>
            <p className="text-sm text-muted-foreground">Muted text - Supporting information and captions</p>
            <code className="text-xs text-muted-foreground">text-sm text-muted-foreground</code>
          </div>
        </Card>
      </section>

      {/* Buttons */}
      <section className="space-y-6">
        <div>
          <h2 className="text-3xl font-bold mb-2">Buttons</h2>
          <p className="text-muted-foreground">All variants and sizes with proper tap targets</p>
        </div>
        
        <Card className="p-6 space-y-6">
          <div className="space-y-3">
            <h3 className="text-lg font-semibold">Variants</h3>
            <div className="flex flex-wrap gap-3">
              <Button variant="default">Default</Button>
              <Button variant="secondary">Secondary</Button>
              <Button variant="outline">Outline</Button>
              <Button variant="ghost">Ghost</Button>
              <Button variant="destructive">Destructive</Button>
              <Button variant="link">Link</Button>
            </div>
          </div>

          <div className="space-y-3">
            <h3 className="text-lg font-semibold">Sizes</h3>
            <div className="flex flex-wrap items-center gap-3">
              <Button size="sm">Small</Button>
              <Button size="default">Default</Button>
              <Button size="lg">Large</Button>
              <Button size="icon"><Heart className="h-4 w-4" /></Button>
            </div>
          </div>

          <div className="space-y-3">
            <h3 className="text-lg font-semibold">With Icons</h3>
            <div className="flex flex-wrap gap-3">
              <Button><Star className="mr-2 h-4 w-4" />Star</Button>
              <Button variant="secondary"><Zap className="mr-2 h-4 w-4" />Lightning</Button>
              <Button variant="outline"><TrendingUp className="mr-2 h-4 w-4" />Trending</Button>
            </div>
          </div>
        </Card>
      </section>

      {/* Cards & Shadows */}
      <section className="space-y-6">
        <div>
          <h2 className="text-3xl font-bold mb-2">Cards & Elevation</h2>
          <p className="text-muted-foreground">Consistent shadows and radius across components</p>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <Card className="p-6 shadow-sm">
            <h3 className="font-semibold mb-2">Shadow SM</h3>
            <p className="text-sm text-muted-foreground">Subtle elevation for minimal depth</p>
          </Card>
          <Card className="p-6 shadow-md">
            <h3 className="font-semibold mb-2">Shadow MD</h3>
            <p className="text-sm text-muted-foreground">Default card shadow</p>
          </Card>
          <Card className="p-6 shadow-lg">
            <h3 className="font-semibold mb-2">Shadow LG</h3>
            <p className="text-sm text-muted-foreground">Prominent elevation</p>
          </Card>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <Card className="p-6 shadow-glow">
            <h3 className="font-semibold mb-2 flex items-center gap-2">
              <Zap className="h-5 w-5 text-primary" />
              Shadow Glow
            </h3>
            <p className="text-sm text-muted-foreground">Primary-colored soft glow effect</p>
          </Card>
          <Card className="p-6 shadow-glow-intense">
            <h3 className="font-semibold mb-2 flex items-center gap-2">
              <Star className="h-5 w-5 text-primary" />
              Shadow Glow Intense
            </h3>
            <p className="text-sm text-muted-foreground">Stronger glow for emphasis</p>
          </Card>
        </div>
      </section>

      {/* Badges */}
      <section className="space-y-6">
        <div>
          <h2 className="text-3xl font-bold mb-2">Badges</h2>
          <p className="text-muted-foreground">Status indicators and labels</p>
        </div>
        
        <Card className="p-6">
          <div className="flex flex-wrap gap-3">
            <Badge>Default</Badge>
            <Badge variant="secondary">Secondary</Badge>
            <Badge variant="outline">Outline</Badge>
            <Badge variant="destructive">Destructive</Badge>
            <Badge className="bg-success text-success-foreground">Success</Badge>
            <Badge className="bg-warning text-warning-foreground">Warning</Badge>
            <Badge className="bg-info text-info-foreground">Info</Badge>
          </div>
        </Card>
      </section>

      {/* Form Elements */}
      <section className="space-y-6">
        <div>
          <h2 className="text-3xl font-bold mb-2">Form Elements</h2>
          <p className="text-muted-foreground">Inputs, textareas, and controls with focus states</p>
        </div>
        
        <Card className="p-6 space-y-6">
          <div className="space-y-2">
            <Label htmlFor="input-default">Input Field</Label>
            <Input id="input-default" placeholder="Enter your name..." />
          </div>

          <div className="space-y-2">
            <Label htmlFor="textarea-default">Textarea</Label>
            <Textarea id="textarea-default" placeholder="Type your message..." rows={4} />
          </div>

          <div className="flex items-center space-x-2">
            <Switch id="switch-default" />
            <Label htmlFor="switch-default">Enable notifications</Label>
          </div>

          <div className="space-y-2">
            <Label>Slider - Value: {sliderValue[0]}</Label>
            <Slider 
              value={sliderValue} 
              onValueChange={setSliderValue}
              max={100}
              step={1}
              className="w-full"
            />
          </div>
        </Card>
      </section>

      {/* Metric Components */}
      <section className="space-y-6">
        <div>
          <h2 className="text-3xl font-bold mb-2">Metric Components</h2>
          <p className="text-muted-foreground">Dashboard tiles and visualizations</p>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <MetricTile
            title="Total Users"
            value={1284}
            delta={12.5}
            caption="vs last week"
          />
          <MetricTile
            title="Revenue"
            value={45820}
            format="currency"
            delta={-3.2}
            caption="vs last month"
          />
          <MetricTile
            title="Conversion"
            value={8.4}
            format="percent"
            delta={2.1}
            caption="vs last period"
          />
          <MetricTile
            title="Active Sessions"
            value={342}
            caption="right now"
          />
        </div>
      </section>

      {/* Ring Charts */}
      <section className="space-y-6">
        <div>
          <h2 className="text-3xl font-bold mb-2">Ring Progress</h2>
          <p className="text-muted-foreground">Circular progress indicators</p>
        </div>
        
        <Card className="p-6">
          <div className="flex flex-wrap gap-12 justify-center">
            <Ring percentage={75} label="75%" sublabel="Complete" />
            <Ring percentage={45} label="45%" sublabel="In Progress" size={140} strokeWidth={10} />
            <Ring percentage={90} label="90%" sublabel="Goal" size={100} strokeWidth={6} />
          </div>
        </Card>
      </section>

      {/* Charts */}
      <section className="space-y-6">
        <div>
          <h2 className="text-3xl font-bold mb-2">Charts</h2>
          <p className="text-muted-foreground">Data visualizations</p>
        </div>
        
        <MetricsChart />
      </section>

      {/* Streaks */}
      <section className="space-y-6">
        <div>
          <h2 className="text-3xl font-bold mb-2">Streak Display</h2>
          <p className="text-muted-foreground">Gamification elements</p>
        </div>
        
        <Card className="p-6">
          <div className="flex flex-wrap gap-8 justify-center">
            <StreakDisplay streak={7} />
            <StreakDisplay streak={15} />
            <StreakDisplay streak={30} />
          </div>
        </Card>
      </section>

      {/* Loading States */}
      <section className="space-y-6">
        <div>
          <h2 className="text-3xl font-bold mb-2">Loading States</h2>
          <p className="text-muted-foreground">Skeleton screens for better perceived performance</p>
        </div>
        
        <Card className="p-6 space-y-4">
          <div className="space-y-2">
            <Skeleton className="h-4 w-3/4" />
            <Skeleton className="h-4 w-1/2" />
          </div>
          <div className="flex gap-4">
            <Skeleton className="h-12 w-12 rounded-full" />
            <div className="flex-1 space-y-2">
              <Skeleton className="h-4 w-full" />
              <Skeleton className="h-4 w-2/3" />
            </div>
          </div>
          <Skeleton className="h-32 w-full" />
        </Card>
      </section>

      {/* Status Messages */}
      <section className="space-y-6">
        <div>
          <h2 className="text-3xl font-bold mb-2">Status Messages</h2>
          <p className="text-muted-foreground">Alert and notification styles</p>
        </div>
        
        <div className="space-y-4">
          <StatusAlert
            icon={<CheckCircle2 className="h-5 w-5" />}
            variant="success"
            title="Success"
            message="Your changes have been saved successfully."
          />
          <StatusAlert
            icon={<AlertCircle className="h-5 w-5" />}
            variant="warning"
            title="Warning"
            message="This action cannot be undone. Please proceed with caution."
          />
          <StatusAlert
            icon={<XCircle className="h-5 w-5" />}
            variant="danger"
            title="Error"
            message="Failed to save changes. Please try again."
          />
          <StatusAlert
            icon={<Info className="h-5 w-5" />}
            variant="info"
            title="Information"
            message="System maintenance scheduled for tomorrow at 2 AM UTC."
          />
        </div>
      </section>

      {/* Feed Item Example */}
      <section className="space-y-6">
        <div>
          <h2 className="text-3xl font-bold mb-2">Feed Components</h2>
          <p className="text-muted-foreground">Community and event cards</p>
        </div>
        
        <div className="space-y-4">
          {/* Pinned Announcement */}
          <Card className="p-6 border-primary/20 shadow-md">
            <div className="flex items-start gap-4">
              <div className="p-2 rounded-lg bg-primary/10">
                <Award className="h-5 w-5 text-primary" />
              </div>
              <div className="flex-1 space-y-2">
                <div className="flex items-center gap-2">
                  <Badge className="bg-primary text-primary-foreground">Pinned</Badge>
                  <span className="text-sm text-muted-foreground">2 hours ago</span>
                </div>
                <h3 className="font-semibold">Welcome to TrainU Beta!</h3>
                <p className="text-sm text-muted-foreground">
                  We're excited to have you here. This is a pinned announcement with special styling.
                </p>
                <div className="flex gap-4 text-sm text-muted-foreground">
                  <button className="flex items-center gap-1 hover:text-foreground transition-colors">
                    <Heart className="h-4 w-4" />
                    <span>24</span>
                  </button>
                  <button className="flex items-center gap-1 hover:text-foreground transition-colors">
                    <MessageCircle className="h-4 w-4" />
                    <span>12</span>
                  </button>
                </div>
              </div>
            </div>
          </Card>

          {/* Regular Thread */}
          <Card className="p-6 hover:border-border-hover transition-colors">
            <div className="flex items-start gap-4">
              <div className="h-10 w-10 rounded-full bg-muted flex items-center justify-center">
                <Users className="h-5 w-5 text-muted-foreground" />
              </div>
              <div className="flex-1 space-y-2">
                <div className="flex items-center gap-2">
                  <span className="font-medium">John Trainer</span>
                  <span className="text-sm text-muted-foreground">5 hours ago</span>
                </div>
                <p className="text-sm">Just finished an amazing workout session with my client! 💪</p>
                <div className="flex gap-4 text-sm text-muted-foreground">
                  <button className="flex items-center gap-1 hover:text-foreground transition-colors">
                    <Heart className="h-4 w-4" />
                    <span>8</span>
                  </button>
                  <button className="flex items-center gap-1 hover:text-foreground transition-colors">
                    <MessageCircle className="h-4 w-4" />
                    <span>3</span>
                  </button>
                </div>
              </div>
            </div>
          </Card>

          {/* Event Card */}
          <Card className="p-6 hover:border-border-hover transition-colors overflow-hidden">
            <div className="aspect-video bg-muted rounded-lg mb-4 flex items-center justify-center">
              <Calendar className="h-12 w-12 text-muted-foreground" />
            </div>
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <Badge>Upcoming</Badge>
                <span className="text-sm text-muted-foreground">Tomorrow at 6 PM</span>
              </div>
              <h3 className="font-semibold">Group Training Session</h3>
              <p className="text-sm text-muted-foreground">
                Join us for an intensive HIIT workout. All levels welcome!
              </p>
              <div className="flex items-center justify-between pt-2">
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <Users className="h-4 w-4" />
                  <span>12/20 spots filled</span>
                </div>
                <Button size="sm">Register</Button>
              </div>
            </div>
          </Card>
        </div>
      </section>

      {/* Spacing Scale */}
      <section className="space-y-6">
        <div>
          <h2 className="text-3xl font-bold mb-2">Spacing Scale</h2>
          <p className="text-muted-foreground">Consistent spacing tokens</p>
        </div>
        
        <Card className="p-6 space-y-4">
          {[
            { name: "xs", value: "4px", class: "w-1" },
            { name: "sm", value: "8px", class: "w-2" },
            { name: "md", value: "16px", class: "w-4" },
            { name: "lg", value: "24px", class: "w-6" },
            { name: "xl", value: "32px", class: "w-8" },
            { name: "2xl", value: "48px", class: "w-12" },
            { name: "3xl", value: "64px", class: "w-16" },
          ].map((space) => (
            <div key={space.name} className="flex items-center gap-4">
              <div className="w-16 text-sm font-mono">{space.name}</div>
              <div className="w-16 text-xs text-muted-foreground">{space.value}</div>
              <div className={cn("h-8 bg-primary rounded", space.class)} />
            </div>
          ))}
        </Card>
      </section>

      {/* Border Radius */}
      <section className="space-y-6">
        <div>
          <h2 className="text-3xl font-bold mb-2">Border Radius</h2>
          <p className="text-muted-foreground">Consistent corner rounding</p>
        </div>
        
        <Card className="p-6">
          <div className="grid grid-cols-2 md:grid-cols-5 gap-6">
            {[
              { name: "sm", value: "0.5rem", class: "rounded-sm" },
              { name: "md", value: "0.75rem", class: "rounded-md" },
              { name: "lg", value: "1rem", class: "rounded-lg" },
              { name: "xl", value: "1.5rem", class: "rounded-xl" },
              { name: "2xl", value: "1.5rem", class: "rounded-2xl" },
            ].map((radius) => (
              <div key={radius.name} className="text-center space-y-2">
                <div className={cn("h-24 bg-primary mx-auto", radius.class)} />
                <div className="text-sm font-mono">{radius.name}</div>
                <div className="text-xs text-muted-foreground">{radius.value}</div>
              </div>
            ))}
          </div>
        </Card>
      </section>

      {/* Footer */}
      <div className="pt-12 border-t border-border">
        <p className="text-center text-sm text-muted-foreground">
          TrainU Beta Design System · Synced with Lovable export · All components use consistent tokens
        </p>
      </div>
    </div>
  );
}

// Helper Components
function ColorSwatch({ name, className }: { name: string; className: string }) {
  return (
    <div className={cn("rounded-lg p-4 min-h-[100px] flex items-end", className)}>
      <span className="font-medium text-sm">{name}</span>
    </div>
  );
}

function StatusAlert({ 
  icon, 
  variant, 
  title, 
  message 
}: { 
  icon: React.ReactNode; 
  variant: "success" | "warning" | "danger" | "info"; 
  title: string; 
  message: string;
}) {
  const variantClasses = {
    success: "bg-success-muted border-success/30 text-success",
    warning: "bg-warning-muted border-warning/30 text-warning",
    danger: "bg-danger-muted border-danger/30 text-danger",
    info: "bg-info-muted border-info/30 text-info",
  };

  return (
    <div className={cn("p-4 rounded-lg border", variantClasses[variant])}>
      <div className="flex gap-3">
        <div className="flex-shrink-0 mt-0.5">{icon}</div>
        <div className="flex-1 space-y-1">
          <h4 className="font-semibold">{title}</h4>
          <p className="text-sm opacity-90">{message}</p>
        </div>
      </div>
    </div>
  );
}

