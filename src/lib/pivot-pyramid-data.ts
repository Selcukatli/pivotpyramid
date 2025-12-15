// Shared Pivot Pyramid layer definitions
// Used by both the canvas form and the article page

export type LayerId =
  | "customers"
  | "problem"
  | "solution"
  | "technology"
  | "growth";

export interface LayerDefinition {
  id: LayerId;
  name: string;
  color: string;
  textColor: string;
  bgColor: string;
  borderColor: string;
  description: string;
  placeholder: string;
  question: string;
  examples: {
    company: string;
    pivot: string;
  }[];
}

export const PIVOT_PYRAMID_LAYERS: LayerDefinition[] = [
  {
    id: "customers",
    name: "Customers",
    color: "orange",
    textColor: "text-orange-700",
    bgColor: "bg-orange-50",
    borderColor: "border-orange-200",
    description:
      "Who are you building for? This is the foundation of your business.",
    placeholder: "Who are your target customers?",
    question: "Are you solving a real problem for people who will pay?",
    examples: [
      {
        company: "Shopify",
        pivot: "From selling snowboards online to helping others sell online",
      },
      {
        company: "Slack",
        pivot: "From gamers to enterprise teams",
      },
    ],
  },
  {
    id: "problem",
    name: "Problem",
    color: "red",
    textColor: "text-red-700",
    bgColor: "bg-red-50",
    borderColor: "border-red-200",
    description: "What pain point are you addressing for your customers?",
    placeholder: "What pain are you solving?",
    question: "Is this problem urgent enough that customers will pay to solve it?",
    examples: [
      {
        company: "Airbnb",
        pivot: "From paying rent to earning extra income",
      },
      {
        company: "Instagram",
        pivot: "From location check-ins to photo sharing",
      },
    ],
  },
  {
    id: "solution",
    name: "Solution",
    color: "teal",
    textColor: "text-teal-700",
    bgColor: "bg-teal-50",
    borderColor: "border-teal-200",
    description: "How do you solve the problem?",
    placeholder: "How do you solve it?",
    question: "Does your solution directly address the validated problem?",
    examples: [
      {
        company: "YouTube",
        pivot: "From video dating to video sharing platform",
      },
      {
        company: "Twitter",
        pivot: "From podcast directory to microblogging",
      },
    ],
  },
  {
    id: "technology",
    name: "Technology",
    color: "yellow",
    textColor: "text-yellow-700",
    bgColor: "bg-yellow-50",
    borderColor: "border-yellow-200",
    description: "What do you build to deliver the solution?",
    placeholder: "What are you building?",
    question: "Does your technology enable the solution efficiently?",
    examples: [
      {
        company: "Netflix",
        pivot: "From DVD mailing to streaming technology",
      },
      {
        company: "Stripe",
        pivot: "From mobile payments to developer-first APIs",
      },
    ],
  },
  {
    id: "growth",
    name: "Growth",
    color: "purple",
    textColor: "text-purple-700",
    bgColor: "bg-purple-50",
    borderColor: "border-purple-200",
    description: "How do you acquire and retain users?",
    placeholder: "How do you grow?",
    question: "Can you reach your customers cost-effectively?",
    examples: [
      {
        company: "Dropbox",
        pivot: "From paid ads to viral referral program",
      },
      {
        company: "LinkedIn",
        pivot: "From direct sales to network effects",
      },
    ],
  },
];

// Helper to get layer by ID
export function getLayerById(id: LayerId): LayerDefinition | undefined {
  return PIVOT_PYRAMID_LAYERS.find((layer) => layer.id === id);
}

// Layer order from bottom to top (foundation to top)
export const LAYER_ORDER: LayerId[] = [
  "customers",
  "problem",
  "solution",
  "technology",
  "growth",
];

// Get layers above a given layer (for cascade effect)
export function getLayersAbove(id: LayerId): LayerId[] {
  const index = LAYER_ORDER.indexOf(id);
  if (index === -1) return [];
  return LAYER_ORDER.slice(index + 1);
}

// Get layers below a given layer
export function getLayersBelow(id: LayerId): LayerId[] {
  const index = LAYER_ORDER.indexOf(id);
  if (index === -1) return [];
  return LAYER_ORDER.slice(0, index);
}
