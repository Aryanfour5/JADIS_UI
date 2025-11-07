// src/components/DetailedReasoningCard.tsx

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { AlertCircle, CheckCircle, XCircle, HelpCircle, BookOpen } from "lucide-react";
import React from "react";

interface DetailedReasoningCardProps {
  reasoning: string;
  recommendation: "GRANT" | "DENY" | "HUMAN_INTERVENTION_REQUIRED";
}

/**
 * Parse and format detailed reasoning from backend
 */
const parseReasoningText = (text: string): React.ReactNode[] => {
  const sections: React.ReactNode[] = [];
  const lines = text.split("\n");
  let currentSection: string[] = [];

  lines.forEach((line, index) => {
    if (line.match(/^\*\*\d+\./)) {
      // New numbered section
      if (currentSection.length > 0) {
        sections.push(
          <div key={`section-${sections.length}`} className="mb-6">
            {formatSection(currentSection.join("\n"))}
          </div>
        );
        currentSection = [];
      }
      currentSection.push(line);
    } else {
      currentSection.push(line);
    }

    // Add last section
    if (index === lines.length - 1 && currentSection.length > 0) {
      sections.push(
        <div key={`section-${sections.length}`} className="mb-6">
          {formatSection(currentSection.join("\n"))}
        </div>
      );
    }
  });

  return sections;
};

/**
 * Format individual section with proper styling
 */
const formatSection = (sectionText: string): React.ReactNode => {
  // Extract title and content
  const titleMatch = sectionText.match(/\*\*(.+?):\*\*/);
  const title = titleMatch ? titleMatch[1] : "";
  const content = sectionText.replace(/\*\*(.+?):\*\*/, "").trim();

  // Determine section icon and color
  const getSectionStyle = (title: string) => {
    if (title.includes("Summary")) {
      return {
        icon: <BookOpen className="w-5 h-5" />,
        color: "text-blue-600",
        bgColor: "bg-blue-50",
        borderColor: "border-blue-200",
      };
    }
    if (title.includes("Legal Framework")) {
      return {
        icon: <BookOpen className="w-5 h-5" />,
        color: "text-indigo-600",
        bgColor: "bg-indigo-50",
        borderColor: "border-indigo-200",
      };
    }
    if (title.includes("Precedent")) {
      return {
        icon: <HelpCircle className="w-5 h-5" />,
        color: "text-amber-600",
        bgColor: "bg-amber-50",
        borderColor: "border-amber-200",
      };
    }
    if (title.includes("Favoring")) {
      return {
        icon: <CheckCircle className="w-5 h-5" />,
        color: "text-green-600",
        bgColor: "bg-green-50",
        borderColor: "border-green-200",
      };
    }
    if (title.includes("Against")) {
      return {
        icon: <XCircle className="w-5 h-5" />,
        color: "text-red-600",
        bgColor: "bg-red-50",
        borderColor: "border-red-200",
      };
    }
    if (title.includes("Reasoning") || title.includes("Conclusion")) {
      return {
        icon: <AlertCircle className="w-5 h-5" />,
        color: "text-purple-600",
        bgColor: "bg-purple-50",
        borderColor: "border-purple-200",
      };
    }
    return {
      icon: <BookOpen className="w-5 h-5" />,
      color: "text-gray-600",
      bgColor: "bg-gray-50",
      borderColor: "border-gray-200",
    };
  };

  const style = getSectionStyle(title);

  return (
    <div className={`${style.bgColor} border-l-4 ${style.borderColor} p-6 rounded-lg`}>
      <div className={`flex items-center gap-3 mb-4`}>
        <div className={style.color}>{style.icon}</div>
        <h3 className={`text-lg font-bold ${style.color}`}>{title}</h3>
      </div>

      <div className="text-gray-700 leading-relaxed space-y-3">
        {formatContent(content)}
      </div>
    </div>
  );
};

/**
 * Format content with bullet points and emphasis
 * ✅ FIXED: Now properly converts **text** to bold
 */
