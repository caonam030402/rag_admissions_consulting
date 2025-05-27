import { useEffect } from "react";
import type { FieldErrors } from "react-hook-form";

interface UseScrollToErrorProps {
  errors: FieldErrors;
  behavior?: ScrollBehavior;
  block?: ScrollLogicalPosition;
  inline?: ScrollLogicalPosition;
}

export function useScrollToError({
  errors,
  behavior = "smooth",
  block = "center",
  inline = "nearest",
}: UseScrollToErrorProps) {
  useEffect(() => {
    const errorFields = Object.keys(errors);

    if (errorFields.length === 0) return;

    // Define field order for priority (top to bottom) - based on step flow
    const fieldOrder = [
      // Step 1: Interests & Skills
      "interests",
      "skills",
      // Step 2: Personality Traits
      "personality",
      "strengths",
      "weaknesses",
      // Step 3: Work Environment
      "workEnvironment",
      "stressLevel",
      // Step 4: Learning & Career
      "learningStyle",
      "workStyle",
      "careerGoals",
    ];

    // Find the first error field based on priority order
    const firstErrorField =
      fieldOrder.find((field) => errorFields.includes(field)) || errorFields[0];

    console.log("🔍 Error fields:", errorFields);
    console.log("🎯 First error field to focus:", firstErrorField);
    console.log(
      "📄 All available data-field elements:",
      Array.from(document.querySelectorAll("[data-field]")).map((el) =>
        el.getAttribute("data-field"),
      ),
    );

    // Try multiple strategies to find the target element
    let targetElement: HTMLElement | null = null;

    // Strategy 1: Find by data-field attribute (most reliable for our components)
    targetElement = document.querySelector(`[data-field="${firstErrorField}"]`);
    console.log(
      `🔍 Strategy 1 - Looking for [data-field="${firstErrorField}"]`,
      targetElement,
    );

    // Strategy 2: Find by name attribute
    if (!targetElement) {
      targetElement = document.querySelector(`[name="${firstErrorField}"]`);
      console.log(
        `🔍 Strategy 2 - Looking for [name="${firstErrorField}"]`,
        targetElement,
      );
    }

    // Strategy 3: Find the error message and get its parent container
    if (!targetElement) {
      const errorText = errors[firstErrorField as string]?.message;
      if (errorText) {
        const errorElements = Array.from(
          document.querySelectorAll(
            ".text-red-500, .text-red-600, .text-danger",
          ),
        );
        const errorElement = errorElements.find((el) =>
          el.textContent?.includes(errorText as string),
        );
        if (errorElement) {
          // Find the closest field container
          targetElement = errorElement.closest(
            "[data-field], .space-y-4, .space-y-6, .Card, .card",
          ) as HTMLElement;
        }
      }
    }

    // Strategy 4: Find by heading text content (for sections like "Sở thích của bạn", "Tính cách của bạn", etc.)
    if (!targetElement) {
      const fieldLabels: Record<string, string[]> = {
        interests: ["sở thích", "interests"],
        skills: ["kỹ năng", "skills"],
        personality: ["tính cách", "personality"],
        strengths: ["điểm mạnh", "strengths"],
        weaknesses: ["điểm yếu", "weaknesses"],
        workEnvironment: ["môi trường làm việc", "work environment"],
        stressLevel: ["khả năng chịu áp lực", "stress level"],
        learningStyle: ["phong cách học tập", "learning style"],
        careerGoals: ["mục tiêu nghề nghiệp", "career goals"],
        workStyle: ["phong cách làm việc", "work style"],
      };

      const labels =
        fieldLabels[firstErrorField as keyof typeof fieldLabels] || [];
      for (const label of labels) {
        const headings = document.querySelectorAll("h1, h2, h3, h4, h5, h6");
        for (const heading of headings) {
          if (heading.textContent?.toLowerCase().includes(label)) {
            targetElement = heading.closest(
              "[data-field], .space-y-4, .space-y-6, .Card, .card",
            ) as HTMLElement;
            if (targetElement) break;
          }
        }
        if (targetElement) break;
      }
    }

    // Strategy 5: Find first focusable element in the field container
    if (targetElement) {
      const focusableElement = targetElement.querySelector(
        'input, textarea, select, button, [tabindex]:not([tabindex="-1"]), .Chip',
      ) as HTMLElement;

      if (focusableElement) {
        console.log("✅ Found focusable element:", focusableElement);

        // Add a small delay to ensure DOM is updated and validation has run
        setTimeout(() => {
          // Scroll to the container first
          targetElement!.scrollIntoView({
            behavior,
            block,
            inline,
          });

          // Then focus the first focusable element
          setTimeout(() => {
            focusableElement.focus();

            // Add visual highlight to indicate focus
            focusableElement.style.outline = "2px solid #ef4444";
            focusableElement.style.outlineOffset = "2px";

            // Remove highlight after 2 seconds
            setTimeout(() => {
              focusableElement.style.outline = "";
              focusableElement.style.outlineOffset = "";
            }, 2000);
          }, 200);
        }, 150);
      } else {
        // Fallback: just scroll to the container
        setTimeout(() => {
          targetElement!.scrollIntoView({
            behavior,
            block,
            inline,
          });
        }, 150);
      }
    } else {
      console.warn(
        "❌ Could not find target element for field:",
        firstErrorField,
      );
    }
  }, [errors, behavior, block, inline]);
}
