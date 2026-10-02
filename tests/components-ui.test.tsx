import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import React from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardHeader, CardBody } from "@/components/ui/card";
import { Container } from "@/components/ui/container";
import { SectionHeading } from "@/components/ui/section-heading";
import { SocialIcon, getSocialPlatformConfig, SOCIAL_PLATFORMS } from "@/components/ui/social-icon";

describe("UI Primitives (src/components/ui/)", () => {
  describe("Button", () => {
    it("renders default button with text", () => {
      render(<Button>Click me</Button>);
      const btn = screen.getByRole("button", { name: "Click me" });
      expect(btn).toBeDefined();
      expect(btn.className).toContain("bg-primary-600");
    });

    it("renders as anchor when href is provided", () => {
      render(<Button href="/test">Link Button</Button>);
      const link = screen.getByRole("link", { name: "Link Button" });
      expect(link.getAttribute("href")).toBe("/test");
    });

    it("supports external link attributes", () => {
      render(<Button href="https://example.com">External Link</Button>);
      const link = screen.getByRole("link", { name: "External Link" });
      expect(link.getAttribute("target")).toBe("_blank");
      expect(link.getAttribute("rel")).toBe("noopener noreferrer");
    });

    it("supports variants and sizes", () => {
      render(<Button variant="outline" size="sm">Outline Sm</Button>);
      const btn = screen.getByRole("button", { name: "Outline Sm" });
      expect(btn.className).toContain("border-slate-200");
      expect(btn.className).toContain("text-sm");

      render(<Button variant="secondary" size="lg">Secondary Lg</Button>);
      expect(screen.getByRole("button", { name: "Secondary Lg" }).className).toContain("bg-slate-100");

      render(<Button variant="ghost">Ghost</Button>);
      expect(screen.getByRole("button", { name: "Ghost" }).className).toContain("hover:bg-primary-50");

      render(<Button variant="whatsapp">WhatsApp</Button>);
      expect(screen.getByRole("button", { name: "WhatsApp" }).className).toContain("bg-green-500");

      render(<Button variant="outline-white">Outline White</Button>);
      expect(screen.getByRole("button", { name: "Outline White" }).className).toContain("border-white");
    });

    it("supports disabled state", () => {
      render(<Button disabled>Disabled</Button>);
      const btn = screen.getByRole("button", { name: "Disabled" });
      expect(btn.hasAttribute("disabled")).toBe(true);
    });
  });

  describe("Badge", () => {
    it("renders default badge", () => {
      render(<Badge>Active</Badge>);
      const badge = screen.getByText("Active");
      expect(badge.className).toContain("bg-primary-50");
    });

    it("renders badge variants", () => {
      render(<Badge variant="accent">Accent</Badge>);
      expect(screen.getByText("Accent").className).toContain("bg-pink-50");

      render(<Badge variant="neutral">Neutral</Badge>);
      expect(screen.getByText("Neutral").className).toContain("bg-slate-100");
    });
  });

  describe("Card", () => {
    it("renders card with header and body", () => {
      render(
        <Card>
          <CardHeader>
            <h3>Title</h3>
          </CardHeader>
          <CardBody>
            <p>Body Content</p>
          </CardBody>
        </Card>
      );
      expect(screen.getByText("Title")).toBeDefined();
      expect(screen.getByText("Body Content")).toBeDefined();
    });
  });

  describe("Container", () => {
    it("renders container with children", () => {
      render(<Container>Container Text</Container>);
      expect(screen.getByText("Container Text")).toBeDefined();
    });
  });

  describe("SectionHeading", () => {
    it("renders title and subtitle", () => {
      render(
        <SectionHeading
          title="Section Title"
          subtitle="Section Subtitle"
        />
      );
      expect(screen.getByText("Section Title")).toBeDefined();
      expect(screen.getByText("Section Subtitle")).toBeDefined();
    });
  });

  describe("SocialIcon & getSocialPlatformConfig", () => {
    it("returns platform config for known platforms", () => {
      expect(getSocialPlatformConfig("instagram").label).toBe("Instagram");
      expect(getSocialPlatformConfig("whatsapp").label).toBe("WhatsApp");
      expect(getSocialPlatformConfig("unknown").label).toBe("unknown");
      expect(getSocialPlatformConfig("unknown").id).toBe("website");
    });

    it("renders all defined social platform icons", () => {
      const platforms = [
        "instagram",
        "facebook",
        "tiktok",
        "youtube",
        "whatsapp",
        "telegram",
        "twitter",
        "x",
        "threads",
        "linkedin",
        "website",
        "custom-fallback",
      ];

      for (const p of platforms) {
        const { container } = render(<SocialIcon platform={p} />);
        expect(container.querySelector("svg")).toBeDefined();
      }
    });

    it("exposes SOCIAL_PLATFORMS list", () => {
      expect(SOCIAL_PLATFORMS.length).toBeGreaterThan(5);
    });
  });
});