const formatContent = (content: string): React.ReactNode => {
  const bulletPoints = content.split(/\n(?=\s*[\*\-])/);

  return bulletPoints.map((paragraph, index) => {
    if (paragraph.trim().startsWith("*") || paragraph.trim().startsWith("-")) {
      // Bullet point
      let text = paragraph.replace(/^[\s\*\-]+/, "").trim();
      
      return (
        <div key={index} className="flex gap-3">
          <span className="text-blue-500 font-bold mt-1 flex-shrink-0">•</span>
          <p className="text-sm text-gray-700">
            {formatBoldText(text)}
          </p>
        </div>
      );
    } else if (paragraph.trim()) {
      // Regular paragraph
      return (
        <p key={index} className="text-sm text-gray-700">
          {formatBoldText(paragraph.trim())}
        </p>
      );
    }
    return null;
  });
};

/**
 * ✅ FIXED: Format bold text (**text** → <strong>)
 * This properly converts markdown bold to HTML bold
 */
const formatBoldText = (text: string): React.ReactNode => {
  const parts: React.ReactNode[] = [];
  let lastIndex = 0;

  // Regex to match **text** pattern
  const boldRegex = /\*\*([^*]+?)\*\*/g;
  let match;

  while ((match = boldRegex.exec(text)) !== null) {
    // Add text before bold
    if (match.index > lastIndex) {
      parts.push(text.substring(lastIndex, match.index));
    }

    // Add bold text
    parts.push(
      <strong key={`bold-${match.index}`} className="font-bold text-gray-900">
        {match[1]}
      </strong>
    );

    lastIndex = boldRegex.lastIndex;
  }

  // Add remaining text
  if (lastIndex < text.length) {
    parts.push(text.substring(lastIndex));
  }

  // If no bold text found, return original text
  return parts.length > 0 ? parts : text;
};

/**
 * Main Component
 */
export const DetailedReasoningCard = ({
  reasoning,
  recommendation,
}: DetailedReasoningCardProps) => {
  const recommendationStyle = {
    GRANT: {
      icon: <CheckCircle className="w-6 h-6 text-green-600" />,
      title: "Recommendation: GRANT",
      color: "text-green-600",
    },
    DENY: {
      icon: <XCircle className="w-6 h-6 text-red-600" />,
      title: "Recommendation: DENY",
      color: "text-red-600",
    },
    HUMAN_INTERVENTION_REQUIRED: {
      icon: <AlertCircle className="w-6 h-6 text-amber-600" />,
      title: "Recommendation: HUMAN INTERVENTION REQUIRED",
      color: "text-amber-600",
    },
  }[recommendation];

  return (
    <Card className="border-2 border-gray-200">
      <CardHeader className="bg-gradient-to-r from-blue-50 to-indigo-50 border-b">
        <div className="flex items-center gap-3">
          {recommendationStyle.icon}
          <div>
            <CardTitle className="text-2xl font-bold text-gray-900">
              Detailed Legal Analysis & Reasoning
            </CardTitle>
            <p className={`text-sm font-semibold mt-1 ${recommendationStyle.color}`}>
              {recommendationStyle.title}
            </p>
          </div>
        </div>
      </CardHeader>

      <CardContent className="pt-8 pb-8">
        <div className="space-y-8">
          {/* Introduction */}
          <div className="bg-blue-50 border-l-4 border-blue-300 p-6 rounded-lg">
            <p className="text-gray-700 text-base leading-relaxed">
              The following is a comprehensive legal analysis based on the bail application, 
              applicable legal provisions, and the system's algorithmic assessment of relevant 
              factors that influence the bail decision.
            </p>
          </div>

          {/* Parsed Content */}
          <div className="space-y-6">
            {parseReasoningText(reasoning)}
          </div>

          {/* Disclaimer */}
          <div className="bg-amber-50 border-l-4 border-amber-400 p-6 rounded-lg">
            <p className="text-sm text-gray-700 leading-relaxed">
              <strong className="text-amber-800">⚖️ Legal Disclaimer:</strong> This analysis 
              is generated by an AI system and is intended for informational purposes only. 
              It should not be considered as legal advice. All bail decisions must be made 
              by qualified legal professionals and judicial authorities after thorough 
              review of the complete case file, evidence, and applicable legal provisions.
            </p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};
